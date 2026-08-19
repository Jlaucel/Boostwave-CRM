import { requireAuth } from '@/lib/auth'
import { getTenantId } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { NuevoClienteClientForm } from './NuevoClienteClientForm'

export const dynamic = 'force-dynamic'

export default async function NuevoClientePage() {
  const session = await requireAuth()
  const empresaId = await getTenantId()

  const isCompanyAdmin = session.isGlobalAdmin || session.rol === 'Agente Owner' || session.rol === 'Agente Admin'

  const agentes = isCompanyAdmin
    ? await prisma.agente.findMany({
        where: { empresa_id: empresaId, estado: 'Activo' },
        orderBy: { nombre: 'asc' }
      })
    : []

  return <NuevoClienteClientForm agentes={agentes} isCompanyAdmin={isCompanyAdmin} />
}
