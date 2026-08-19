'use server'

import { requireAuth } from '@/lib/auth'
import { getTenantId, tenantWhere } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function crearDocumentoLegal(formData: FormData) {
  await requireAuth()
  const empresaId = await getTenantId()
  const titulo = formData.get('titulo') as string
  const tipo_documento = formData.get('tipo_documento') as string
  const estado = (formData.get('estado') as string) || 'Borrador'
  const contenido = formData.get('contenido') as string || null
  const cliente_id = formData.get('cliente_id') as string || null
  const propiedad_id = formData.get('propiedad_id') as string || null
  const agente_id = formData.get('agente_id') as string || null
  const fecha_vencimiento = formData.get('fecha_vencimiento') as string || null

  if (!titulo || !tipo_documento) {
    throw new Error('Título y Tipo de Documento son requeridos')
  }

  // Validate linked entities belong to this tenant
  if (cliente_id) {
    const clienteValido = await prisma.cliente.findFirst({ where: { id: cliente_id, empresa_id: empresaId } })
    if (!clienteValido) throw new Error('El cliente seleccionado no pertenece a tu empresa')
  }
  if (propiedad_id) {
    const propiedadValida = await prisma.propiedad.findFirst({
      where: { id: propiedad_id, OR: [{ empresa_id: empresaId }, { multiempresa: true }] }
    })
    if (!propiedadValida) throw new Error('La propiedad seleccionada no pertenece a tu empresa ni es multiempresa')
  }
  if (agente_id) {
    const agenteValido = await prisma.agente.findFirst({ where: { id: agente_id, empresa_id: empresaId } })
    if (!agenteValido) throw new Error('El agente seleccionado no pertenece a tu empresa')
  }

  const doc = await prisma.documentoLegal.create({
    data: {
      empresa_id: empresaId,
      titulo,
      tipo_documento,
      estado,
      contenido,
      cliente_id,
      propiedad_id,
      agente_id,
      fecha_vencimiento: fecha_vencimiento ? new Date(fecha_vencimiento) : null
    }
  })

  revalidatePath('/documentos')
  if (cliente_id) revalidatePath(`/clientes/${cliente_id}`)
  if (propiedad_id) revalidatePath(`/propiedades/${propiedad_id}`)
  if (agente_id) revalidatePath(`/agentes/${agente_id}`)

  redirect('/documentos')
}

export async function actualizarEstadoDocumento(documentoId: string, nuevoEstado: string) {
  const empresaId = await getTenantId()
  try {
    const doc = await prisma.documentoLegal.updateMany({
      where: { id: documentoId, empresa_id: empresaId },
      data: { estado: nuevoEstado }
    })

    revalidatePath('/documentos')
    revalidatePath(`/documentos/${documentoId}`)
    return { success: true }
  } catch (error) {
    console.error('Error actualizando estado del documento:', error)
    return { success: false, error: 'Error al actualizar el estado' }
  }
}

export async function eliminarDocumentoLegal(documentoId: string) {
  const empresaId = await getTenantId()
  try {
    await prisma.documentoLegal.deleteMany({
      where: { id: documentoId, empresa_id: empresaId }
    })

    revalidatePath('/documentos')
    return { success: true }
  } catch (error) {
    console.error('Error eliminando documento:', error)
    return { success: false, error: 'Error al eliminar el documento' }
  }
}

export async function getDocumentosLegales() {
  const empresaId = await getTenantId()
  try {
    const documentos = await prisma.documentoLegal.findMany({
      where: { empresa_id: empresaId },
      orderBy: { fecha_creacion: 'desc' },
      include: {
        cliente: { select: { id: true, nombre: true } },
        propiedad: { select: { id: true, titulo: true } },
        agente: { select: { id: true, nombre: true } }
      }
    })
    return documentos
  } catch (error) {
    console.error('Error obteniendo documentos:', error)
    return []
  }
}

export async function getDocumentoLegal(id: string) {
  const empresaId = await getTenantId()
  try {
    const documento = await prisma.documentoLegal.findFirst({
      where: { id, empresa_id: empresaId },
      include: {
        cliente: true,
        propiedad: true,
        agente: true
      }
    })
    return documento
  } catch (error) {
    console.error('Error obteniendo documento:', error)
    return null
  }
}

