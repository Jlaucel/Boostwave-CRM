'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building, MapPin, Maximize, Users, ChevronLeft, ChevronRight, UserPlus, Image as ImageIcon, Bed, Bath, Car, Clock } from 'lucide-react'
import { Badge, getStatusVariant } from '@/components/Badge'
import { parsePropertySpecs, formatFechaActualizacion } from '@/lib/propertySpecs'

export function PropertyCard({ propiedad, matchCount, activeEmpresaId }: { propiedad: any, matchCount: number, activeEmpresaId?: string }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const { hab, banos, parqueos } = parsePropertySpecs(propiedad.caracteristicas_etiquetas, propiedad.descripcion)
  const fechaEdit = formatFechaActualizacion(propiedad.fecha_actualizacion || propiedad.fecha_creacion)

  const esPropia = !activeEmpresaId || propiedad.empresa_id === activeEmpresaId
  const agenteMostrar = propiedad.agente

  let imagenes: string[] = []
  if (propiedad.imagenes) {
    try {
      imagenes = JSON.parse(propiedad.imagenes)
    } catch (e) {}
  }

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent Link click
    setCurrentImageIndex((prev) => (prev + 1) % imagenes.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent Link click
    setCurrentImageIndex((prev) => (prev - 1 + imagenes.length) % imagenes.length)
  }

  function getInitials(name: string) {
    if (!name) return '?'
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <Link 
      href={`/propiedades/${propiedad.id}`}
      className="group flex flex-col bg-white border border-[var(--border-default)] rounded-xl overflow-hidden transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--border-strong)]"
    >
      {/* Image Carousel — reduced height */}
      <div className="relative pt-[52%] bg-[var(--bg-surface-secondary)] overflow-hidden">
        {imagenes.length > 0 ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={imagenes[currentImageIndex]} 
              alt={propiedad.titulo}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            
            {/* Carousel Controls */}
            {imagenes.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/50 transition-all backdrop-blur-sm z-10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/50 transition-all backdrop-blur-sm z-10"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                {/* Paginator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
                  {imagenes.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all ${idx === currentImageIndex ? 'bg-white scale-110' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-tertiary)]" style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)' }}>
            <ImageIcon className="w-7 h-7 mb-1.5 opacity-40" />
            <span className="text-[11px] font-medium">Sin imagen</span>
          </div>
        )}
        
        {/* Price overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-10 z-10 flex items-end" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.5))' }}>
          <span className="text-white font-bold text-[15px] px-3 pb-1.5 drop-shadow-sm">
            ${propiedad.precio.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main Info — compact */}
      <div className="p-3.5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-semibold text-[14px] text-[var(--text-primary)] leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
            {propiedad.titulo}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          <Badge variant={getStatusVariant(propiedad.estado)} className="text-[10px]">
            {propiedad.estado}
          </Badge>
          <Badge variant="info" className="text-[10px]">
            {propiedad.tipo}
          </Badge>
          {!esPropia && (
            <Badge variant="purple" className="text-[10px]">
              {propiedad.empresa?.nombre_comercial || 'Multiempresa'}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-[var(--text-tertiary)] mb-2.5">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{propiedad.sector}, {propiedad.provincia}</span>
        </div>

        {/* Feature Specs Strip — compact */}
        <div className="flex items-center gap-3 py-2 px-2.5 bg-slate-50 rounded-lg mb-2.5 text-[11px] font-medium text-slate-600">
          <div className="flex items-center gap-1">
            <Bed className="w-3.5 h-3.5 text-blue-500" />
            <span>{hab > 0 ? hab : '-'}</span>
          </div>
          <div className="w-px h-3 bg-slate-200"></div>
          <div className="flex items-center gap-1">
            <Bath className="w-3.5 h-3.5 text-blue-500" />
            <span>{banos > 0 ? banos : '-'}</span>
          </div>
          <div className="w-px h-3 bg-slate-200"></div>
          <div className="flex items-center gap-1">
            <Car className="w-3.5 h-3.5 text-blue-500" />
            <span>{parqueos > 0 ? parqueos : '-'}</span>
          </div>
          {propiedad.tamano_m2 && (
            <>
              <div className="w-px h-3 bg-slate-200"></div>
              <div className="flex items-center gap-1">
                <Maximize className="w-3 h-3 text-slate-400" />
                <span>{propiedad.tamano_m2}m²</span>
              </div>
            </>
          )}
        </div>

        {/* Footer — agent & meta */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-2.5 border-t border-slate-100">
          {agenteMostrar ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}
              >
                {getInitials(agenteMostrar.nombre)}
              </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-medium text-[var(--text-secondary)] truncate">{agenteMostrar.nombre}</span>
              {agenteMostrar.telefono && (
                <span className="text-[9px] text-[var(--text-tertiary)] truncate">{agenteMostrar.telefono}</span>
              )}
            </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-bold">
              <UserPlus className="w-3 h-3" />
              <span>{esPropia ? 'Sin asignar' : 'Sin agente'}</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)]">
              <Users className={`w-3 h-3 flex-shrink-0 ${matchCount > 0 ? 'text-emerald-500' : ''}`} />
              <span className={matchCount > 0 ? 'text-emerald-600 font-bold' : ''}>{matchCount}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)]">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span>{fechaEdit}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
