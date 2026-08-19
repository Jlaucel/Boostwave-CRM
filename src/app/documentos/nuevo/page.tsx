import { requireAuth } from '@/lib/auth'
import { getTenantId } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { DocumentFormClient } from './DocumentFormClient'

export const dynamic = 'force-dynamic'

export default async function NuevoDocumentoPage() {
  const session = await requireAuth()
  const empresaId = await getTenantId()

  const [clientes, propiedades, agentes] = await Promise.all([
    prisma.cliente.findMany({ where: { empresa_id: empresaId }, orderBy: { nombre: 'asc' } }),
    prisma.propiedad.findMany({ where: { empresa_id: empresaId }, orderBy: { titulo: 'asc' } }),
    prisma.agente.findMany({ where: { empresa_id: empresaId, estado: 'Activo' }, orderBy: { nombre: 'asc' } }),
  ])

  return (
    <DocumentFormClient
      clientes={clientes}
      propiedades={propiedades}
      agentes={agentes}
    />
  )
}
