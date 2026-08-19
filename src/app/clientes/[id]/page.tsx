import { requireAuth } from '@/lib/auth'
import { getTenantId } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ClienteDetalleClient } from './ClienteDetalleClient'

export const dynamic = 'force-dynamic'

export default async function ClienteDetallePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireAuth()
  const empresaId = await getTenantId()
  const { id } = await params

  const isCompanyAdmin = session.isGlobalAdmin || session.rol === 'Agente Owner' || session.rol === 'Agente Admin'
  const clienteWhere: any = { id, empresa_id: empresaId }

  // Agente Normal: Solo puede acceder a su cliente asignado
  if (!isCompanyAdmin) {
    clienteWhere.agente_asignado_id = session.agenteId || 'non-existent-agente-id'
  }

  const [cliente, agentes] = await Promise.all([
    prisma.cliente.findFirst({
      where: clienteWhere,
      include: {
        agente: true,
        ventas: {
          include: { propiedad: true }
        },
        documentos: true
      }
    }),
    prisma.agente.findMany({
      where: { empresa_id: empresaId, estado: 'Activo' },
      orderBy: { nombre: 'asc' }
    })
  ])

  if (!cliente) {
    notFound()
  }

  return <ClienteDetalleClient cliente={cliente} agentes={agentes} isCompanyAdmin={isCompanyAdmin} />
}
