import { requireAuth } from '@/lib/auth'
import { getTenantId } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/PageHeader'
import { TAG_CATEGORIES } from '@/lib/constants'
import { crearPropiedad } from '@/app/actions/propiedades'
import { ImageUploader } from '@/components/ImageUploader'

export const dynamic = 'force-dynamic'

export default async function NuevaPropiedadPage() {
  const session = await requireAuth()
  const empresaId = await getTenantId()

  const agentes = await prisma.agente.findMany({
    where: { empresa_id: empresaId, estado: 'Activo' },
    orderBy: { nombre: 'asc' }
  })

  const handleCreate = async (formData: FormData) => {
    'use server'
    const result = await crearPropiedad(formData)
    if (result.success && result.id) {
      redirect(`/propiedades/${result.id}`)
    } else {
      throw new Error(result.error || 'Error al crear la propiedad')
    }
  }

  return (
    <>
      <PageHeader
        title="Registrar Nueva Propiedad"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Inventario', href: '/propiedades' },
          { label: 'Nueva Propiedad' }
        ]}
      />

      <div className="p-6 max-w-[900px] mx-auto">
        <form action={handleCreate} className="bg-white border border-[var(--border-default)] rounded-xl shadow-[var(--shadow-card)] p-8">
          
          {/* SECCIÓN 1: Información Principal */}
          <div className="mb-8">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-4 pb-2 border-b border-[var(--border-default)]">
              Información Principal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Título del Inmueble *</label>
                <input 
                  type="text" 
                  name="titulo" 
                  required 
                  placeholder="Ej: Lujoso Penthouse con Vista al Mar en Piantini"
                  className="w-full h-10 px-3 text-[13px] border border-[var(--border-default)] rounded-md outline-none focus:border-[#42A5F5] focus:ring-1 focus:ring-[#42A5F5]/20"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Descripción General *</label>
                <textarea 
                  name="descripcion" 
                  required
                  rows={4}
                  placeholder="Describe la propiedad, distribución, acabados, vistas y amenidades principales..."
                  className="w-full p-3 text-[13px] border border-[var(--border-default)] rounded-md outline-none focus:border-[#42A5F5] focus:ring-1 focus:ring-[#42A5F5]/20 resize-y"
                ></textarea>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Precio (US$) *</label>
                <input 
                  type="number" 
                  name="precio" 
                  required 
                  step="any"
                  placeholder="250000"
                  className="w-full h-10 px-3 text-[13px] border border-[var(--border-default)] rounded-md outline-none focus:border-[#42A5F5] focus:ring-1 focus:ring-[#42A5F5]/20"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Tipo de Inmueble *</label>
                <select 
                  name="tipo" 
                  required 
                  defaultValue="Apartamento"
                  className="w-full h-10 px-3 text-[13px] border border-[var(--border-default)] rounded-md outline-none focus:border-[#42A5F5] focus:ring-1 focus:ring-[#42A5F5]/20 bg-white"
                >
                  <option value="Apartamento">Apartamento</option>
                  <option value="Casa">Casa</option>
                  <option value="Villa">Villa</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Solar">Solar / Terreno</option>
                  <option value="Local Comercial">Local Comercial</option>
                  <option value="Oficina">Oficina</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Metraje Total (m²)</label>
                <input 
                  type="number" 
                  name="tamano_m2" 
                  step="any"
                  placeholder="185"
                  className="w-full h-10 px-3 text-[13px] border border-[var(--border-default)] rounded-md outline-none focus:border-[#42A5F5] focus:ring-1 focus:ring-[#42A5F5]/20"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Estado Comercial</label>
                <select 
                  name="estado" 
                  defaultValue="Disponible"
                  className="w-full h-10 px-3 text-[13px] border border-[var(--border-default)] rounded-md outline-none focus:border-[#42A5F5] focus:ring-1 focus:ring-[#42A5F5]/20 bg-white"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Vendida">Vendida</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: Especificaciones Inmobiliarias */}
          <div className="mb-8">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-4 pb-2 border-b border-[var(--border-default)]">
              Distribución y Espacios
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Habitaciones</label>
                <input 
                  type="number" 
                  name="hab" 
                  min="0"
                  placeholder="3"
                  className="w-full h-10 px-3 text-[13px] border border-[var(--border-default)] rounded-md outline-none focus:border-[#42A5F5] focus:ring-1 focus:ring-[#42A5F5]/20"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Baños</label>
                <input 
                  type="number" 
                  name="banos" 
                  step="0.5"
                  min="0"
                  placeholder="3.5"
                  className="w-full h-10 px-3 text-[13px] border border-[var(--border-default)] rounded-md outline-none focus:border-[#42A5F5] focus:ring-1 focus:ring-[#42A5F5]/20"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Parqueos</label>
                <input 
                  type="number" 
                  name="parqueos" 
                  min="0"
                  placeholder="2"
                  className="w-full h-10 px-3 text-[13px] border border-[var(--border-default)] rounded-md outline-none focus:border-[#42A5F5] focus:ring-1 focus:ring-[#42A5F5]/20"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Número de Pisos</label>
                <input 
                  type="number" 
                  name="numero_pisos" 
                  min="1"
                  placeholder="1"
                  className="w-full h-10 px-3 text-[13px] border border-[var(--border-default)] rounded-md outline-none focus:border-[#42A5F5] focus:ring-1 focus:ring-[#42A5F5]/20"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Número de Cocinas</label>
                <input 
                  type="number" 
                  name="numero_cocinas" 
                  min="1"
                  placeholder="1"
                  className="w-full h-10 px-3 text-[13px] border border-[var(--border-default)] rounded-md outline-none focus:border-[#42A5F5] focus:ring-1 focus:ring-[#42A5F5]/20"
                />
              </div>

            </div>
          </div>

          {/* SECCIÓN 3: Ubicación y Agente */}
          <div className="mb-8">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-4 pb-2 border-b border-[var(--border-default)]">
              Ubicación y Asignación
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Provincia</label>
                <input 
                  type="text" 
                  name="provincia" 
                  defaultValue="Distrito Nacional"
                  required 
                  className="w-full h-10 px-3 text-[13px] border border-[var(--border-default)] rounded-md outline-none focus:border-[#42A5F5] focus:ring-1 focus:ring-[#42A5F5]/20"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Sector</label>
                <input 
                  type="text" 
                  name="sector" 
                  required 
                  placeholder="Ej: Piantini, Naco, Punta Cana"
                  className="w-full h-10 px-3 text-[13px] border border-[var(--border-default)] rounded-md outline-none focus:border-[#42A5F5] focus:ring-1 focus:ring-[#42A5F5]/20"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Estado Legal</label>
                <select 
                  name="estado_legal" 
                  defaultValue="Al día"
                  className="w-full h-10 px-3 text-[13px] border border-[var(--border-default)] rounded-md outline-none focus:border-[#42A5F5] focus:ring-1 focus:ring-[#42A5F5]/20 bg-white"
                >
                  <option value="Al día">Al día (Título y Deslinde)</option>
                  <option value="En proceso de deslinde">En proceso de deslinde</option>
                  <option value="Título en trámite">Título en trámite</option>
                  <option value="Hipoteca activa">Hipoteca activa</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Agente Asignado</label>
                <select 
                  name="agente_asignado_id" 
                  className="w-full h-10 px-3 text-[13px] border border-[var(--border-default)] rounded-md outline-none focus:border-[#42A5F5] focus:ring-1 focus:ring-[#42A5F5]/20 bg-white"
                >
                  <option value="">-- Sin Asignar --</option>
                  {agentes.map(ag => (
                    <option key={ag.id} value={ag.id}>{ag.nombre} ({ag.rol})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECCIÓN 4: Red Multiempresa (SaaS Multi-Tenant) */}
          <div className="mb-8 bg-blue-50/50 border border-blue-100 rounded-lg p-5">
            <h3 className="text-[13px] font-semibold text-[#1A85E5] mb-2 flex items-center gap-2">
              🌐 Red de Colaboración Multiempresa
            </h3>
            <p className="text-[12px] text-[var(--text-secondary)] mb-4">
              Al activar esta opción, esta propiedad estará visible para los agentes de otras empresas en la red SaaS BoostWave para venta colaborativa.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="multiempresa" 
                  className="w-4 h-4 text-[#1A85E5] rounded border-gray-300 focus:ring-[#1A85E5]"
                />
                <span className="text-[13px] font-medium text-[var(--text-primary)]">Publicar en Red Multiempresa</span>
              </label>

              <div>
                <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1">Comisión para Agencia Colaboradora (%)</label>
                <input 
                  type="number" 
                  name="comision_multiempresa" 
                  step="0.5"
                  min="0"
                  max="50"
                  placeholder="Ej: 5.0"
                  className="w-full h-9 px-3 text-[13px] border border-[var(--border-default)] rounded-md outline-none focus:border-[#42A5F5] bg-white"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 5: Características y Amenidades */}
          <div className="mb-8">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-4 pb-2 border-b border-[var(--border-default)]">
              Características y Amenidades
            </h3>
            <div className="space-y-6">
              {TAG_CATEGORIES.filter(cat => cat.name !== 'Habitaciones').map((category) => (
                <div key={category.name}>
                  <h4 className="text-[12px] font-medium text-[var(--text-secondary)] mb-2.5">
                    {category.name}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {category.tags.map(tag => (
                      <label 
                        key={tag} 
                        className="flex items-center gap-2 p-2 border border-[var(--border-default)] rounded-md hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                      >
                        <input 
                          type="checkbox" 
                          name="etiquetas" 
                          value={tag}
                          className="rounded border-[var(--border-default)] text-[#1A85E5] focus:ring-[#1A85E5]"
                        />
                        <span className="text-[12px] text-[var(--text-primary)]">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECCIÓN 6: Imágenes */}
          <div className="mb-8">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-4 pb-2 border-b border-[var(--border-default)]">
              Fotografías e Imágenes
            </h3>
            <ImageUploader />
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-[var(--border-default)]">
            <a 
              href="/propiedades" 
              className="px-5 py-2.5 text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded-md transition-colors"
            >
              Cancelar
            </a>
            <button 
              type="submit" 
              className="px-6 py-2.5 text-[13px] font-semibold text-white bg-[#1A85E5] hover:bg-blue-600 rounded-md shadow-sm transition-colors"
            >
              Guardar Propiedad
            </button>
          </div>

        </form>
      </div>
    </>
  )
}
