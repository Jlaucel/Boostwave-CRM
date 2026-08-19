import { requireAuth } from '@/lib/auth'
import { getTenantId } from '@/lib/tenant'
import { TAG_CATEGORIES } from '@/lib/constants'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { 
  Users, Phone, DollarSign, Building, Tag, MapPin, Calendar, 
  Edit, History, Maximize, FileText, GitCommitHorizontal, ArrowRight,
  Bed, Bath, Car, Clock, Ruler, Layers, ChefHat
} from 'lucide-react'
import { Badge, getStatusVariant } from '@/components/Badge'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'
import { DownloadPDFButton } from '@/components/DownloadPDFButton'
import { MarcarVendidaButton } from '@/components/MarcarVendidaButton'
import { parsePropertySpecs } from '@/lib/propertySpecs'
import { AgenteAsignadorMultiempresa } from '@/components/AgenteAsignadorMultiempresa'

export const dynamic = 'force-dynamic'

function getInitials(name: string) {
  if (!name) return '?'
  return name.substring(0, 2).toUpperCase()
}

const ClientCard = ({ cliente }: { cliente: any }) => {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[var(--border-default)] last:border-0 no-print">
      <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-[12px] flex-shrink-0">
        {getInitials(cliente.nombre || cliente.telefono)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div className="font-semibold text-[13px] text-[var(--text-primary)] truncate">
            {cliente.nombre || 'Sin nombre'}
          </div>
          <Link href={`/clientes/${cliente.id}`} className="text-[#1A85E5] hover:underline text-[12px] flex-shrink-0 ml-2">
            Ver perfil
          </Link>
        </div>
        <div className="text-[12px] text-[var(--text-tertiary)] mt-1 flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3 h-3" />
            {cliente.telefono}
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3 h-3" />
            {cliente.presupuesto_max ? `$${cliente.presupuesto_max.toLocaleString()}` : 'Sin definir'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function PropiedadDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireAuth()
  const empresaId = await getTenantId()
  const { id } = await params
  
  const [propiedad, clientes, ventasDePropiedad, agentesMiEmpresa, miEmpresa] = await Promise.all([
    prisma.propiedad.findFirst({
      where: {
        id,
        OR: [
          { empresa_id: empresaId },
          { multiempresa: true }
        ]
      },
      include: {
        agente: true,
        empresa: true,
        historial: {
          orderBy: { fecha: 'desc' }
        },
        asignacionesMultiempresa: {
          where: { empresa_id: empresaId },
          include: { agente: true }
        }
      }
    }),
    prisma.cliente.findMany({
      where: { empresa_id: empresaId },
      include: { 
        agente: true,
        ventas: {
          include: { propiedad: true }
        }
      }
    }),
    prisma.venta.findMany({
      where: { propiedad_id: id, empresa_id: empresaId },
      include: {
        cliente: true,
        agente: true
      },
      orderBy: { fecha_interes: 'desc' }
    }),
    prisma.agente.findMany({
      where: { empresa_id: empresaId, estado: 'Activo' },
      orderBy: { nombre: 'asc' }
    }),
    prisma.empresa.findUnique({ where: { id: empresaId } })
  ])

  if (!propiedad) {
    notFound()
  }

  const esPropia = propiedad.empresa_id === empresaId
  const specs = parsePropertySpecs(propiedad.caracteristicas_etiquetas, propiedad.descripcion)
  const precioM2 = propiedad.tamano_m2 && propiedad.tamano_m2 > 0 ? Math.round(propiedad.precio / propiedad.tamano_m2) : null

  let caracteristicas: string[] = []
  if (propiedad.caracteristicas_etiquetas) {
    try {
      caracteristicas = JSON.parse(propiedad.caracteristicas_etiquetas) as string[]
    } catch (e) {}
  }

  let imagenes: string[] = []
  if (propiedad.imagenes) {
    try {
      imagenes = JSON.parse(propiedad.imagenes) as string[]
    } catch (e) {}
  }

  const propTipo = propiedad.tipo.toLowerCase()
  
  const clientesEnPresupuesto: any[] = []
  const clientesPorAmenidades: any[] = []

  clientes.forEach(cliente => {
    if (!cliente.etiquetas) return
    let cEtiquetas: string[] = []
    try { cEtiquetas = JSON.parse(cliente.etiquetas) } catch (e) { return }
    
    if (!cEtiquetas.includes(propTipo)) return

    const sharedTags = caracteristicas.filter(t => t.toLowerCase() !== propTipo && cEtiquetas.includes(t))
    const clientBudget = cliente.presupuesto_max || 0
    const isInBudgetRange = propiedad.precio <= clientBudget * 1.10

    if (isInBudgetRange && sharedTags.length >= 2) {
      clientesEnPresupuesto.push(cliente)
    } else if (!isInBudgetRange && sharedTags.length >= 3) {
      clientesPorAmenidades.push(cliente)
    }
  })

  const caracteristicasAgrupadas = TAG_CATEGORIES.map(categoria => {
    return {
      nombre: categoria.name,
      tags: categoria.tags.filter(t => caracteristicas.includes(t))
    }
  }).filter(c => c.tags.length > 0)

  const todasLasTagsDefinidas = TAG_CATEGORIES.flatMap(c => c.tags)
  const tagsExtras = caracteristicas.filter(t => !todasLasTagsDefinidas.includes(t))
  
  if (tagsExtras.length > 0) {
    caracteristicasAgrupadas.push({
      nombre: "Otras Características",
      tags: tagsExtras
    })
  }

  // Pipeline stage counts for this property
  const ACTIVE_STAGES = [
    { name: 'Contacto Inicial', color: '#1B96FF' },
    { name: 'Interesado', color: '#06A5B5' },
    { name: 'Visita Programada', color: '#DD7A01' },
    { name: 'Oferta Realizada', color: '#8B5CF6' },
  ]

  const stageCounts = ACTIVE_STAGES.map(stage => ({
    ...stage,
    count: ventasDePropiedad.filter(v => v.estado_venta === stage.name).length
  })).filter(s => s.count > 0)

  const procesosActivos = ventasDePropiedad.filter(
    v => v.estado_venta !== 'Cerrado/Ganado' && v.estado_venta !== 'Perdido'
  )

  return (
    <>
      <PageHeader
        title={propiedad.titulo}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Inventario', href: '/propiedades' },
          { label: propiedad.titulo }
        ]}
        actions={
          <>
            {esPropia && (session.isGlobalAdmin || session.rol === 'Agente Owner' || session.rol === 'Agente Admin') && (
              <>
                {propiedad.estado !== 'Vendida' && (
                  <MarcarVendidaButton propiedadId={propiedad.id} />
                )}
                <Link 
                  href={`/propiedades/${propiedad.id}/editar`}
                className="no-print flex items-center gap-2 bg-white border border-[var(--border-default)] text-[var(--text-secondary)] px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-[var(--bg-hover)] transition-colors"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Link>
              </>
            )}
            <div className="no-print">
              <DownloadPDFButton propiedad={propiedad} />
            </div>
          </>
        }
      />

      <div className="p-6 max-w-[1200px] mx-auto" id="ficha-tecnica">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          
          {/* Left Panel - Ficha Técnica & Historial */}
          <div className="space-y-6">
            
            {/* Main Header & Image Gallery */}
            <div className="bg-white border border-[var(--border-default)] rounded-xl shadow-[var(--shadow-card)] p-8">
              
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-[24px] font-bold text-[var(--text-primary)] mb-3 leading-tight">{propiedad.titulo}</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="info">
                      <Building className="w-3.5 h-3.5 mr-1" />
                      {propiedad.tipo}
                    </Badge>
                    <Badge variant="neutral">
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      {propiedad.sector}, {propiedad.provincia}
                    </Badge>
                    <Badge variant={getStatusVariant(propiedad.estado)}>
                      {propiedad.estado}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[28px] font-bold text-[#1A85E5]">
                    ${propiedad.precio.toLocaleString()} USD
                  </div>
                  {precioM2 && (
                    <div className="text-[12px] font-semibold text-slate-500 mt-1">
                      ${precioM2.toLocaleString()} USD / m²
                    </div>
                  )}
                </div>
              </div>

              {/* SPEC METRICS STRIP (Área, Habitaciones, Baños, Parqueos, Pisos, Cocinas) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-10 py-6 border-y border-slate-100">
                
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-slate-50 text-slate-500 border border-slate-100 flex items-center justify-center flex-shrink-0">
                    <Ruler className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Área</span>
                    <span className="text-[13px] font-bold text-slate-800">
                      {propiedad.tamano_m2 ? `${propiedad.tamano_m2} m²` : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-slate-50 text-slate-500 border border-slate-100 flex items-center justify-center flex-shrink-0">
                    <Bed className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Habitaciones</span>
                    <span className="text-[13px] font-bold text-slate-800">
                      {specs.hab > 0 ? `${specs.hab} hab` : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-slate-50 text-slate-500 border border-slate-100 flex items-center justify-center flex-shrink-0">
                    <Bath className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Baños</span>
                    <span className="text-[13px] font-bold text-slate-800">
                      {specs.banos > 0 ? `${specs.banos} baños` : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-slate-50 text-slate-500 border border-slate-100 flex items-center justify-center flex-shrink-0">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Parqueos</span>
                    <span className="text-[13px] font-bold text-slate-800">
                      {specs.parqueos > 0 ? `${specs.parqueos} parq` : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-slate-50 text-slate-500 border border-slate-100 flex items-center justify-center flex-shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Pisos</span>
                    <span className="text-[13px] font-bold text-slate-800">
                      {propiedad.numero_pisos ? `${propiedad.numero_pisos}` : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-slate-50 text-slate-500 border border-slate-100 flex items-center justify-center flex-shrink-0">
                    <ChefHat className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Cocinas</span>
                    <span className="text-[13px] font-bold text-slate-800">
                      {propiedad.numero_cocinas ? `${propiedad.numero_cocinas}` : 'N/A'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Imágenes */}
              {imagenes.length > 0 && (
                <div className="mb-8 overflow-hidden rounded-xl border border-[var(--border-default)] shadow-sm">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-1 bg-[var(--border-default)]">
                    {imagenes.map((url, idx) => (
                      <div key={idx} className="relative pt-[75%] bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={url} 
                          alt={`${propiedad.titulo} - Foto ${idx + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                          crossOrigin="anonymous"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DESCRIPCIÓN GENERAL DEL INMUEBLE */}
              <div className="mb-10">
                <h3 className="text-[12px] font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                  Descripción
                </h3>
                <div className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                  {propiedad.descripcion || 'No se ha registrado una descripción detallada para este inmueble.'}
                </div>
              </div>

              {/* Detalles Legales */}
              <div className="mb-10 pt-8 border-t border-slate-100">
                <h3 className="text-[12px] font-bold text-slate-400 mb-5 uppercase tracking-wider flex items-center gap-2">
                  Detalles Legales & Titulación
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
                      Estatus Legal
                    </span>
                    <span className="text-[14px] font-medium text-[var(--text-primary)]">
                      {propiedad.estado_legal || 'Títulos al día / Apto para crédito bancario'}
                    </span>
                  </div>
                  <Badge variant="success" className="px-3 py-1 text-[11px]">
                    Verificado RD
                  </Badge>
                </div>
              </div>

              {/* Amenidades y Características */}
              <div className="mb-10 pt-8 border-t border-slate-100">
                <h3 className="text-[12px] font-bold text-slate-400 mb-5 uppercase tracking-wider flex items-center gap-2">
                  Amenidades y Características
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {caracteristicasAgrupadas.length === 0 ? (
                    <div className="text-[13px] text-[var(--text-tertiary)]">No hay amenidades registradas.</div>
                  ) : (
                    caracteristicasAgrupadas.map(categoria => (
                      <div key={categoria.nombre}>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
                          {categoria.nombre}
                        </div>
                        <ul className="space-y-2.5">
                          {categoria.tags.map(tag => (
                            <li key={tag} className="flex items-center gap-2.5 text-[13.5px] text-slate-700 capitalize">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0"></span>
                              {tag}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* HISTORIAL DE CAMBIOS */}
              <div className="pt-8 border-t border-slate-100 no-print">
                <h3 className="text-[12px] font-bold text-slate-400 mb-6 uppercase tracking-wider flex items-center gap-2">
                  Historial de Cambios
                </h3>
                
                {propiedad.historial && propiedad.historial.length > 0 ? (
                  <div className="relative border-l-2 border-slate-100 ml-3 space-y-7">
                    {propiedad.historial.map((evento) => (
                      <div key={evento.id} className="relative pl-6">
                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-slate-200"></div>
                        <div className="mb-1 text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                          <Clock className="w-3 h-3" />
                          {new Date(evento.fecha).toLocaleString('es-ES', { 
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                        <div className="text-[13px] text-slate-700 mt-1.5">
                          Modificó <span className="font-semibold text-slate-900 capitalize">{evento.campo_modificado}</span>
                        </div>
                        <div className="text-[13px] mt-2 flex items-center gap-2.5">
                          <span className="text-slate-400 line-through decoration-slate-300">
                            {evento.campo_modificado === 'precio' ? `$${parseFloat(evento.valor_anterior || '0').toLocaleString()} USD` : (evento.valor_anterior || 'Vacío')}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                            {evento.campo_modificado === 'precio' ? `$${parseFloat(evento.valor_nuevo || '0').toLocaleString()} USD` : evento.valor_nuevo}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-[13px] flex flex-col items-center">
                    <Clock className="w-6 h-6 mb-3 opacity-30" />
                    <span>No hay modificaciones registradas.</span>
                  </div>
                )}
              </div>
            </div>
            
          </div>

          {/* Right Panel - Resumen, Agente Asignado y Matches */}
          <div className="space-y-6">
            
            <div className="bg-white border rounded-xl shadow-[var(--shadow-card)] p-6 no-print">
              <h3 className="text-[16px] font-bold text-[var(--text-primary)] mb-4">Resumen Rápido</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-[var(--border-default)]">
                  <span className="text-[13px] text-[var(--text-secondary)] flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[var(--text-tertiary)]" /> Precio Total
                  </span>
                  <span className="font-bold text-[14px] text-[#1A85E5]">${propiedad.precio.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[var(--border-default)]">
                  <span className="text-[13px] text-[var(--text-secondary)] flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-[var(--text-tertiary)]" /> Área Total
                  </span>
                  <span className="font-semibold text-[13px]">{propiedad.tamano_m2 ? `${propiedad.tamano_m2} m²` : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[var(--border-default)]">
                  <span className="text-[13px] text-[var(--text-secondary)] flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[var(--text-tertiary)]" /> Estado
                  </span>
                  <Badge variant={getStatusVariant(propiedad.estado)}>{propiedad.estado}</Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[13px] text-[var(--text-secondary)] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[var(--text-tertiary)]" /> Publicada
                  </span>
                  <span className="text-[13px] text-[var(--text-primary)] font-medium">
                    {new Date(propiedad.fecha_creacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Pipeline Stage Indicators */}
              {stageCounts.length > 0 && (
                <div className="mt-5 pt-4 border-t border-[var(--border-default)]">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3 flex items-center gap-1.5">
                    <GitCommitHorizontal className="w-3.5 h-3.5 text-[#1A85E5]" />
                    Actividad en Pipeline
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stageCounts.map(stage => (
                      <div 
                        key={stage.name}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[11px] font-semibold"
                        style={{ 
                          borderColor: stage.color + '40',
                          backgroundColor: stage.color + '10',
                          color: stage.color 
                        }}
                      >
                        <Users className="w-3 h-3" />
                        <span>{stage.count}</span>
                        <span className="font-normal opacity-80">{stage.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Agente Asignado & Multiempresa Assignment Component */}
            <AgenteAsignadorMultiempresa
              propiedadId={propiedad.id}
              agentesEmpresa={agentesMiEmpresa}
              agenteAsignadoActualId={esPropia ? propiedad.agente_asignado_id : (propiedad.asignacionesMultiempresa?.[0]?.agente_id || null)}
              agenteAsignadoActualNombre={esPropia ? propiedad.agente?.nombre : (propiedad.asignacionesMultiempresa?.[0]?.agente?.nombre || null)}
              nombreEmpresaActual={miEmpresa?.nombre_comercial || 'Tu Empresa'}
              esPropietaria={esPropia}
              puedeEditar={session.isGlobalAdmin || session.rol === 'Agente Owner' || session.rol === 'Agente Admin'}
            />

            {/* If cross-tenant property from another company, also display original agency & contact */}
            {!esPropia && (
              <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-5 no-print">
                <div className="text-[11px] font-bold uppercase tracking-wider text-purple-700 mb-1">
                  🏢 Agencia Propietaria del Inmueble
                </div>
                <div className="text-[14px] font-bold text-purple-900 mb-1">
                  {propiedad.empresa?.nombre_comercial || 'Empresa Colaboradora'}
                </div>
                {propiedad.agente && (
                  <div className="text-[12px] text-purple-800">
                    Agente de Contacto Original: <span className="font-semibold">{propiedad.agente.nombre}</span> ({propiedad.agente.email})
                  </div>
                )}
                {propiedad.comision_multiempresa && (
                  <div className="mt-2 inline-block bg-purple-200/60 text-purple-900 text-[11px] font-bold px-2.5 py-0.5 rounded">
                    Comisión Compartida Red: {propiedad.comision_multiempresa}%
                  </div>
                )}
              </div>
            )}

            {/* Matches Section */}
            <div className="bg-white border rounded-xl shadow-[var(--shadow-card)] p-6 no-print space-y-6">
              <div>
                <h3 className="text-[16px] font-semibold text-[var(--text-primary)] mb-1 flex items-center justify-between">
                  <span>Matches Ideales</span>
                  <span className="text-[12px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {clientesEnPresupuesto.length}
                  </span>
                </h3>
                <p className="text-[12px] text-[var(--text-tertiary)] mb-3">Clientes con presupuesto suficiente y coincidence de intereses.</p>
                {clientesEnPresupuesto.length === 0 ? (
                  <div className="text-[13px] text-[var(--text-tertiary)] italic py-2">No hay coincidencia exacta.</div>
                ) : (
                  clientesEnPresupuesto.map(cliente => (
                    <ClientCard key={cliente.id} cliente={cliente} />
                  ))
                )}
              </div>

              <div className="pt-4 border-t border-[var(--border-default)]">
                <h3 className="text-[16px] font-semibold text-[var(--text-primary)] mb-1 flex items-center justify-between">
                  <span>Matches por Intereses</span>
                  <span className="text-[12px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    {clientesPorAmenidades.length}
                  </span>
                </h3>
                <p className="text-[12px] text-[var(--text-tertiary)] mb-3">Interesados en las características de esta propiedad.</p>
                {clientesPorAmenidades.length === 0 ? (
                  <div className="text-[13px] text-[var(--text-tertiary)] italic py-2">No hay coincidencias secundarias.</div>
                ) : (
                  clientesPorAmenidades.map(cliente => (
                    <ClientCard key={cliente.id} cliente={cliente} />
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  )
}
