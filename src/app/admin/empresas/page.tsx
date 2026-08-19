import { requireGlobalAdmin } from '@/lib/auth'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/Badge'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Eye, Plus } from 'lucide-react'

export default async function EmpresasPage() {
  await requireGlobalAdmin()

  const empresas = await prisma.empresa.findMany({
    include: {
      _count: {
        select: { agentes: true, usuarios: true }
      }
    },
    orderBy: { fecha_creacion: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Gestión de Empresas" 
          breadcrumbs={[
            { label: 'Panel Global', href: '/admin' },
            { label: 'Empresas' }
          ]} 
        />
        <Link 
          href="/admin/empresas/nueva"
          className="bg-[#1A85E5] text-white px-4 py-2.5 rounded-lg text-[13px] font-bold hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Empresa
        </Link>
      </div>

      <div className="bg-white border rounded-lg shadow-[var(--shadow-card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse data-table">
            <thead>
              <tr className="bg-[var(--bg-surface-secondary)] text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
                <th className="px-4 py-3 font-medium border-b border-[var(--border-default)]">Nombre Comercial</th>
                <th className="px-4 py-3 font-medium border-b border-[var(--border-default)]">RNC</th>
                <th className="px-4 py-3 font-medium border-b border-[var(--border-default)]">Teléfono</th>
                <th className="px-4 py-3 font-medium border-b border-[var(--border-default)]">Agentes / Usuarios</th>
                <th className="px-4 py-3 font-medium border-b border-[var(--border-default)]">Estado</th>
                <th className="px-4 py-3 font-medium border-b border-[var(--border-default)] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-[13px] text-[var(--text-primary)]">
              {empresas.map((empresa) => (
                <tr key={empresa.id} className="hover:bg-[var(--bg-hover)] border-b border-[var(--border-default)] last:border-0">
                  <td className="px-4 py-3 font-medium">{empresa.nombre_comercial}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{empresa.rnc || '-'}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{empresa.telefono_contacto || '-'}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{empresa._count.agentes} / {empresa._count.usuarios}</td>
                  <td className="px-4 py-3">
                    <Badge variant={empresa.activa ? 'success' : 'error'}>
                      {empresa.activa ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link 
                      href={`/admin/empresas/${empresa.id}`}
                      className="text-[#1A85E5] hover:underline inline-flex items-center gap-1 text-[13px]"
                    >
                      <Eye className="h-4 w-4" />
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
              {empresas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--text-secondary)] text-[13px]">
                    No hay empresas registradas.
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
