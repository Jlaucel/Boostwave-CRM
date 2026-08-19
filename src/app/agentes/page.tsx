import { requireAuth } from '@/lib/auth'
import { getTenantId } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/Badge'
import { UserCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function syncAgentesForEmpresa(empresaId: string) {
  if (!empresaId) return

  const userLinks = await prisma.usuarioEmpresa.findMany({
    where: { empresa_id: empresaId },
    include: { usuario: true, agente: true }
  })

  for (const link of userLinks) {
    if (!link.agente_id || !link.agente) {
      let agente = await prisma.agente.findFirst({
        where: { email: link.usuario.email, empresa_id: empresaId }
      })

      if (!agente) {
        agente = await prisma.agente.create({
          data: {
            nombre: link.usuario.nombre || link.usuario.email.split('@')[0],
            email: link.usuario.email,
            telefono: 'N/A',
            rol: link.rol || 'Agente Normal',
            estado: link.usuario.activo ? 'Activo' : 'Inactivo',
            empresa_id: empresaId,
            meta_ventas: 1000000,
            comision_porcentaje: 3,
          }
        })
      }

      await prisma.usuarioEmpresa.update({
        where: { id: link.id },
        data: { agente_id: agente.id }
      })
    }
  }
}

export default async function AgentesPage() {
  const session = await requireAuth()
  const empresaId = await getTenantId()

  if (empresaId) {
    await syncAgentesForEmpresa(empresaId)
  }

  const isCompanyAdmin = session.isGlobalAdmin || session.rol === 'Agente Owner' || session.rol === 'Agente Admin'
  const agentesWhere: any = { empresa_id: empresaId }

  if (!isCompanyAdmin) {
    agentesWhere.id = session.agenteId || 'non-existent-agente-id'
  }

  const agentes = await prisma.agente.findMany({
    where: agentesWhere,
    include: {
      _count: {
        select: { clientes: true, ventas: true }
      }
    },
    orderBy: { nombre: 'asc' },
  })

  return (
    <>
      <PageHeader
        title="Equipo de Agentes"
        icon={UserCircle}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Equipo' }
        ]}
        subtitle={`Total: ${agentes.length}`}
      />

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agentes.length === 0 ? (
            <div className="col-span-full p-8 text-center text-[var(--text-tertiary)] bg-white shadow-[var(--shadow-card)] rounded-lg border border-[var(--border-default)]">
              No hay agentes registrados aún.
            </div>
          ) : (
            agentes.map((agente) => (
              <Link key={agente.id} href={`/agentes/${agente.id}`} className="block group">
                <div className="bg-white p-6 rounded-lg shadow-[var(--shadow-card)] border border-[var(--border-default)] hover:border-brand-400 transition-all flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1A85E5] to-[#0D47A1] text-white flex items-center justify-center text-xl font-bold mb-4 shadow-sm">
                      {agente.nombre.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                      <Badge variant={agente.estado === 'Activo' ? 'success' : 'neutral'} className="text-[9px] px-1.5 py-0 border-white border-2">
                        {agente.estado}
                      </Badge>
                    </div>
                  </div>
                  <h3 className="font-bold text-[16px] text-[var(--text-primary)] mt-2 mb-0.5 group-hover:text-brand-600 transition-colors">{agente.nombre}</h3>
                  <div className="text-[12px] font-medium text-[#1A85E5] mb-1">{agente.rol}</div>
                  <p className="text-[12px] text-[var(--text-secondary)] mb-5">{agente.email}</p>
                  
                  <div className="grid grid-cols-2 w-full gap-4 pt-4 border-t border-[var(--border-default)]">
                    <div>
                      <div className="text-[11px] text-[var(--text-tertiary)] font-semibold uppercase tracking-wider mb-1">Clientes</div>
                      <div className="text-[16px] font-bold text-[var(--text-primary)]">{agente._count.clientes}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[var(--text-tertiary)] font-semibold uppercase tracking-wider mb-1">Oportunidades</div>
                      <div className="text-[16px] font-bold text-[var(--text-primary)]">{agente._count.ventas}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </>
  )
}
