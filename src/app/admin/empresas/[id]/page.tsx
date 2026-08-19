import { requireGlobalAdmin } from '@/lib/auth'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/Badge'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { toggleEmpresa } from '@/app/actions/admin'

export default async function EmpresaDetailPage({ params }: { params: { id: string } }) {
  await requireGlobalAdmin()

  const empresa = await prisma.empresa.findUnique({
    where: { id: params.id },
    include: {
      usuarios: {
        include: {
          usuario: true
        }
      }
    }
  })

  if (!empresa) {
    notFound()
  }

  const handleToggle = toggleEmpresa.bind(null, empresa.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader 
          title={empresa.nombre_comercial} 
          breadcrumbs={[
            { label: 'Panel Global', href: '/admin' },
            { label: 'Empresas', href: '/admin/empresas' },
            { label: empresa.nombre_comercial }
          ]} 
        />
        
        <form action={handleToggle}>
          <button 
            type="submit"
            className={`px-4 py-2.5 rounded-lg text-[13px] font-bold text-white ${empresa.activa ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {empresa.activa ? 'Desactivar Empresa' : 'Activar Empresa'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg shadow-[var(--shadow-card)] p-6 space-y-4">
          <h3 className="text-[15px] font-semibold text-[var(--text-primary)] border-b pb-2">Información General</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] text-[var(--text-secondary)] uppercase">Estado</p>
              <div className="mt-1">
                <Badge variant={empresa.activa ? 'success' : 'error'}>
                  {empresa.activa ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-[11px] text-[var(--text-secondary)] uppercase">RNC</p>
              <p className="text-[13px] font-medium mt-1">{empresa.rnc || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[11px] text-[var(--text-secondary)] uppercase">Teléfono</p>
              <p className="text-[13px] font-medium mt-1">{empresa.telefono_contacto || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[11px] text-[var(--text-secondary)] uppercase">Fecha Registro</p>
              <p className="text-[13px] font-medium mt-1">{empresa.fecha_creacion.toLocaleDateString('es-DO')}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[11px] text-[var(--text-secondary)] uppercase">Dirección</p>
              <p className="text-[13px] font-medium mt-1">{empresa.direccion || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg shadow-[var(--shadow-card)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border-default)]">
            <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">Usuarios Vinculados</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse data-table">
              <thead>
                <tr className="bg-[var(--bg-surface-secondary)] text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
                  <th className="px-4 py-3 font-medium border-b border-[var(--border-default)]">Nombre</th>
                  <th className="px-4 py-3 font-medium border-b border-[var(--border-default)]">Email</th>
                  <th className="px-4 py-3 font-medium border-b border-[var(--border-default)]">Rol en Empresa</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[var(--text-primary)]">
                {empresa.usuarios.map((ue) => (
                  <tr key={ue.id} className="hover:bg-[var(--bg-hover)] border-b border-[var(--border-default)] last:border-0">
                    <td className="px-4 py-3 font-medium">{ue.usuario.nombre || '-'}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{ue.usuario.email}</td>
                    <td className="px-4 py-3"><Badge variant="neutral">{ue.rol}</Badge></td>
                  </tr>
                ))}
                {empresa.usuarios.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-[var(--text-secondary)] text-[13px]">
                      No hay usuarios vinculados a esta empresa.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
