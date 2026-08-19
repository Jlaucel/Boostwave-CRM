'use server'

import { prisma } from '@/lib/prisma'
import { getTenantId } from '@/lib/tenant'
import { requireRole, requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function toggleMultiempresaAction(propiedadId: string, comision?: number) {
  // Only Owner and Admin can publish to multi-empresa
  const session = await requireRole(['Agente Owner', 'Agente Admin'])
  const empresaId = await getTenantId()

  const propiedad = await prisma.propiedad.findFirst({
    where: { id: propiedadId, empresa_id: empresaId }
  })

  if (!propiedad) throw new Error('Propiedad no encontrada en tu empresa')

  const nuevoEstado = !propiedad.multiempresa

  await prisma.propiedad.update({
    where: { id: propiedadId },
    data: {
      multiempresa: nuevoEstado,
      comision_multiempresa: nuevoEstado ? (comision || 2.5) : null
    }
  })

  // Log audit
  await prisma.auditLog.create({
    data: {
      accion: nuevoEstado ? 'PUBLICAR_MULTIEMPRESA' : 'DESPUBLICAR_MULTIEMPRESA',
      descripcion: `Propiedad "${propiedad.titulo}" ${nuevoEstado ? 'publicada' : 'retirada'} de la red multiempresa`,
      usuario_id: session.userId,
      empresa_id: empresaId
    }
  })

  revalidatePath('/propiedades')
  revalidatePath(`/propiedades/${propiedadId}`)
}

export async function asignarAgenteMultiempresaAction(propiedadId: string, agenteId: string | null) {
  const session = await requireAuth()
  const empresaId = await getTenantId()

  // Only Agente Owner, Agente Admin or Global Admin can assign agents
  if (!session.isGlobalAdmin && session.rol !== 'Agente Owner' && session.rol !== 'Agente Admin') {
    return { success: false, error: 'No tienes permisos para asignar agentes a esta propiedad' }
  }

  const propiedad = await prisma.propiedad.findUnique({
    where: { id: propiedadId }
  })

  if (!propiedad) return { success: false, error: 'Propiedad no encontrada' }

  // Check if agent belongs to current company
  if (agenteId) {
    const agente = await prisma.agente.findFirst({
      where: { id: agenteId, empresa_id: empresaId }
    })
    if (!agente) return { success: false, error: 'El agente seleccionado no pertenece a tu empresa' }
  }

  if (propiedad.empresa_id === empresaId) {
    // Owner company -> update main propiedad.agente_asignado_id
    await prisma.propiedad.update({
      where: { id: propiedadId },
      data: { agente_asignado_id: agenteId }
    })
  } else {
    // Collaborating company (multiempresa) -> upsert PropiedadEmpresaAgente for current empresaId
    if (!propiedad.multiempresa) {
      return { success: false, error: 'Esta propiedad no está disponible en la red multiempresa' }
    }

    await prisma.propiedadEmpresaAgente.upsert({
      where: {
        propiedad_id_empresa_id: { propiedad_id: propiedadId, empresa_id: empresaId }
      },
      create: {
        propiedad_id: propiedadId,
        empresa_id: empresaId,
        agente_id: agenteId,
      },
      update: {
        agente_id: agenteId,
      }
    })
  }

  await prisma.auditLog.create({
    data: {
      accion: 'ASIGNAR_AGENTE_LOCAL',
      descripcion: `Agente local asignado en propiedad "${propiedad.titulo}"`,
      usuario_id: session.userId,
      empresa_id: empresaId
    }
  })

  revalidatePath('/propiedades')
  revalidatePath(`/propiedades/${propiedadId}`)
  return { success: true }
}

