'use server'

import { requireAuth } from '@/lib/auth'
import { getTenantId, tenantWhere } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { getConfiguracionSistema } from '@/app/actions/configuracion'

export async function getAnalyticsData() {
  const session = await requireAuth()
  const empresaId = await getTenantId()
  const now = new Date()
  
  const isCompanyAdmin = session.isGlobalAdmin || session.rol === 'Agente Owner' || session.rol === 'Agente Admin'
  const agenteFilterId = !isCompanyAdmin ? (session.agenteId || 'non-existent-agente-id') : undefined

  let config: any = { dias_estancamiento_pipeline: 14 }
  if (isCompanyAdmin) {
    try {
      config = await getConfiguracionSistema()
    } catch {}
  }
  
  const diasEstancamiento = config.dias_estancamiento_pipeline || 14
  const fechaEstancamientoLimite = new Date(now.getTime() - diasEstancamiento * 24 * 60 * 60 * 1000)

  const ventasWhere: any = { empresa_id: empresaId }
  const clientesWhere: any = { empresa_id: empresaId }
  const agentesWhere: any = { empresa_id: empresaId }

  if (!isCompanyAdmin) {
    ventasWhere.agente_id = agenteFilterId
    clientesWhere.agente_asignado_id = agenteFilterId
    agentesWhere.id = agenteFilterId
  }

  const [
    ventas,
    clientes,
    agentes,
    propiedades,
    clientesSinAgente
  ] = await Promise.all([
    prisma.venta.findMany({
      where: ventasWhere,
      include: {
        cliente: true,
        propiedad: true,
        agente: true
      },
      orderBy: { fecha_interes: 'desc' }
    }),
    prisma.cliente.findMany({
      where: clientesWhere,
      include: { agente: true, ventas: true }
    }),
    prisma.agente.findMany({
      where: agentesWhere,
      include: {
        ventas: { include: { propiedad: true } },
        clientes: true,
        actividades: { orderBy: { fecha: 'desc' }, take: 5 }
      }
    }),
    prisma.propiedad.findMany({
      where: { empresa_id: empresaId }
    }),
    isCompanyAdmin ? prisma.cliente.findMany({
      where: { agente_asignado_id: null, empresa_id: empresaId },
      include: { ventas: { include: { propiedad: true } } }
    }) : Promise.resolve([])
  ])

  // 1. Clientes Estancados (Ventas en proceso con más del límite de días configurado)
  const ventasEstancadas = ventas.filter(v => {
    if (v.estado_venta === 'Cerrado/Ganado' || v.estado_venta === 'Perdido') return false
    const fechaVenta = new Date(v.fecha_interes)
    return fechaVenta < fechaEstancamientoLimite
  })

  // 2. Ventas Ganadas vs Perdedoras vs En Proceso
  const ventasGanadas = ventas.filter(v => v.estado_venta === 'Cerrado/Ganado')
  const ventasPerdidas = ventas.filter(v => v.estado_venta === 'Perdido')
  const ventasEnProceso = ventas.filter(v => v.estado_venta !== 'Cerrado/Ganado' && v.estado_venta !== 'Perdido')

  const volumenVentasGanadas = ventasGanadas.reduce((acc, v) => acc + (v.propiedad?.precio || 0), 0)
  const comisionesTotales = ventasGanadas.reduce((acc, v) => acc + (v.monto_comision || (v.propiedad?.precio || 0) * 0.03), 0)

  // 3. Tiempo promedio de cierre (días entre fecha_interes y fecha_cierre)
  let diasTotalesCierre = 0
  let cierresConFecha = 0
  ventasGanadas.forEach(v => {
    if (v.fecha_cierre) {
      const diff = (new Date(v.fecha_cierre).getTime() - new Date(v.fecha_interes).getTime()) / (1000 * 3600 * 24)
      diasTotalesCierre += Math.max(1, Math.round(diff))
      cierresConFecha++
    }
  })
  const tiempoPromedioCierreDias = cierresConFecha > 0 ? Math.round(diasTotalesCierre / cierresConFecha) : 12

  // 4. Funnel por Etapas
  const STAGES = ['Contacto Inicial', 'Interesado', 'Visita Programada', 'Oferta Realizada', 'Cerrado/Ganado', 'Perdido']
  const funnel = STAGES.map(stage => {
    const count = ventas.filter(v => v.estado_venta === stage).length
    const valor = ventas.filter(v => v.estado_venta === stage).reduce((acc, v) => acc + (v.propiedad?.precio || 0), 0)
    return { stage, count, valor }
  })

  // 5. Origen de Clientes (Canales de Marketing)
  const canalesMap: Record<string, { total: number; ganados: number; monto: number }> = {}
  clientes.forEach(c => {
    const origen = c.origen || 'Desconocido / Directo'
    if (!canalesMap[origen]) {
      canalesMap[origen] = { total: 0, ganados: 0, monto: 0 }
    }
    canalesMap[origen].total++

    // Check if client bought
    const ventaGanada = c.ventas.find(v => v.estado_venta === 'Cerrado/Ganado')
    if (ventaGanada) {
      canalesMap[origen].ganados++
    }
  })

  const canalesData = Object.keys(canalesMap).map(canal => ({
    canal,
    totalClientes: canalesMap[canal].total,
    cierres: canalesMap[canal].ganados,
    tasaConversion: ((canalesMap[canal].ganados / (canalesMap[canal].total || 1)) * 100).toFixed(1)
  }))

  // 6. Performance por Agente
  const agentesMetrics = agentes.map(a => {
    const ganadasAgente = a.ventas.filter(v => v.estado_venta === 'Cerrado/Ganado')
    const montoGanado = ganadasAgente.reduce((acc, v) => acc + (v.propiedad?.precio || 0), 0)
    const comisionesAgente = ganadasAgente.reduce((acc, v) => acc + (v.monto_comision || (v.propiedad?.precio || 0) * (a.comision_porcentaje || 3) / 100), 0)
    const totalOportunidades = a.ventas.length
    const tasaConversion = totalOportunidades > 0 ? ((ganadasAgente.length / totalOportunidades) * 100).toFixed(1) : '0.0'
    const meta = a.meta_ventas || 1000000
    const porcentajeMeta = Math.min(100, Math.round((montoGanado / meta) * 100))

    // Estancadas de este agente
    const estancadasAgente = a.ventas.filter(v => {
      if (v.estado_venta === 'Cerrado/Ganado' || v.estado_venta === 'Perdido') return false
      return new Date(v.fecha_interes) < fechaEstancamientoLimite
    }).length

    return {
      id: a.id,
      nombre: a.nombre,
      rol: a.rol,
      estado: a.estado,
      clientesAsignados: a.clientes.length,
      oportunidadesTotal: totalOportunidades,
      cierresLogrados: ganadasAgente.length,
      montoGanado,
      comisionesAgente,
      tasaConversion,
      meta,
      porcentajeMeta,
      estancadasAgente
    }
  })

  const tasaConversionGlobal = ventas.length > 0 ? ((ventasGanadas.length / ventas.length) * 100).toFixed(1) : '0.0'

  return {
    kpis: {
      volumenVentasGanadas,
      comisionesTotales,
      totalClientes: clientes.length,
      clientesHuérfanosCount: clientesSinAgente.length,
      ventasEstancadasCount: ventasEstancadas.length,
      tasaConversionGlobal,
      tiempoPromedioCierreDias
    },
    ventasEstancadas: ventasEstancadas.map(v => ({
      id: v.id,
      clienteId: v.cliente?.id || '',
      clienteNombre: v.cliente?.nombre || v.cliente?.telefono || 'Cliente Desconocido',
      propiedadId: v.propiedad?.id || '',
      propiedadTitulo: v.propiedad?.titulo || 'Propiedad',
      propiedadPrecio: v.propiedad?.precio || 0,
      estadoVenta: v.estado_venta,
      fechaInteres: v.fecha_interes.toISOString(),
      diasTranscurridos: Math.round((now.getTime() - new Date(v.fecha_interes).getTime()) / (1000 * 3600 * 24)),
      agenteNombre: v.agente?.nombre || 'Sin agente'
    })),
    clientesSinAgente: clientesSinAgente.map(c => ({
      id: c.id,
      nombre: c.nombre || 'Sin nombre',
      telefono: c.telefono,
      origen: c.origen,
      fechaCreacion: c.fecha_creacion.toISOString()
    })),
    agentesMetrics,
    funnel,
    canalesData
  }
}
