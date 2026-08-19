import { requireGlobalAdmin } from '@/lib/auth'
import { PageHeader } from '@/components/PageHeader'
import { createEmpresa } from '@/app/actions/admin'

export default async function NuevaEmpresaPage() {
  await requireGlobalAdmin()

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader 
        title="Nueva Empresa" 
        breadcrumbs={[
          { label: 'Panel Global', href: '/admin' },
          { label: 'Empresas', href: '/admin/empresas' },
          { label: 'Nueva' }
        ]} 
      />

      <div className="bg-white border rounded-lg shadow-[var(--shadow-card)] p-6">
        <form action={createEmpresa} className="space-y-4">
          <div>
            <label htmlFor="nombre_comercial" className="block text-[13px] font-medium text-[var(--text-primary)] mb-1">
              Nombre Comercial *
            </label>
            <input 
              type="text" 
              id="nombre_comercial" 
              name="nombre_comercial" 
              required
              className="w-full h-10 px-3 border rounded-md text-[13px] focus:outline-none focus:border-[#1A85E5] focus:ring-2 focus:ring-[#1A85E5]/15"
              placeholder="Ej. Inmobiliaria XYZ"
            />
          </div>

          <div>
            <label htmlFor="rnc" className="block text-[13px] font-medium text-[var(--text-primary)] mb-1">
              RNC
            </label>
            <input 
              type="text" 
              id="rnc" 
              name="rnc" 
              className="w-full h-10 px-3 border rounded-md text-[13px] focus:outline-none focus:border-[#1A85E5] focus:ring-2 focus:ring-[#1A85E5]/15"
              placeholder="Registro Nacional de Contribuyente"
            />
          </div>

          <div>
            <label htmlFor="telefono_contacto" className="block text-[13px] font-medium text-[var(--text-primary)] mb-1">
              Teléfono de Contacto
            </label>
            <input 
              type="tel" 
              id="telefono_contacto" 
              name="telefono_contacto" 
              className="w-full h-10 px-3 border rounded-md text-[13px] focus:outline-none focus:border-[#1A85E5] focus:ring-2 focus:ring-[#1A85E5]/15"
              placeholder="Ej. (809) 555-0000"
            />
          </div>

          <div>
            <label htmlFor="direccion" className="block text-[13px] font-medium text-[var(--text-primary)] mb-1">
              Dirección
            </label>
            <textarea 
              id="direccion" 
              name="direccion" 
              rows={3}
              className="w-full p-3 border rounded-md text-[13px] focus:outline-none focus:border-[#1A85E5] focus:ring-2 focus:ring-[#1A85E5]/15 resize-none"
              placeholder="Dirección física de la empresa"
            />
          </div>

          <div className="pt-4 border-t border-[var(--border-default)] flex justify-end">
            <button 
              type="submit"
              className="bg-[#1A85E5] text-white px-4 py-2.5 rounded-lg text-[13px] font-bold hover:bg-blue-600"
            >
              Crear Empresa
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
