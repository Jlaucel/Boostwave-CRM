import { requireGlobalAdmin } from '@/lib/auth'
import { PageHeader } from '@/components/PageHeader'
import { vincularUsuarioEmpresa } from '@/app/actions/admin'
import { prisma } from '@/lib/prisma'

export default async function VincularUsuarioPage() {
  await requireGlobalAdmin()

  // For simplicity, fetch all non-global-admin users, and active empresas
  const [usuarios, empresas] = await Promise.all([
    prisma.usuario.findMany({ where: { is_global_admin: false }, orderBy: { email: 'asc' } }),
    prisma.empresa.findMany({ where: { activa: true }, orderBy: { nombre_comercial: 'asc' } })
  ])

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader 
        title="Vincular Usuario a Empresa" 
        breadcrumbs={[
          { label: 'Panel Global', href: '/admin' },
          { label: 'Usuarios', href: '/admin/usuarios' },
          { label: 'Vincular' }
        ]} 
      />

      <div className="bg-white border rounded-lg shadow-[var(--shadow-card)] p-6">
        <form action={vincularUsuarioEmpresa} className="space-y-4">
          <div>
            <label htmlFor="usuario_id" className="block text-[13px] font-medium text-[var(--text-primary)] mb-1">
              Usuario *
            </label>
            <select 
              id="usuario_id" 
              name="usuario_id" 
              required
              className="w-full h-10 px-3 border rounded-md text-[13px] focus:outline-none focus:border-[#1A85E5] focus:ring-2 focus:ring-[#1A85E5]/15 bg-white"
            >
              <option value="">Seleccione un usuario...</option>
              {usuarios.map(u => (
                <option key={u.id} value={u.id}>{u.email} {u.nombre ? `(${u.nombre})` : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="empresa_id" className="block text-[13px] font-medium text-[var(--text-primary)] mb-1">
              Empresa *
            </label>
            <select 
              id="empresa_id" 
              name="empresa_id" 
              required
              className="w-full h-10 px-3 border rounded-md text-[13px] focus:outline-none focus:border-[#1A85E5] focus:ring-2 focus:ring-[#1A85E5]/15 bg-white"
            >
              <option value="">Seleccione una empresa...</option>
              {empresas.map(e => (
                <option key={e.id} value={e.id}>{e.nombre_comercial}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="rol" className="block text-[13px] font-medium text-[var(--text-primary)] mb-1">
              Rol en la Empresa *
            </label>
            <select 
              id="rol" 
              name="rol" 
              required
              className="w-full h-10 px-3 border rounded-md text-[13px] focus:outline-none focus:border-[#1A85E5] focus:ring-2 focus:ring-[#1A85E5]/15 bg-white"
              defaultValue="Agente Normal"
            >
              <option value="Agente Owner">Agente Owner (Propietario)</option>
              <option value="Agente Admin">Agente Admin (Administrador)</option>
              <option value="Agente Normal">Agente Normal</option>
            </select>
          </div>

          <div className="pt-4 border-t border-[var(--border-default)] flex justify-end">
            <button 
              type="submit"
              className="bg-[#1A85E5] text-white px-4 py-2.5 rounded-lg text-[13px] font-bold hover:bg-blue-600"
            >
              Vincular Usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
