'use server'

import { requireAuth } from '@/lib/auth'
import { getTenantId, tenantWhere } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { isTransitionAllowed } from '@/config/pipeline'
import { canReopenCerrado } from '@/lib/permissions'

export async function cambiarEtapaPipeline(
  ventaId: string, 
  nuevaEtapa: string,
  payload?: { 
    motivo_perdida?: string; 
    fecha_visita?: string; 
    monto_oferta?: number;
    is_override?: boolean;
    razon_override?: string;
  }
) {
  const empresaId = await getTenantId()
  const session = await requireAuth()
  const isCompanyAdmin = session.isGlobalAdmin || session.rol === 'Agente Owner' || session.rol === 'Agente Admin'

  try {

    // 1. Fetch the current venta with all related data
    const venta = await prisma.venta.findFirst({
      where: { id: ventaId, empresa_id: empresaId },
      include: {
        cliente: true,
        propiedad: true,
        agente: true
      }
    })

    if (!venta) {
      return { success: false, error: 'Oportunidad no encontrada' }
    }

    if (!isCompanyAdmin && venta.agente_id !== session.agenteId) {
      return { success: false, error: 'No tienes permisos para modificar esta oportunidad' }
    }

    const etapaAnterior = venta.estado_venta

    // Don't do anything if same stage
    if (etapaAnterior === nuevaEtapa) {
      return { success: true }
    }

    if (etapaAnterior === 'Cerrado/Ganado') {
      if (!canReopenCerrado(session.rol as import('@/lib/permissions').Rol | 'Admin Owner Global' | null, session.isGlobalAdmin)) {
        return { success: false, error: 'No tienes permisos para reabrir oportunidades ganadas. Contacta a un administrador.' }
      }
    }

    if (etapaAnterior === 'Perdido' && nuevaEtapa !== 'Perdido') {
      if (!isCompanyAdmin) {
        return { success: false, error: 'Solo un administrador o owner puede reactivar una oportunidad perdida.' }
      }
    }

    // Transition Logic Validation
    const transitionAllowed = isTransitionAllowed(etapaAnterior, nuevaEtapa)
    if (!transitionAllowed) {
      if (!payload?.is_override) {
        return { success: false, error: 'Este movimiento no sigue el flujo esperado. Se requiere confirmación y razón.' }
      }
      if (!payload?.razon_override || payload.razon_override.trim().length < 10) {
        return { success: false, error: 'Debe especificar una razón válida (mínimo 10 caracteres) para este movimiento.' }
      }
    }

    if (!venta.propiedad_id && nuevaEtapa !== 'Contacto Inicial' && nuevaEtapa !== 'Perdido') {
      return { success: false, error: 'Debe asignar una propiedad a la oportunidad para avanzar a esta etapa.' }
    }

    if ((nuevaEtapa === 'Oferta Realizada' || nuevaEtapa === 'Negociación' || nuevaEtapa === 'Cerrado/Ganado') && !venta.monto_oferta && !payload?.monto_oferta) {
      return { success: false, error: 'Debe especificar el precio pactado (monto oferta) para avanzar a esta etapa.' }
    }

    // 2. Execute everything in a single transaction
    await prisma.$transaction(async (tx) => {
      // Base update for the Venta
      const ventaUpdate: any = {
        estado_venta: nuevaEtapa,
        fecha_actualizacion_estado: new Date()
      }

      if (payload?.motivo_perdida) ventaUpdate.motivo_perdida = payload.motivo_perdida
      if (payload?.fecha_visita) ventaUpdate.fecha_visita = new Date(payload.fecha_visita)
      if (payload?.monto_oferta) ventaUpdate.monto_oferta = payload.monto_oferta

      // Clear motivo_perdida if reopened
      if (nuevaEtapa !== 'Perdido' && etapaAnterior === 'Perdido') {
        ventaUpdate.motivo_perdida = null
      }

      // === REGLA CALENDARIO: CLEAR-ON-EXIT ===
      // Si salimos de Visita Programada hacia cualquier otro estado, limpiamos la fecha para sacarlo del calendario
      if (etapaAnterior === 'Visita Programada' && nuevaEtapa !== 'Visita Programada') {
        ventaUpdate.fecha_visita = null
      }

      // === BLOQUEO/LIBERACIÓN DE INVENTARIO ===
      let nuevoEstadoPropiedad = null
      if (nuevaEtapa === 'Cerrado/Ganado') {
        nuevoEstadoPropiedad = 'Vendida'
      } else if (etapaAnterior === 'Cerrado/Ganado' && nuevaEtapa !== 'Cerrado/Ganado') {
        nuevoEstadoPropiedad = 'Disponible'
      }

      if (nuevoEstadoPropiedad && venta.propiedad_id && venta.propiedad) {
        await tx.propiedad.updateMany({
          where: { id: venta.propiedad_id, empresa_id: empresaId },
          data: { estado: nuevoEstadoPropiedad }
        })

        await tx.historialPropiedad.create({
          data: {
            propiedad_id: venta.propiedad_id,
            campo_modificado: 'estado',
            valor_anterior: venta.propiedad.estado,
            valor_nuevo: nuevoEstadoPropiedad
          }
        })
      }

      // === CERRADO/GANADO ===
      if (nuevaEtapa === 'Cerrado/Ganado') {
        // Calculate commission
        const comisionPorcentaje = venta.agente?.comision_porcentaje || 3.0
        const montoComision = venta.propiedad?.precio ? venta.propiedad.precio * (comisionPorcentaje / 100) : 0

        ventaUpdate.fecha_cierre = new Date()
        ventaUpdate.monto_comision = montoComision

        // Update Client → "Cierre Exitoso"
        await tx.cliente.updateMany({
          where: { id: venta.cliente_id, empresa_id: empresaId },
          data: { estado: 'Cierre Exitoso' }
        })
      }

      // === PERDIDO ===
      if (nuevaEtapa === 'Perdido') {
        // Update Client → "Inactivo"
        await tx.cliente.updateMany({
          where: { id: venta.cliente_id, empresa_id: empresaId },
          data: { estado: 'Inactivo' }
        })
      }

      // Update the Venta record
      await tx.venta.updateMany({
        where: { id: ventaId, empresa_id: empresaId },
        data: ventaUpdate
      })

      // Register the status transition in the specific history table
      await tx.historialEstadoVenta.create({
        data: {
          venta_id: ventaId,
          estado_anterior: etapaAnterior,
          estado_nuevo: nuevaEtapa,
          usuario_id: session.userId,
          is_override: payload?.is_override || false,
          razon: payload?.is_override ? payload.razon_override : null
        }
      })

      // Register activity for the agent (if assigned)
      if (venta.agente_id) {
        const clienteName = venta.cliente.nombre || venta.cliente.telefono
        const propiedadTitulo = venta.propiedad?.titulo || 'Propiedad'

        let tipoActividad = 'Pipeline'
        let descripcion = `Movió "${clienteName}" de "${etapaAnterior}" a "${nuevaEtapa}" en "${propiedadTitulo}"`

        if (nuevaEtapa === 'Cerrado/Ganado') {
          tipoActividad = 'Cierre'
          const comisionPorcentaje = venta.agente?.comision_porcentaje || 3.0
          const montoComision = venta.propiedad?.precio ? venta.propiedad.precio * (comisionPorcentaje / 100) : 0
          descripcion = `¡Cerró venta! "${propiedadTitulo}" por $${(venta.propiedad?.precio || 0).toLocaleString()} con "${clienteName}". Comisión: $${montoComision.toLocaleString()}`
        } else if (nuevaEtapa === 'Perdido') {
          tipoActividad = 'Perdido'
          const motivo = payload?.motivo_perdida ? ` (Motivo: ${payload.motivo_perdida})` : ''
          descripcion = `Oportunidad perdida: "${clienteName}" ya no está interesado en "${propiedadTitulo}"${motivo}`
        } else if (nuevaEtapa === 'Visita Programada') {
          tipoActividad = 'Visita'
          descripcion = `Visita programada para "${clienteName}" en "${propiedadTitulo}"`
        } else if (nuevaEtapa === 'Oferta Realizada') {
          tipoActividad = 'Oferta'
          descripcion = `Oferta realizada a "${clienteName}" por "${propiedadTitulo}" ($${(venta.propiedad?.precio || 0).toLocaleString()})`
        }

        await tx.actividadAgente.create({
          data: {
            agente_id: venta.agente_id,
            tipo: tipoActividad,
            descripcion
          }
        })
      }
    })

    // 3. Revalidate all affected paths
    revalidatePath('/ventas')
    revalidatePath('/')
    revalidatePath(`/clientes/${venta.cliente_id}`)
    revalidatePath(`/propiedades/${venta.propiedad_id}`)
    if (venta.agente_id) {
      revalidatePath(`/agentes/${venta.agente_id}`)
    }
    revalidatePath('/agentes')
    revalidatePath('/clientes')
    revalidatePath('/propiedades')

    return { success: true }
  } catch (error) {
    console.error('Error cambiando etapa del pipeline:', error)
    return { success: false, error: 'Error interno del servidor' }
  }
}

