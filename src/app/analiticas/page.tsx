import { requireAuth } from '@/lib/auth'
import { getTenantId } from '@/lib/tenant'
import { getAnalyticsData } from '@/app/actions/analytics'
import { prisma } from '@/lib/prisma'
import { AnalyticsClient } from './AnalyticsClient'

export const dynamic = 'force-dynamic'

export default async function AnaliticasPage() {
  const session = await requireAuth()
  const empresaId = await getTenantId()

  const [analyticsData, agentes] = await Promise.all([
    getAnalyticsData(),
    prisma.agente.findMany({ where: { empresa_id: empresaId, estado: 'Activo' }, orderBy: { nombre: 'asc' } })
  ])

  return <AnalyticsClient data={analyticsData} agentesList={agentes} />
}
