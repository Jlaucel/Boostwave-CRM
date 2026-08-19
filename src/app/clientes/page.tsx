import { requireAuth } from '@/lib/auth'
import { getTenantId } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { ClientesClient } from './ClientesClient'

export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
  const session = await requireAuth()
  const empresaId = await getTenantId()

  const isCompanyAdmin = session.isGlobalAdmin || session.rol === 'Agente Owner' || session.rol === 'Agente Admin'
  const clientesWhere: any = { empresa_id: empresaId }

  // Agente Normal: Solo sus clientes asignados
  if (!isCompanyAdmin) {
    clientesWhere.agente_asignado_id = session.agenteId || 'non-existent-agente-id'
  }

  const [clientes, agentes] = await Promise.all([
    prisma.cliente.findMany({
      where: clientesWhere,
      include: {
        agente: true,
        ventas: true
      },
      orderBy: { fecha_creacion: 'desc' }
    }),
    prisma.agente.findMany({
      where: { empresa_id: empresaId, estado: 'Activo' },
      orderBy: { nombre: 'asc' }
    })
  ])

  return <ClientesClient clientesIniciales={clientes} agentes={agentes} isCompanyAdmin={isCompanyAdmin} />
}
