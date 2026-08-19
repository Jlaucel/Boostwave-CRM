'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { Badge, getOriginVariant, getStatusVariant } from '@/components/Badge'
import { Users, Plus, Search, Filter, X, Phone, DollarSign, UserCheck, ArrowRight } from 'lucide-react'
import { normalizarTelefono, formatearTelefono } from '@/lib/phoneUtils'

export function ClientesClient({
  clientesIniciales,
  agentes,
  isCompanyAdmin = false
}: {
  clientesIniciales: any[]
  agentes: any[]
  isCompanyAdmin?: boolean
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('todos')
  const [agenteFilter, setAgenteFilter] = useState('todos')
  const [origenFilter, setOrigenFilter] = useState('todos')

  // Available unique origins from current clients
  const origenOptions = useMemo(() => {
    const set = new Set<string>()
    clientesIniciales.forEach(c => {
      if (c.origen) set.add(c.origen)
    })
    return Array.from(set)
  }, [clientesIniciales])

  // Filter logic
  const clientesFiltrados = useMemo(() => {
    const termClean = searchTerm.trim().toLowerCase()
    const termDigits = normalizarTelefono(searchTerm)

    return clientesIniciales.filter(cliente => {
      // 1. Search text (name, phone raw or phone 10-digit normalized)
      if (termClean) {
        const nameMatch = cliente.nombre?.toLowerCase().includes(termClean)
        const rawPhoneMatch = cliente.telefono?.toLowerCase().includes(termClean)
        const normPhoneMatch = termDigits && normalizarTelefono(cliente.telefono).includes(termDigits)
        if (!nameMatch && !rawPhoneMatch && !normPhoneMatch) return false
      }

      // 2. Estado filter
      if (estadoFilter !== 'todos') {
        if (cliente.estado !== estadoFilter) return false
      }

      // 3. Agente filter
      if (agenteFilter !== 'todos') {
        if (agenteFilter === 'sin_agente') {
          if (cliente.agente_asignado_id || cliente.agente) return false
        } else {
          if (cliente.agente_asignado_id !== agenteFilter) return false
        }
      }

      // 4. Origen filter
      if (origenFilter !== 'todos') {
        if (cliente.origen !== origenFilter) return false
      }

      return true
    })
  }, [clientesIniciales, searchTerm, estadoFilter, agenteFilter, origenFilter])

  const hasActiveFilters = searchTerm !== '' || estadoFilter !== 'todos' || agenteFilter !== 'todos' || origenFilter !== 'todos'

  const clearFilters = () => {
    setSearchTerm('')
    setEstadoFilter('todos')
    setAgenteFilter('todos')
    setOrigenFilter('todos')
  }

  return (
    <>
      <PageHeader
        title="Gestión de Clientes"
        icon={Users}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Clientes' }
        ]}
        actions={
          <Link 
            href="/clientes/nuevo" 
            className="flex items-center gap-2 bg-[#1A85E5] text-white px-4 py-2 rounded-md hover:bg-blue-600 text-[13px] font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            + Nuevo Cliente
          </Link>
        }
      />

      <div className="p-6 space-y-6 max-w-[1300px] mx-auto">
        
        {/* Filters Bar Card */}
        <div className="bg-white border rounded-xl shadow-[var(--shadow-card)] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-[14px] text-[var(--text-primary)]">
              <Filter className="w-4 h-4 text-[#1A85E5]" />
              Filtros de Búsqueda
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-[12px] text-red-600 font-semibold hover:underline"
              >
                <X className="w-3.5 h-3.5" /> Limpiar Filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
              <input
                type="text"
                placeholder="Buscar por nombre o teléfono (ej. 8092994983)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-9 pr-4 border border-[var(--border-default)] rounded-lg text-[13px] bg-white focus:outline-none focus:border-[#1A85E5]"
              />
            </div>

            {/* Filter by Estado */}
            <div>
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="w-full h-10 px-3 border border-[var(--border-default)] rounded-lg text-[13px] bg-white focus:outline-none focus:border-[#1A85E5]"
              >
                <option value="todos">Todos los Estados</option>
                <option value="Nuevo">Nuevo</option>
                <option value="En Asignación">En Asignación</option>
                <option value="Inicio de Negociación">Inicio de Negociación</option>
                <option value="Cierre Exitoso">Cierre Exitoso</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            {/* Filter by Agente (Visible ONLY for Owner / Admin) */}
            {isCompanyAdmin && (
              <div>
                <select
                  value={agenteFilter}
                  onChange={(e) => setAgenteFilter(e.target.value)}
                  className="w-full h-10 px-3 border border-[var(--border-default)] rounded-lg text-[13px] bg-white focus:outline-none focus:border-[#1A85E5]"
                >
                  <option value="todos">Todos los Agentes</option>
                  <option value="sin_agente">Sin Agente Asignado</option>
                  {agentes.map(a => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Filter by Origen */}
            <div>
              <select
                value={origenFilter}
                onChange={(e) => setOrigenFilter(e.target.value)}
                className="w-full h-10 px-3 border border-[var(--border-default)] rounded-lg text-[13px] bg-white focus:outline-none focus:border-[#1A85E5]"
              >
                <option value="todos">Todos los Orígenes</option>
                {origenOptions.map(origen => (
                  <option key={origen} value={origen}>{origen}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="text-[12px] text-[var(--text-tertiary)] flex items-center justify-between pt-1">
            <span>Mostrando <strong className="text-[var(--text-primary)]">{clientesFiltrados.length}</strong> de {clientesIniciales.length} clientes</span>
            <span className="text-[11px] font-medium text-slate-500">* Los teléfonos se comparan automáticamente considerando sus últimos 10 dígitos.</span>
          </div>
        </div>

        {/* Clients Enterprise Data Table */}
        <div className="bg-white border rounded-xl shadow-[var(--shadow-card)] p-6">
          {clientesFiltrados.length === 0 ? (
            <EmptyState 
              icon={Users} 
              title="No se encontraron clientes" 
              description="No hay clientes que coincidan con los filtros seleccionados o aún no has registrado ninguno." 
              actionLabel="Crear Cliente" 
              actionHref="/clientes/nuevo" 
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Teléfono</th>
                    <th>Origen Lead</th>
                    <th>Oportunidades</th>
                    <th>Agente Asignado</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {clientesFiltrados.map((cliente) => {
                    const activeVentasCount = cliente.ventas?.filter((v: any) => v.estado_venta !== 'Cerrado/Ganado' && v.estado_venta !== 'Perdido').length || 0

                    return (
                      <tr key={cliente.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#1A85E5] text-white flex items-center justify-center font-bold text-[12px]">
                              {(cliente.nombre || 'C').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <Link href={`/clientes/${cliente.id}`} className="font-bold text-[13px] text-[var(--text-primary)] hover:text-[#1A85E5]">
                                {cliente.nombre || 'Sin nombre'}
                              </Link>
                              {cliente.correo_electronico && (
                                <div className="text-[11px] text-[var(--text-tertiary)]">{cliente.correo_electronico}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="font-semibold text-[13px] text-[var(--text-secondary)] font-mono">
                            {formatearTelefono(cliente.telefono)}
                          </span>
                        </td>
                        <td>
                          <Badge variant={getOriginVariant(cliente.origen)}>{cliente.origen || 'Manual'}</Badge>
                        </td>
                        <td>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            activeVentasCount > 0 ? 'bg-blue-50 text-[#1A85E5] border border-blue-200' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {activeVentasCount > 0 ? `${activeVentasCount} Activa(s)` : 'Sin ventas'}
                          </span>
                        </td>
                        <td>
                          {cliente.agente ? (
                            <div className="flex items-center gap-1.5" title={cliente.agente.nombre}>
                              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold">
                                {cliente.agente.nombre.charAt(0)}
                              </div>
                              <span className="text-[12px] font-medium text-[var(--text-secondary)]">
                                {cliente.agente.nombre}
                              </span>
                            </div>
                          ) : (
                            <span className="text-amber-600 text-[11px] font-bold flex items-center gap-1">
                              <UserCheck className="w-3 h-3" /> Sin agente
                            </span>
                          )}
                        </td>
                        <td>
                          <Badge variant={getStatusVariant(cliente.estado)}>{cliente.estado}</Badge>
                        </td>
                        <td>
                          <Link
                            href={`/clientes/${cliente.id}`}
                            className="flex items-center gap-1 text-[12px] font-semibold text-[#1A85E5] hover:underline"
                          >
                            Ver Perfil <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </>
  )
}
