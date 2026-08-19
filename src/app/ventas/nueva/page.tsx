import { requireAuth } from '@/lib/auth'
import { getTenantId } from '@/lib/tenant'
import { createVenta } from '@/app/actions'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/PageHeader'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function NuevaVentaPage() {
  const session = await requireAuth()
  const empresaId = await getTenantId()

  const isCompanyAdmin = session.isGlobalAdmin || session.rol === 'Agente Owner' || session.rol === 'Agente Admin'
  
  const clienteWhere: any = { empresa_id: empresaId }
  if (!isCompanyAdmin) {
    clienteWhere.agente_asignado_id = session.agenteId || 'non-existent'
  }

  const [clientes, propiedades, agentes] = await Promise.all([
    prisma.cliente.findMany({ where: clienteWhere, orderBy: { nombre: 'asc' } }),
    prisma.propiedad.findMany({ 
      where: { 
        OR: [
          { empresa_id: empresaId, estado: 'Disponible' },
          { multiempresa: true, estado: 'Disponible' }
        ]
      }, 
      orderBy: { titulo: 'asc' } 
    }),
    prisma.agente.findMany({ where: { empresa_id: empresaId, estado: 'Activo' }, orderBy: { nombre: 'asc' } }),
  ])

  return (
    <>
      <PageHeader
        title="Nueva Oportunidad"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Pipeline', href: '/ventas' },
          { label: 'Nueva Oportunidad' }
        ]}
      />

      <div className="p-6 max-w-3xl">
        <div className="bg-white p-8 rounded-lg border border-[var(--border-default)] shadow-[var(--shadow-card)]">
          <form action={createVenta} className="space-y-6">
            
            <div>
              <h3 className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-4 border-b border-[var(--border-default)] pb-2">
                Detalles de la Oportunidad
              </h3>
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="cliente_id" className="text-[13px] font-medium text-[var(--text-secondary)]">Seleccionar Cliente <span className="text-[var(--color-error)]">*</span></label>
                  <select 
                    id="cliente_id" 
                    name="cliente_id"
                    required
                    className="w-full h-10 px-3 border border-[var(--border-default)] rounded-md text-[13px] focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 bg-white"
                  >
                    <option value="">-- Selecciona un cliente --</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nombre || 'Sin Nombre'} ({c.telefono})
                      </option>
                    ))}
                  </select>
                  <p className="text-[12px] text-[var(--text-tertiary)] pt-1">
                    ¿No encuentras al cliente? <Link href="/clientes/nuevo" className="text-brand-600 hover:underline">Regístralo aquí</Link>.
                  </p>
                </div>
                
                <div className="space-y-1.5">
                  <label htmlFor="propiedad_id" className="text-[13px] font-medium text-[var(--text-secondary)]">Seleccionar Propiedad de Interés</label>
                  <select 
                    id="propiedad_id" 
                    name="propiedad_id"
                    className="w-full h-10 px-3 border border-[var(--border-default)] rounded-md text-[13px] focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 bg-white"
                  >
                    <option value="">-- Selecciona una propiedad --</option>
                    {propiedades.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.titulo} - ${p.precio.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


                  <div className="space-y-1.5">
                    <label htmlFor="estado_venta" className="text-[13px] font-medium text-[var(--text-secondary)]">Estado en Pipeline</label>
                    <select 
                      id="estado_venta" 
                      name="estado_venta"
                      className="w-full h-10 px-3 border border-[var(--border-default)] rounded-md text-[13px] focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 bg-white"
                    >
                      <option value="Contacto Inicial">Contacto Inicial</option>
                      <option value="Interesado">Interesado</option>
                      <option value="Visita Programada">Visita Programada</option>
                      <option value="Oferta Realizada">Oferta Realizada</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="notas" className="text-[13px] font-medium text-[var(--text-secondary)]">Notas Iniciales</label>
                  <textarea
                    id="notas"
                    name="notas"
                    rows={3}
                    placeholder="Contexto, observaciones o detalles relevantes de esta oportunidad..."
                    className="w-full p-3 border border-[var(--border-default)] rounded-md text-[13px] focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 resize-y"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--border-default)] flex justify-end gap-3">
              <Link
                href="/ventas"
                className="px-4 py-2 rounded-md text-[13px] font-medium text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                Cancelar
              </Link>
              <button 
                type="submit" 
                className="bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 text-[13px] font-medium transition-colors shadow-sm"
              >
                Crear Oportunidad
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
