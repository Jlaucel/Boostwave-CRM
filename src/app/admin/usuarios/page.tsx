import { requireGlobalAdmin } from '@/lib/auth'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/Badge'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Link as LinkIcon } from 'lucide-react'
import { toggleUsuario, resetPassword } from '@/app/actions/admin'

export default async function UsuariosPage() {
  await requireGlobalAdmin()

  const usuarios = await prisma.usuario.findMany({
    include: {
      empresas: {
        include: { empresa: true }
      }
    },
    orderBy: { fecha_creacion: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Gestión de Usuarios" 
          breadcrumbs={[
            { label: 'Panel Global', href: '/admin' },
            { label: 'Usuarios' }
          ]} 
        />
        <Link 
          href="/admin/usuarios/vincular"
          className="bg-[#1A85E5] text-white px-4 py-2.5 rounded-lg text-[13px] font-bold hover:bg-blue-600 flex items-center gap-2"
        >
          <LinkIcon className="h-4 w-4" />
          Vincular Usuario
        </Link>
      </div>

      <div className="bg-white border rounded-lg shadow-[var(--shadow-card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse data-table">
            <thead>
              <tr className="bg-[var(--bg-surface-secondary)] text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
                <th className="px-4 py-3 font-medium border-b border-[var(--border-default)]">Usuario</th>
                <th className="px-4 py-3 font-medium border-b border-[var(--border-default)]">Rol Global</th>
                <th className="px-4 py-3 font-medium border-b border-[var(--border-default)]">Estado</th>
                <th className="px-4 py-3 font-medium border-b border-[var(--border-default)]">Empresas (Rol)</th>
                <th className="px-4 py-3 font-medium border-b border-[var(--border-default)] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-[13px] text-[var(--text-primary)]">
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-[var(--bg-hover)] border-b border-[var(--border-default)] last:border-0 align-top">
                  <td className="px-4 py-3">
                    <div className="font-medium">{usuario.nombre || '-'}</div>
                    <div className="text-[11px] text-[var(--text-secondary)]">{usuario.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    {usuario.is_global_admin ? (
                      <Badge variant="warning">Admin Global</Badge>
                    ) : (
                      <span className="text-[11px] text-[var(--text-secondary)]">Normal</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={usuario.activo ? 'success' : 'error'}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {usuario.empresas.length > 0 ? (
                      <div className="space-y-1">
                        {usuario.empresas.map(ue => (
                          <div key={ue.id} className="text-[11px]">
                            <span className="font-medium">{ue.empresa.nombre_comercial}</span> - <span className="text-[var(--text-secondary)]">{ue.rol}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[var(--text-secondary)] italic text-[11px]">Sin vincular</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2 items-end">
                      {!usuario.is_global_admin && (
                        <form action={toggleUsuario.bind(null, usuario.id)}>
                          <button type="submit" className={`text-[11px] px-2 py-1 rounded border ${usuario.activo ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                            {usuario.activo ? 'Desactivar' : 'Activar'}
                          </button>
                        </form>
                      )}
                      <form action={resetPassword} className="flex gap-1 items-center">
                        <input type="hidden" name="usuario_id" value={usuario.id} />
                        <input 
                          type="password" 
                          name="new_password" 
                          placeholder="Nueva contraseña..." 
                          className="h-6 px-2 border rounded text-[11px] w-28 focus:outline-none focus:border-[#1A85E5]"
                          required 
                        />
                        <button type="submit" className="text-[11px] bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 border">
                          Reset
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-secondary)] text-[13px]">
                    No hay usuarios registrados.
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
