import { requireAuth } from '@/lib/auth'
import { getTenantId } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { DashboardClient } from './DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await requireAuth()
  const empresaId = await getTenantId()

  const isCompanyAdmin = session.isGlobalAdmin || session.rol === 'Agente Owner' || session.rol === 'Agente Admin'
  const agenteFilterId = !isCompanyAdmin ? (session.agenteId || 'non-existent-agente-id') : undefined

  const clientesWhere: any = { empresa_id: empresaId }
  const ventasWhere: any = { empresa_id: empresaId }

  if (!isCompanyAdmin) {
    clientesWhere.agente_asignado_id = agenteFilterId
    ventasWhere.agente_id = agenteFilterId
  }

  const [totalClientes, totalPropiedades, totalVentas] = await Promise.all([
    prisma.cliente.count({ where: clientesWhere }),
    prisma.propiedad.count({ where: { empresa_id: empresaId } }),
    prisma.venta.count({ where: ventasWhere }),
  ])

  const ventasRecientes = await prisma.venta.findMany({
    where: ventasWhere,
    take: 5,
    orderBy: { fecha_interes: 'desc' },
    include: { cliente: true, propiedad: true },
  })

  const whatsappLeads = await prisma.cliente.findMany({
    where: { ...clientesWhere, origen: 'WhatsApp' },
    take: 5,
    orderBy: { fecha_creacion: 'desc' },
  })

  const [countContacto, countInteresado, countVisita, countOferta, countGanado, countPerdido] = await Promise.all([
    prisma.venta.count({ where: { ...ventasWhere, estado_venta: 'Contacto Inicial' } }),
    prisma.venta.count({ where: { ...ventasWhere, estado_venta: 'Interesado' } }),
    prisma.venta.count({ where: { ...ventasWhere, estado_venta: 'Visita Programada' } }),
    prisma.venta.count({ where: { ...ventasWhere, estado_venta: 'Oferta Realizada' } }),
    prisma.venta.count({ where: { ...ventasWhere, estado_venta: 'Cerrado/Ganado' } }),
    prisma.venta.count({ where: { ...ventasWhere, estado_venta: 'Perdido' } }),
  ])

  const pipelineCounts = {
    contacto: countContacto,
    interesado: countInteresado,
    visita: countVisita,
    oferta: countOferta,
    ganado: countGanado,
    perdido: countPerdido
  }

  return (
    <DashboardClient 
      totalClientes={totalClientes}
      totalPropiedades={totalPropiedades}
      totalVentas={totalVentas}
      ventasRecientes={ventasRecientes}
      whatsappLeads={whatsappLeads}
      pipelineCounts={pipelineCounts}
    />
  )
}
