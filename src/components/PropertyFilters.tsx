'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'
import { Search, Filter } from 'lucide-react'

export function PropertyFilters({ agentes }: { agentes: { id: string, nombre: string }[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  
  // Custom debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 500)
    return () => clearTimeout(timer)
  }, [query])
  
  const [tipo, setTipo] = useState(searchParams.get('tipo') || '')
  const [estado, setEstado] = useState(searchParams.get('estado') || '')
  const [agente, setAgente] = useState(searchParams.get('agente') || '')
  const [hab, setHab] = useState(searchParams.get('hab') || '')
  const [banos, setBanos] = useState(searchParams.get('banos') || '')
  const [parqueos, setParqueos] = useState(searchParams.get('parqueos') || '')

  const updateFilters = useCallback(() => {
    const params = new URLSearchParams()
    
    if (debouncedQuery) params.set('q', debouncedQuery)
    if (tipo) params.set('tipo', tipo)
    if (estado) params.set('estado', estado)
    if (agente) params.set('agente', agente)
    if (hab) params.set('hab', hab)
    if (banos) params.set('banos', banos)
    if (parqueos) params.set('parqueos', parqueos)
    
    const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`
    router.push(newUrl)
  }, [debouncedQuery, tipo, estado, agente, hab, banos, parqueos, router, pathname])

  useEffect(() => {
    updateFilters()
  }, [debouncedQuery, tipo, estado, agente, hab, banos, parqueos, updateFilters])

  const hasFilters = query || tipo || estado || agente || hab || banos || parqueos

  return (
    <div className="bg-white border border-[var(--border-default)] rounded-xl shadow-[var(--shadow-card)] p-5 mb-6 space-y-4">
      <div className="flex flex-col md:flex-row items-center gap-4">
        
        {/* Búsqueda por texto */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[var(--text-tertiary)]" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, sector, provincia..."
            className="block w-full pl-9 h-10 border border-[var(--border-default)] rounded-lg text-[13px] text-[var(--text-primary)] focus:border-[#1A85E5] focus:ring-1 focus:ring-[#1A85E5]/20 bg-white"
          />
        </div>

        {/* Action Clear Button if any filter active */}
        {hasFilters && (
          <button 
            onClick={() => {
              setQuery('')
              setTipo('')
              setEstado('')
              setAgente('')
              setHab('')
              setBanos('')
              setParqueos('')
            }}
            className="text-[12px] font-bold text-red-600 hover:underline flex items-center gap-1"
          >
            Limpiar Todos los Filtros
          </button>
        )}

      </div>

      {/* Row of Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)] font-bold">
          <Filter className="w-3.5 h-3.5 text-[#1A85E5]" /> Filtrar por:
        </div>
        
        <select 
          value={tipo} 
          onChange={e => setTipo(e.target.value)}
          className="h-9 px-3 border border-[var(--border-default)] rounded-lg text-[12px] text-[var(--text-primary)] focus:border-[#1A85E5] bg-white font-medium"
        >
          <option value="">Todos los tipos</option>
          <option value="Apartamento">Apartamentos</option>
          <option value="Casa">Casas</option>
          <option value="Villa">Villas</option>
          <option value="Solar">Solares</option>
          <option value="Local Comercial">Locales</option>
        </select>

        <select 
          value={hab} 
          onChange={e => setHab(e.target.value)}
          className="h-9 px-3 border border-[var(--border-default)] rounded-lg text-[12px] text-[var(--text-primary)] focus:border-[#1A85E5] bg-white font-medium"
        >
          <option value="">Habitaciones: Todas</option>
          <option value="1">1+ Habitaciones</option>
          <option value="2">2+ Habitaciones</option>
          <option value="3">3+ Habitaciones</option>
          <option value="4">4+ Habitaciones</option>
        </select>

        <select 
          value={banos} 
          onChange={e => setBanos(e.target.value)}
          className="h-9 px-3 border border-[var(--border-default)] rounded-lg text-[12px] text-[var(--text-primary)] focus:border-[#1A85E5] bg-white font-medium"
        >
          <option value="">Baños: Todos</option>
          <option value="1">1+ Baños</option>
          <option value="2">2+ Baños</option>
          <option value="3">3+ Baños</option>
        </select>

        <select 
          value={parqueos} 
          onChange={e => setParqueos(e.target.value)}
          className="h-9 px-3 border border-[var(--border-default)] rounded-lg text-[12px] text-[var(--text-primary)] focus:border-[#1A85E5] bg-white font-medium"
        >
          <option value="">Parqueos: Todos</option>
          <option value="1">1+ Parqueo</option>
          <option value="2">2+ Parqueos</option>
          <option value="3">3+ Parqueos</option>
        </select>

        <select 
          value={estado} 
          onChange={e => setEstado(e.target.value)}
          className="h-9 px-3 border border-[var(--border-default)] rounded-lg text-[12px] text-[var(--text-primary)] focus:border-[#1A85E5] bg-white font-medium"
        >
          <option value="">Disponible (Activas)</option>
          <option value="Todos">Todas</option>
          <option value="Vendida">Vendida</option>
        </select>

        <select 
          value={agente} 
          onChange={e => setAgente(e.target.value)}
          className="h-9 px-3 border border-[var(--border-default)] rounded-lg text-[12px] text-[var(--text-primary)] focus:border-[#1A85E5] bg-white font-medium"
        >
          <option value="">Cualquier agente</option>
          <option value="unassigned">Sin asignar</option>
          {agentes.map(a => (
            <option key={a.id} value={a.id}>{a.nombre}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
