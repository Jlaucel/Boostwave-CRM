import { requireAuth } from '@/lib/auth'
import { getTenantId } from '@/lib/tenant'
import { updateCliente } from '@/app/actions'
import { TAG_CATEGORIES } from '@/lib/constants'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/PageHeader'
import Link from 'next/link'
import { Lock, Info } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function EditarClientePage({
  params,
}: {
  params: { id: string }
}) {
  const session = await requireAuth()
  const empresaId = await getTenantId()
  const { id } = await params
  
  const isCompanyAdmin = session.isGlobalAdmin || session.rol === 'Agente Owner' || session.rol === 'Agente Admin'
  const clienteWhere: any = { id, empresa_id: empresaId }

  if (!isCompanyAdmin) {
    clienteWhere.agente_asignado_id = session.agenteId || 'non-existent-agente-id'
  }
  
  const [cliente, agentes] = await Promise.all([
    prisma.cliente.findFirst({
      where: clienteWhere,
    }),
    prisma.agente.findMany({
      where: { empresa_id: empresaId, estado: 'Activo' },
      orderBy: { nombre: 'asc' }
    })
  ])

  if (!cliente) {
    notFound()
  }

  let etiquetasArr: string[] = []
  if (cliente.etiquetas) {
    try {
      etiquetasArr = JSON.parse(cliente.etiquetas) as string[]
    } catch (e) {}
  }

  const updateAction = updateCliente.bind(null, id)

  return (
    <>
      <PageHeader
        title="Editar Cliente"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Clientes', href: '/clientes' },
          { label: cliente.nombre || 'Cliente', href: `/clientes/${id}` },
          { label: 'Editar' }
        ]}
      />

      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-white p-8 rounded-xl border border-[var(--border-default)] shadow-[var(--shadow-card)]">
          <form action={updateAction} className="space-y-6">
            
            <div>
              <h3 className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-4 border-b border-[var(--border-default)] pb-2">
                Información Personal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="nombre" className="text-[13px] font-medium text-[var(--text-secondary)]">Nombre Completo</label>
                  <input 
                    type="text" 
                    id="nombre" 
                    name="nombre" 
                    defaultValue={cliente.nombre || ''}
                    className="w-full h-10 px-3 border border-[var(--border-default)] rounded-md text-[13px] focus:outline-none focus:border-[#1A85E5]"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label htmlFor="telefono" className="text-[13px] font-medium text-[var(--text-secondary)]">Teléfono <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    id="telefono" 
                    name="telefono" 
                    required
                    defaultValue={cliente.telefono}
                    className="w-full h-10 px-3 border border-[var(--border-default)] rounded-md text-[13px] focus:outline-none focus:border-[#1A85E5]"
                  />
                  <div className="flex items-center gap-1 text-[11px] text-[var(--text-tertiary)] pt-0.5">
                    <Info className="w-3 h-3 text-[#1A85E5]" />
                    Se aplica la regla de validación de los últimos 10 dígitos.
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="agente_asignado_id" className="text-[13px] font-medium text-[var(--text-secondary)] flex items-center justify-between">
                    <span>Agente Comercial Asignado</span>
                    {!isCompanyAdmin && <span className="text-[10px] text-gray-400 font-normal">(Bloqueado - Solo Admin/Owner)</span>}
                  </label>
                  <select 
                    id="agente_asignado_id" 
                    name="agente_asignado_id"
                    defaultValue={cliente.agente_asignado_id || ''}
                    disabled={!isCompanyAdmin}
                    className={`w-full h-10 px-3 border border-[var(--border-default)] rounded-md text-[13px] focus:outline-none focus:border-[#1A85E5] font-semibold ${!isCompanyAdmin ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : 'bg-white'}`}
                  >
                    <option value="">-- Sin Agente Asignado --</option>
                    {agentes.map(a => (
                      <option key={a.id} value={a.id}>{a.nombre} ({a.rol})</option>
                    ))}
                  </select>
                  {!isCompanyAdmin && (
                    <input type="hidden" name="agente_asignado_id" value={cliente.agente_asignado_id || ''} />
                  )}
                </div>
                
                <div className="space-y-1.5">
                  <label htmlFor="origen_display" className="text-[13px] font-medium text-[var(--text-secondary)] flex items-center gap-1">
                    Origen del Lead <Lock className="w-3 h-3 text-amber-500" />
                  </label>
                  <input
                    type="text"
                    id="origen_display"
                    value={`${cliente.origen || 'Manual'} (Bloqueado)`}
                    disabled
                    readOnly
                    className="w-full h-10 px-3 border border-[var(--border-default)] rounded-md text-[13px] bg-gray-100 text-gray-600 font-semibold cursor-not-allowed"
                  />
                  <p className="text-[11px] text-[var(--text-tertiary)] pt-0.5">El origen del lead no se puede modificar una vez registrado.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-4 border-b border-[var(--border-default)] pb-2 mt-8">
                Preferencias y Presupuesto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className="space-y-1.5">
                  <label htmlFor="presupuesto_min" className="text-[13px] font-medium text-[var(--text-secondary)]">Presupuesto Mínimo ($ USD)</label>
                  <input 
                    type="number" 
                    id="presupuesto_min" 
                    name="presupuesto_min" 
                    defaultValue={cliente.presupuesto_min || ''}
                    className="w-full h-10 px-3 border border-[var(--border-default)] rounded-md text-[13px] focus:outline-none focus:border-[#1A85E5]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="presupuesto_max" className="text-[13px] font-medium text-[var(--text-secondary)]">Presupuesto Máximo ($ USD)</label>
                  <input 
                    type="number" 
                    id="presupuesto_max" 
                    name="presupuesto_max" 
                    defaultValue={cliente.presupuesto_max || ''}
                    className="w-full h-10 px-3 border border-[var(--border-default)] rounded-md text-[13px] focus:outline-none focus:border-[#1A85E5]"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[13px] font-medium text-[var(--text-secondary)]">Etiquetas de Interés</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[var(--bg-hover)] p-5 rounded-md border border-[var(--border-default)]">
                  {TAG_CATEGORIES.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <h4 className="font-semibold text-[var(--text-primary)] text-[13px] border-b border-[var(--border-default)] pb-1 mb-2">{category.name}</h4>
                      <div className="flex flex-col gap-1.5">
                        {category.tags.map((tag) => (
                          <label key={tag} className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]">
                            <input 
                              type="checkbox" 
                              name="etiquetas" 
                              value={tag} 
                              defaultChecked={etiquetasArr.includes(tag)}
                              className="rounded border-[var(--border-default)] text-[#1A85E5] focus:ring-[#1A85E5]" 
                            />
                            <span className="capitalize">{tag}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--border-default)] flex justify-end gap-3">
              <Link
                href={`/clientes/${id}`}
                className="px-4 py-2 rounded-md text-[13px] font-medium text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                Cancelar
              </Link>
              <button 
                type="submit" 
                className="bg-[#1A85E5] text-white px-5 py-2 rounded-md hover:bg-blue-600 focus:outline-none text-[13px] font-semibold transition-colors shadow-sm"
              >
                Guardar Cambios
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  )
}
