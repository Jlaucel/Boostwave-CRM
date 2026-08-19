'use server'

import { prisma } from '@/lib/prisma'
import { getTenantId } from '@/lib/tenant'
import { requireAuth } from '@/lib/auth'
import { canDeactivateUser, canChangeRole, Rol } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'

export async function cambiarRolAgenteAction(agenteId: string, nuevoRol: 'Agente Admin' | 'Agente Normal') {
  const session = await requireAuth()
  const empresaId = await getTenantId()
  const actorRol = (session.isGlobalAdmin ? 'Admin Owner Global' : session.rol) as Rol | 'Admin Owner Global'

  // Find target agente link in this empresa
  const targetLink = await prisma.usuarioEmpresa.findFirst({
    where: { agente_id: agenteId, empresa_id: empresaId },
    include: { agente: true, usuario: true }
  })

  if (!targetLink) throw new Error('Agente no encontrado en la empresa')

  if (!canChangeRole(actorRol, targetLink.rol as Rol, nuevoRol)) {
    throw new Error('No tienes permisos suficientes para realizar este cambio de rol')
  }

  await prisma.usuarioEmpresa.update({
    where: { id: targetLink.id },
    data: { rol: nuevoRol }
  })

  // Log audit
  await prisma.auditLog.create({
    data: {
      accion: 'CAMBIO_ROL_AGENTE',
      descripcion: `Rol de agente "${targetLink.agente?.nombre}" cambiado de "${targetLink.rol}" a "${nuevoRol}"`,
      usuario_id: session.userId,
      empresa_id: empresaId
    }
  })

  revalidatePath('/agentes')
  revalidatePath(`/agentes/${agenteId}`)
}

export async function toggleEstadoAgenteAction(agenteId: string) {
  const session = await requireAuth()
  const empresaId = await getTenantId()
  const actorRol = (session.isGlobalAdmin ? 'Admin Owner Global' : session.rol) as Rol | 'Admin Owner Global'

  const targetLink = await prisma.usuarioEmpresa.findFirst({
    where: { agente_id: agenteId, empresa_id: empresaId },
    include: { agente: true }
  })

  if (!targetLink || !targetLink.agente) throw new Error('Agente no encontrado')

  if (!canDeactivateUser(actorRol, targetLink.rol as Rol)) {
    throw new Error('No tienes permisos para cambiar el estado de este agente')
  }

  const nuevoEstado = targetLink.agente.estado === 'Activo' ? 'Inactivo' : 'Activo'

  await prisma.agente.update({
    where: { id: agenteId },
    data: { estado: nuevoEstado }
  })

  await prisma.auditLog.create({
    data: {
      accion: nuevoEstado === 'Activo' ? 'ACTIVAR_AGENTE' : 'DESACTIVAR_AGENTE',
      descripcion: `Agente "${targetLink.agente.nombre}" ${nuevoEstado.toLowerCase()}`,
      usuario_id: session.userId,
      empresa_id: empresaId
    }
  })

  revalidatePath('/agentes')
  revalidatePath(`/agentes/${agenteId}`)
}
