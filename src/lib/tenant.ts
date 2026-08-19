import { getSession } from './auth'
import { prisma } from './prisma'

export async function getTenantId(): Promise<string> {
  const session = await getSession()
  if (!session) return ''

  if (session.empresaId) {
    return session.empresaId
  }

  // Global Admin exception: fallback to first active company
  if (session.isGlobalAdmin) {
    const firstEmpresa = await prisma.empresa.findFirst({ where: { activa: true }, orderBy: { fecha_creacion: 'asc' } })
    if (firstEmpresa) return firstEmpresa.id
  }

  return ''
}

export async function tenantWhere(extraFilters?: Record<string, any>): Promise<Record<string, any>> {
  const session = await getSession()
  if (!session) return { empresa_id: '__NO_SESSION__', ...extraFilters }

  if (session.isGlobalAdmin && !session.empresaId) {
    return extraFilters || {}
  }

  const empresaId = session.empresaId || (await getTenantId())
  return { empresa_id: empresaId, ...extraFilters }
}

export async function tenantWhereWithMultiempresa(extraFilters?: Record<string, any>): Promise<Record<string, any>> {
  const session = await getSession()
  if (!session) return { empresa_id: '__NO_SESSION__', ...extraFilters }

  if (session.isGlobalAdmin && !session.empresaId) {
    return extraFilters || {}
  }

  const empresaId = session.empresaId || (await getTenantId())
  return {
    OR: [
      { empresa_id: empresaId, ...extraFilters },
      { multiempresa: true, ...extraFilters }
    ]
  }
}