export async function reasignarVenta(ventaId: string, nuevoAgenteId: string) {
  const empresaId = await getTenantId()
  const session = await requireAuth()
  
  try {
    const venta = await prisma.venta.findFirst({
      where: { id: ventaId, empresa_id: empresaId },
      include: { agente: true }
    })
    if (!venta) return { success: false, error: 'Venta no encontrada' }

    const isCompanyAdmin = session.isGlobalAdmin || session.rol === 'Agente Owner' || session.rol === 'Agente Admin'
    if (!isCompanyAdmin && venta.agente_id !== session.agenteId) {
      return { success: false, error: 'No tienes permisos para reasignar esta oportunidad' }
    }

    const nuevoAgente = await prisma.agente.findFirst({
      where: { id: nuevoAgenteId, empresa_id: empresaId }
    })
    if (!nuevoAgente) return { success: false, error: 'Agente no encontrado' }

    await prisma.$transaction(async (tx) => {
      // Update all ventas of the same client to the new agent
      await tx.venta.updateMany({
        where: { cliente_id: venta.cliente_id, empresa_id: empresaId },
        data: { agente_id: nuevoAgenteId }
      })

      // Update the client's assigned agent
      await tx.cliente.update({
        where: { id: venta.cliente_id },
        data: { agente_asignado_id: nuevoAgenteId }
      })

      const desc = venta.agente 
        ? `Reasignada de ${venta.agente.nombre} a ${nuevoAgente.nombre}` 
        : `Asignada a ${nuevoAgente.nombre}`
      
      await tx.actividadVenta.create({
        data: {
          venta_id: ventaId,
          tipo: 'CAMBIO_AGENTE',
          descripcion: desc,
          usuario_id: session.userId
        }
      })
    })

    revalidatePath(`/ventas/${ventaId}`)
    revalidatePath('/ventas')
    if (venta.cliente_id) revalidatePath(`/clientes/${venta.cliente_id}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error reasignando venta:', error)
    return { success: false, error: 'Error interno del servidor' }
  }
}
