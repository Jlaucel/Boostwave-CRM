import { requireGlobalAdmin } from '@/lib/auth'
import { PageHeader } from '@/components/PageHeader'
import { Shield, Building2, Users, UserX, Activity, ArrowRight, History } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  await requireGlobalAdmin()

  const [totalEmpresas, totalUsuarios, usuariosSinVincular, sesionesActivas, recentAuditLogs] = await Promise.all([
    prisma.empresa.count(),
    prisma.usuario.count(),
    prisma.usuario.count({ where: { empresas: { none: {} } } }),
    prisma.sesion.count({ where: { expires_at: { gt: new Date() } } }),
    prisma.auditLog.findMany({ orderBy: { fecha: 'desc' }, take: 10, include: { empresa: true } })
  ])

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Panel de Administración Global" 
        icon={Shield}
        breadcrumbs={[{ label: 'Panel Global' }]} 
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg shadow-[var(--shadow-card)] p-4 flex items-center">
          <div className="p-3 bg-blue-50 rounded-lg mr-4">
            <Building2 className="h-6 w-6 text-[#1A85E5]" />
          </div>
          <div>
            <p className="text-[11px] text-[var(--text-secondary)] font-medium uppercase">Total Empresas</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{totalEmpresas}</p>
          </div>
        </div>
        <div className="bg-white border rounded-lg shadow-[var(--shadow-card)] p-4 flex items-center">
          <div className="p-3 bg-blue-50 rounded-lg mr-4">
            <Users className="h-6 w-6 text-[#1A85E5]" />
          </div>
          <div>
            <p className="text-[11px] text-[var(--text-secondary)] font-medium uppercase">Total Usuarios</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{totalUsuarios}</p>
          </div>
        </div>
        <div className="bg-white border rounded-lg shadow-[var(--shadow-card)] p-4 flex items-center">
          <div className="p-3 bg-orange-50 rounded-lg mr-4">
            <UserX className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <p className="text-[11px] text-[var(--text-secondary)] font-medium uppercase">Usuarios Sin Vincular</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{usuariosSinVincular}</p>
          </div>
        </div>
        <div className="bg-white border rounded-lg shadow-[var(--shadow-card)] p-4 flex items-center">
          <div className="p-3 bg-green-50 rounded-lg mr-4">
            <Activity className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-[11px] text-[var(--text-secondary)] font-medium uppercase">Sesiones Activas</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{sesionesActivas}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/empresas" className="bg-white border rounded-lg shadow-[var(--shadow-card)] p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-[#1A85E5]" />
            <span className="text-[13px] font-medium">Gestionar Empresas</span>
          </div>
          <ArrowRight className="h-4 w-4 text-[var(--text-secondary)]" />
        </Link>
        <Link href="/admin/usuarios" className="bg-white border rounded-lg shadow-[var(--shadow-card)] p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-[#1A85E5]" />
            <span className="text-[13px] font-medium">Gestionar Usuarios</span>
          </div>
          <ArrowRight className="h-4 w-4 text-[var(--text-secondary)]" />
        </Link>
        <Link href="/admin/auditoria" className="bg-white border rounded-lg shadow-[var(--shadow-card)] p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <History className="h-5 w-5 text-[#1A85E5]" />
            <span className="text-[13px] font-medium">Log de Auditoría</span>
          </div>
          <ArrowRight className="h-4 w-4 text-[var(--text-secondary)]" />
        </Link>
      </div>

      <div className="bg-white border rounded-lg shadow-[var(--shadow-card)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border-default)]">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">Actividad Reciente (Auditoría)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse data-table">
            <thead>
              <tr className="bg-[var(--bg-surface-secondary)] text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
                <th className="px-4 py-3 font-medium border-b border-[var(--border-default)]">Fecha</th>
                <th className="px-4 py-3 font-medium border-b border-[var(--border-default)]">Acción</th>
                <th className="px-4 py-3 font-medium border-b border-[var(--border-default)]">Descripción</th>
                <th className="px-4 py-3 font-medium border-b border-[var(--border-default)]">Empresa</th>
              </tr>
            </thead>
            <tbody className="text-[13px] text-[var(--text-primary)]">
              {recentAuditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--bg-hover)] border-b border-[var(--border-default)] last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap">{log.fecha.toLocaleString('es-DO')}</td>
                  <td className="px-4 py-3"><span className="font-medium text-[11px] bg-gray-100 px-2 py-1 rounded">{log.accion}</span></td>
                  <td className="px-4 py-3">{log.descripcion}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{log.empresa?.nombre_comercial || '-'}</td>
                </tr>
              ))}
              {recentAuditLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[var(--text-secondary)] text-[13px]">
                    No hay registros de auditoría recientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
