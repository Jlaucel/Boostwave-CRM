'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { Badge, getOriginVariant, getStatusVariant } from '@/components/Badge'
import { Phone, Mail, DollarSign, Edit, UserCheck, GitCommitHorizontal, Building, ArrowRight, Tag } from 'lucide-react'
import { formatearTelefono } from '@/lib/phoneUtils'
import { assignAgentToClient } from '@/app/actions/agentes'

export function ClienteDetalleClient({
  cliente,
  agentes,
  isCompanyAdmin = false
}: {
  cliente: any
  agentes: any[]
  isCompanyAdmin?: boolean
}) {
  const [agenteAsignadoId, setAgenteAsignadoId] = useState<string>(cliente.agente_asignado_id || '')
  const [isPending, startTransition] = useTransition()

  // Calculate active opportunities
  const ventasActivas = cliente.ventas?.filter(
    (v: any) => v.estado_venta !== 'Cerrado/Ganado' && v.estado_venta !== 'Perdido'
  ) || []

  // Parse tags
  let etiquetas: string[] = []
  if (cliente.etiquetas) {
    try {
      etiquetas = JSON.parse(cliente.etiquetas)
    } catch {}
  }

  const handleAgentChange = (nuevoAgenteId: string) => {
    if (!isCompanyAdmin) return
    setAgenteAsignadoId(nuevoAgenteId)
    startTransition(async () => {
      const res = await assignAgentToClient(cliente.id, nuevoAgenteId)
      if (res && !res.success) {
        alert(res.error || 'Error al cambiar de agente')
      }
    })
  }

  return (
    <>
      <PageHeader
        title={cliente.nombre || 'Perfil de Cliente'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Clientes', href: '/clientes' },
          { label: cliente.nombre || cliente.telefono }
        ]}
        actions={
          <Link
            href={`/clientes/${cliente.id}/editar`}
            className="flex items-center gap-2 bg-white border border-[var(--border-default)] text-[var(--text-secondary)] px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-[var(--bg-hover)] transition-colors shadow-sm"
          >
            <Edit className="w-4 h-4" />
            Editar Cliente
          </Link>
        }
      />

      <div className="p-6 max-w-[1200px] mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
          
          {/* LEFT PANEL: Client Profile & Agent Assignment */}
          <div className="space-y-6">
            
            <div className="bg-white border rounded-xl shadow-[var(--shadow-card)] p-6 text-center">
              {/* Large Avatar */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#42A5F5] to-[#1565C0] text-white flex items-center justify-center font-bold text-[24px] mx-auto mb-4 shadow-md">
                {(cliente.nombre || 'C').slice(0, 2).toUpperCase()}
              </div>

              <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-1">
                {cliente.nombre || 'Sin Nombre'}
              </h2>

              {/* REPLACED STATE BADGE WITH ACTIVE OPPORTUNITIES COUNT */}
              <div className="mb-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold ${
                  ventasActivas.length > 0
                    ? 'bg-blue-50 text-[#1A85E5] border border-blue-200 ring-2 ring-blue-100'
                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                }`}>
                  <GitCommitHorizontal className="w-3.5 h-3.5" />
                  {ventasActivas.length > 0
                    ? `${ventasActivas.length} Oportunidad(es) Activa(s)`
                    : 'Sin Oportunidades Activas'}
                </span>
              </div>

              <div className="flex justify-center gap-2 mb-6">
                <Badge variant={getOriginVariant(cliente.origen)}>{cliente.origen || 'Manual'}</Badge>
                <Badge variant={getStatusVariant(cliente.estado)}>{cliente.estado}</Badge>
              </div>

              {/* Agent Assignment Card */}
              <div className="bg-[var(--bg-surface-secondary)] border rounded-lg p-4 text-left space-y-2 mb-6">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#1A85E5]" />
                  Agente Comercial Asignado
                </label>
                
                {isCompanyAdmin ? (
                  <>
                    <select
                      value={agenteAsignadoId}
                      onChange={(e) => handleAgentChange(e.target.value)}
                      disabled={isPending}
                      className="w-full h-9 px-3 border border-[var(--border-default)] rounded-md text-[13px] font-semibold bg-white focus:outline-none focus:border-[#1A85E5]"
                    >
                      <option value="">-- Sin Agente Asignado --</option>
                      {agentes.map(a => (
                        <option key={a.id} value={a.id}>{a.nombre} ({a.rol})</option>
                      ))}
                    </select>
                    {isPending && <span className="text-[11px] text-[#1A85E5] block">Actualizando agente...</span>}
                  </>
                ) : (
                  <div className="text-[13px] font-semibold text-[var(--text-primary)] py-1 flex items-center justify-between">
                    <span>{cliente.agente?.nombre || 'Sin agente asignado'}</span>
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded">Fijo</span>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-3 text-left border-t border-[var(--border-default)] pt-4 text-[13px]">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <Phone className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
                  <span className="font-mono font-semibold">{formatearTelefono(cliente.telefono)}</span>
                </div>
                {cliente.correo_electronico && (
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Mail className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
                    <span className="truncate">{cliente.correo_electronico}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <DollarSign className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
                  <span>
                    Presupuesto:{' '}
                    <strong className="text-[var(--text-primary)]">
                      {cliente.presupuesto_max ? `$${cliente.presupuesto_max.toLocaleString()} USD` : 'Sin definir'}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Intereses & Tags */}
              {etiquetas.length > 0 && (
                <div className="border-t border-[var(--border-default)] pt-4 mt-4 text-left">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Amenidades e Intereses
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {etiquetas.map(t => (
                      <span key={t} className="bg-blue-50 text-blue-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize border border-blue-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* RIGHT PANEL: Active Opportunities and Document History */}
          <div className="space-y-6">
            
            {/* Active Opportunities Section */}
            <div className="bg-white border rounded-xl shadow-[var(--shadow-card)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <GitCommitHorizontal className="w-5 h-5 text-[#1A85E5]" />
                  Oportunidades en Pipeline ({cliente.ventas?.length || 0})
                </h3>
                <Link
                  href="/ventas/nueva"
                  className="text-[12px] font-semibold text-[#1A85E5] hover:underline"
                >
                  + Nueva Oportunidad
                </Link>
              </div>

              {!cliente.ventas || cliente.ventas.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed text-[13px] text-gray-500">
                  Este cliente no tiene oportunidades de venta asociadas en el pipeline.
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-default)]">
                  {cliente.ventas.map((venta: any) => (
                    <div key={venta.id} className="py-3.5 flex items-center justify-between hover:bg-gray-50/50 px-2 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1A85E5] flex items-center justify-center flex-shrink-0">
                          <Building className="w-4 h-4" />
                        </div>
                        <div>
                          <Link href={`/propiedades/${venta.propiedad.id}`} className="font-bold text-[13px] text-[var(--text-primary)] hover:text-[#1A85E5]">
                            {venta.propiedad.titulo}
                          </Link>
                          <div className="text-[12px] text-[var(--text-tertiary)]">
                            Precio: ${venta.propiedad.precio.toLocaleString()} USD
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge variant="info">{venta.estado_venta}</Badge>
                        <Link
                          href={`/ventas/${venta.id}`}
                          className="text-[12px] font-semibold text-[#1A85E5] hover:underline flex items-center gap-1"
                        >
                          Ver Detalle <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Expedientes & Documentos Legales */}
            {cliente.documentos && cliente.documentos.length > 0 && (
              <div className="bg-white border rounded-xl shadow-[var(--shadow-card)] p-6">
                <h3 className="text-[16px] font-bold text-[var(--text-primary)] mb-4">
                  Documentos y Contratos Legales Vinculados ({cliente.documentos.length})
                </h3>
                <div className="divide-y divide-[var(--border-default)]">
                  {cliente.documentos.map((doc: any) => (
                    <div key={doc.id} className="py-3 flex items-center justify-between">
                      <div>
                        <Link href={`/documentos/${doc.id}`} className="font-bold text-[13px] text-[var(--text-primary)] hover:text-[#1A85E5]">
                          {doc.titulo}
                        </Link>
                        <div className="text-[11px] text-[var(--text-tertiary)]">{doc.tipo_documento}</div>
                      </div>
                      <Badge variant="neutral">{doc.estado}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </>
  )
}
