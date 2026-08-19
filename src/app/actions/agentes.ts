'use server'

import { requireAuth } from '@/lib/auth'
import { getTenantId, tenantWhere } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function assignAgentToClient(clienteId: string, agenteId: string) {
  const session = await requireAuth()
  const empresaId = await getTenantId()
  
  const isCompanyAdmin = session.isGlobalAdmin || session.rol === 'Agente Owner' || session.rol === 'Agente Admin'
  if (!isCompanyAdmin) {
    return { success: false, error: 'Solo los Agentes Owner o Admin pueden cambiar la asignación de agente de un cliente.' }
  }

  try {
    const agente = await prisma.agente.findFirst({ where: { id: agenteId, empresa_id: empresaId } })
    const cliente = await prisma.cliente.findFirst({ where: { id: clienteId, empresa_id: empresaId } })

    if (!agente || !cliente) {
      return { success: false, error: 'Cliente o Agente no encontrado' }
    }

    const previousAgenteId = cliente.agente_asignado_id

    await prisma.cliente.updateMany({
      where: { id: clienteId, empresa_id: empresaId },
      data: {
        agente_asignado_id: agenteId,
        estado: cliente.estado === 'Nuevo' ? 'En Asignación' : cliente.estado
      }
    })

    // Transfer active opportunities (pipeline deals) of this client to the new agent
    await prisma.venta.updateMany({
      where: {
        cliente_id: clienteId,
        empresa_id: empresaId,
        estado_venta: {
          notIn: ['Cerrado/Ganado', 'Perdido']
        }
      },
      data: {
        agente_id: agenteId
      }
    })

    await prisma.actividadAgente.create({
      data: {
        agente_id: agenteId,
        tipo: 'Asignación',
        descripcion: `Cliente "${cliente.nombre || cliente.telefono}" fue reasignado a este agente`
      }
    })

    revalidatePath('/ventas')
    revalidatePath('/analiticas')
    revalidatePath('/clientes')
    revalidatePath(`/clientes/${clienteId}`)
    revalidatePath(`/agentes/${agenteId}`)
    if (previousAgenteId) revalidatePath(`/agentes/${previousAgenteId}`)
    revalidatePath('/agentes')
    revalidatePath('/')

    return { success: true }
  } catch (error) {
    console.error('Error asignando agente:', error)
    return { success: false, error: 'Error al asignar agente' }
  }
}
