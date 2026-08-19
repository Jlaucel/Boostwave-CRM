import { requireGlobalAdmin } from '@/lib/auth'
import { PageHeader } from '@/components/PageHeader'
import { prisma } from '@/lib/prisma'

export default async function AuditoriaPage() {
  await requireGlobalAdmin()

  const logs = await prisma.auditLog.findMany({
    orderBy: { fecha: 'desc' },
    take: 100,
    include: {
      empresa: true
    }
  })

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Log de Auditoría" 
        breadcrumbs={[
          { label: 'Panel Global', href: '/admin' },
          { label: 'Auditoría' }
        ]} 
      />

      <div className="bg-white border rounded-lg shadow-[var(--shadow-card)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border-default)] bg-gray-50 flex justify-between items-center">
          <span className="text-[13px] text-[var(--text-secondary)]">Mostrando los últimos 100 registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse data-table">
            <thead>
              <tr className="bg-[var(--bg-surface-secondary)] text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
                <th className="px-4 py-3 font-medium border-b border-[var(--border-default)]">Fecha</th>
                <th className="px-4 py-3 font-medium border-b border-[var(--border-default)]">Acción</th>
                <th className="px-4 py-3 font-medium border-b border-[var(--border-default)]">Descripción</th>
                <th className="px-4 py-3 font-medium border-b border-[var(--border-default)]">Empresa</th>
                <th className="px-4 py-3 font-medium border-b border-[var(--border-default)]">Usuario/IP</th>
              </tr>
            </thead>
            <tbody className="text-[13px] text-[var(--text-primary)]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--bg-hover)] border-b border-[var(--border-default)] last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap text-[var(--text-secondary)] text-[12px]">
                    {log.fecha.toLocaleString('es-DO')}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-[11px] bg-gray-100 px-2 py-1 rounded">
                      {log.accion}
                    </span>
                  </td>
                  <td className="px-4 py-3">{log.descripcion}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {log.empresa?.nombre_comercial || '-'}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)] text-[11px]">
                    {log.usuario_id || log.ip_address || '-'}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-secondary)] text-[13px]">
                    No hay registros de auditoría.
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
