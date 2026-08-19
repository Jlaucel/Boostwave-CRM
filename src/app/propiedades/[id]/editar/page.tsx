import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { PageHeader } from '@/components/PageHeader'
import { TAG_CATEGORIES } from '@/lib/constants'
import { editarPropiedad } from '@/app/actions/propiedades'
import { ImageUploader } from '@/components/ImageUploader'
import { parsePropertySpecs } from '@/lib/propertySpecs'

import { requireAuth } from '@/lib/auth'
import { getTenantId } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

export default async function EditarPropiedadPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  const empresaId = await getTenantId()
  const { id } = await params
  
  const [propiedad, agentes] = await Promise.all([
    prisma.propiedad.findFirst({
      where: { id, empresa_id: empresaId }
    }),
    prisma.agente.findMany({
      where: { empresa_id: empresaId },
      orderBy: { nombre: 'asc' }
    })
  ])

  if (!propiedad) {
    notFound()
  }

  // Multi-tenant permission guard: ONLY owner/admin can edit
  const isOwnerOrAdmin = session.isGlobalAdmin || session.rol === 'Agente Owner' || session.rol === 'Agente Admin'

  if (!isOwnerOrAdmin) {
    redirect(`/propiedades/${id}`)
  }

  const specs = parsePropertySpecs(propiedad.caracteristicas_etiquetas, propiedad.descripcion)

  let caracteristicasSeleccionadas: string[] = []
  if (propiedad.caracteristicas_etiquetas) {
    try {
      caracteristicasSeleccionadas = JSON.parse(propiedad.caracteristicas_etiquetas)
    } catch (e) {}
  }
  
  let imagenesActuales: string[] = []
  if (propiedad.imagenes) {
    try {
      imagenesActuales = JSON.parse(propiedad.imagenes)
    } catch (e) {}
  }

  const handleEdit = async (formData: FormData) => {
    'use server'
    const result = await editarPropiedad(id, formData)
    if (result.success) {
      redirect(`/propiedades/${id}`)
    } else {
      throw new Error(result.error || 'Error al actualizar propiedad')
    }
  }

  return (
    <>
      <PageHeader
        title={`Editar: ${propiedad.titulo}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Inventario', href: '/propiedades' },
          { label: propiedad.titulo, href: `/propiedades/${propiedad.id}` },
          { label: 'Editar' }
        ]}
      />

      <div className="p-6 max-w-[900px] mx-auto">
        <form action={handleEdit} encType="multipart/form-data" className="bg-white border border-[var(--border-default)] rounded-xl shadow-[var(--shadow-card)] p-8">
          
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
                  defaultValue={propiedad.titulo}
                  className="w-full h-10 px-3 text-[13px] border border-[var(--border-default)] rounded-md outline-none focus:border-[#42A5F5] focus:ring-1 focus:ring-[#42A5F5]/20"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Descripción General *</label>
                <textarea 
                  name="descripcion" 
                  required
                  defaultValue={propiedad.descripcion}
                  rows={4}
                  className="w-full p-3 text-[13px] border border-[var(--border-default)] rounded-md outline-none focus:border-[#42A5F5] focus:ring-1 focus:ring-[#42A5F5]/20 resize-y"
                ></textarea>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Precio (US$) *</label>
                <input 
                  type="number" 
                  name="precio" 
                  required 
                  defaultValue={propiedad.precio}
                  step="any"
                  className="w-full h-10 px-3 text-[13px] border border-[var(--border-default)] rounded-md outline-none focus:border-[#42A5F5] focus:ring-1 focus:ring-[#42A5F5]/20"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Tipo de Inmueble *</label>
                <select 
                  name="tipo" 
                  defaultValue={propiedad.tipo}
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
                  defaultValue={propiedad.tamano_m2 || ''}
                  step="any"
                  className="w-full h-10 px-3 text-[13px] border border-[var(--border-default)] rounded-md outline-none focus:border-[#42A5F5] focus:ring-1 focus:ring-[#42A5F5]/20"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Estado Comercial</label>
                <select 
                  name="estado" 
                  defaultValue={propiedad.estado}
                  className="w-full h-10 px-3 text-[13px] border border-[var(--border-default)] rounded-md outline-none focus:border-[#42A5F5] focus:ring-1 focus:ring-[#42A5F5]/20 bg-white"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Vendida">Vendida</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: Distribución y Espacios */}
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
                  defaultValue={specs.hab > 0 ? specs.hab : ''}
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
                  defaultValue={specs.banos > 0 ? specs.banos : ''}
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
                  defaultValue={specs.parqueos > 0 ? specs.parqueos : ''}
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
                  defaultValue={propiedad.numero_pisos || ''}
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
                  defaultValue={propiedad.numero_cocinas || ''}
                  placeholder="1"
                  className="w-full h-10 px-3 text-[13px] border border-[var(--border-default)] rounded-md outline-none focus:border-[#42A5F5] focus:ring-1 focus:ring-[#42A5F5]/20"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: Ubicación y Asignación */}
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
                  required 
                  defaultValue={propiedad.provincia}
                  className="w-full h-10 px-3 text-[13px] border border-[var(--border-default)] rounded-md outline-none focus:border-[#42A5F5] focus:ring-1 focus:ring-[#42A5F5]/20"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Sector</label>
                <input 
                  type="text" 
                  name="sector" 
                  required 
                  defaultValue={propiedad.sector}
                  className="w-full h-10 px-3 text-[13px] border border-[var(--border-default)] rounded-md outline-none focus:border-[#42A5F5] focus:ring-1 focus:ring-[#42A5F5]/20"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Estado Legal</label>
                <select 
                  name="estado_legal" 
                  defaultValue={propiedad.estado_legal || 'Al día'}
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
                  defaultValue={propiedad.agente_asignado_id || ''}
                  className="w-full h-10 px-3 text-[13px] border border-[var(--border-default)] rounded-md outline-none focus:border-[#42A5F5] focus:ring-1 focus:ring-[#42A5F5]/20 bg-white"
                >
                  <option value="">-- Sin Asignar --</option>
                  {agentes.map(agente => (
                    <option key={agente.id} value={agente.id}>{agente.nombre}</option>
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
                  defaultChecked={propiedad.multiempresa}
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
                  defaultValue={propiedad.comision_multiempresa || ''}
                  placeholder="Ej: 5.0"
                  className="w-full h-9 px-3 text-[13px] border border-[var(--border-default)] rounded-md outline-none focus:border-[#42A5F5] bg-white"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 5: Imágenes */}
          <div className="mb-8">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-4 pb-2 border-b border-[var(--border-default)]">
              Fotografías e Imágenes
            </h3>
            <ImageUploader imagenesIniciales={imagenesActuales} />
          </div>

          {/* SECCIÓN 6: Características y Amenidades */}
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
                          defaultChecked={caracteristicasSeleccionadas.includes(tag)}
                          className="rounded border-[var(--border-default)] text-[#1A85E5] focus:ring-[#1A85E5]"
                        />
                        <span className="text-[12px] text-[var(--text-primary)] capitalize">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-[var(--border-default)]">
            <a 
              href={`/propiedades/${propiedad.id}`}
              className="px-5 py-2.5 text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded-md transition-colors"
            >
              Cancelar
            </a>
            <button 
              type="submit"
              className="px-6 py-2.5 text-[13px] font-semibold text-white bg-[#1A85E5] hover:bg-blue-600 rounded-md shadow-sm transition-colors"
            >
              Guardar Cambios
            </button>
          </div>

        </form>
      </div>
    </>
  )
}
