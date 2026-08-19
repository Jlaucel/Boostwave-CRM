'use client'

import { useState, useTransition, useRef } from 'react'
import Link from 'next/link'
import { cambiarEtapaPipeline } from '@/app/actions/pipeline'
import { isTransitionAllowed } from '@/config/pipeline'
import { AlertTriangle, GripVertical, X, Calendar, DollarSign, Trash2, Clock, RefreshCcw, Eye } from 'lucide-react'

const PIPELINE_STAGES = [
  'Contacto Inicial',
  'Interesado',
  'Visita Programada',
  'Oferta Realizada',
  'Negociación',
  'Cerrado/Ganado'
]

function getStageColor(stage: string) {
  switch (stage) {
    case 'Contacto Inicial': return '#1B96FF'
    case 'Interesado': return '#06A5B5'
    case 'Visita Programada': return '#DD7A01'
    case 'Oferta Realizada': return '#8B5CF6'
    case 'Negociación': return '#EAB308'
    case 'Cerrado/Ganado': return '#2E844A'
    case 'Perdido': return '#C23934'
    default: return '#94A3B8'
  }
}

type VentaWithRelations = {
  id: string
  estado_venta: string
  fecha_interes: string
  fecha_actualizacion_estado: string
  motivo_perdida?: string | null
  notas: string | null
  cliente: { id: string; nombre: string | null; telefono: string }
  propiedad: { id: string; titulo: string; precio: number } | null
  agente: { id: string; nombre: string } | null
}

export function PipelineBoard({ ventasIniciales, isAdmin = false }: { ventasIniciales: VentaWithRelations[], isAdmin?: boolean }) {
  const [ventas, setVentas] = useState(ventasIniciales)
  const [isPending, startTransition] = useTransition()
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverStage, setDragOverStage] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{ 
    ventaId: string; 
    nuevaEtapa: string; 
    ventaInfo: VentaWithRelations;
    isOverride?: boolean;
  } | null>(null)
  const [payload, setPayload] = useState<{
    motivo_perdida?: string;
    razon_otro?: string;
    fecha_visita?: string;
    monto_oferta?: number;
    razon_override?: string;
    is_override?: boolean;
  }>({})
  const [error, setError] = useState<string | null>(null)
  const [showPerdidos, setShowPerdidos] = useState(false)
  const dragCounter = useRef<Record<string, number>>({})

  const handleDragStart = (e: React.DragEvent, ventaId: string) => {
    setDraggedId(ventaId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', ventaId)
    const target = e.currentTarget as HTMLElement
    setTimeout(() => { target.style.opacity = '0.4' }, 0)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement
    target.style.opacity = '1'
    setDraggedId(null)
    setDragOverStage(null)
    dragCounter.current = {}
  }

  const handleDragEnter = (e: React.DragEvent, stage: string) => {
    e.preventDefault()
    dragCounter.current[stage] = (dragCounter.current[stage] || 0) + 1
    setDragOverStage(stage)
  }

  const handleDragLeave = (e: React.DragEvent, stage: string) => {
    dragCounter.current[stage] = (dragCounter.current[stage] || 0) - 1
    if (dragCounter.current[stage] <= 0) {
      dragCounter.current[stage] = 0
      if (dragOverStage === stage) setDragOverStage(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, nuevaEtapa: string) => {
    e.preventDefault()
    setDragOverStage(null)
    dragCounter.current = {}

    const ventaId = e.dataTransfer.getData('text/plain')
    const venta = ventas.find(v => v.id === ventaId)
    if (!venta || venta.estado_venta === nuevaEtapa) return

    setPayload({})

    const transitionAllowed = isTransitionAllowed(venta.estado_venta, nuevaEtapa)

    if (!transitionAllowed) {
      setConfirmDialog({ ventaId, nuevaEtapa, ventaInfo: venta, isOverride: true })
      return
    }

    // Requires validation/confirmation for standard flow
    if (['Cerrado/Ganado', 'Perdido', 'Visita Programada', 'Oferta Realizada'].includes(nuevaEtapa)) {
      setConfirmDialog({ ventaId, nuevaEtapa, ventaInfo: venta, isOverride: false })
      return
    }

    executeMoveStage(ventaId, nuevaEtapa)
  }

  const executeMoveStage = (ventaId: string, nuevaEtapa: string, finalPayload?: any) => {
    setError(null)
    const activePayload = finalPayload || payload

    // Optimistic update
    setVentas(prev =>
      prev.map(v =>
        v.id === ventaId ? { ...v, estado_venta: nuevaEtapa, fecha_actualizacion_estado: new Date().toISOString(), motivo_perdida: activePayload.motivo_perdida || v.motivo_perdida } : v
      )
    )
    setConfirmDialog(null)

    startTransition(async () => {
      const result = await cambiarEtapaPipeline(ventaId, nuevaEtapa, activePayload)
      if (!result.success) {
        setVentas(ventasIniciales) // Revert
        setError(result.error || 'Error al mover la oportunidad')
        setTimeout(() => setError(null), 4000)
      }
    })
  }

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirmDialog) return

    const finalPayload = { ...payload }
    if (confirmDialog.isOverride) {
      finalPayload.is_override = true
    }
    if (confirmDialog.nuevaEtapa === 'Perdido' && payload.motivo_perdida === 'Otro') {
      if (!payload.razon_otro || payload.razon_otro.trim() === '') {
        return
      }
      finalPayload.motivo_perdida = `Otro: ${payload.razon_otro.trim()}`
    }

    executeMoveStage(confirmDialog.ventaId, confirmDialog.nuevaEtapa, finalPayload)
  }

  const handleReactivate = (ventaId: string) => {
    executeMoveStage(ventaId, 'Contacto Inicial')
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-6 right-6 bg-red-600 text-white px-5 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-in slide-in-from-bottom">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-[13px] font-medium">{error}</span>
        </div>
      )}

      {/* Modals */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-[var(--border-default)]">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-[16px] font-bold text-[var(--text-primary)] flex items-center gap-2">
                {confirmDialog.isOverride && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                {confirmDialog.isOverride ? 'Transición no estándar' :
                 confirmDialog.nuevaEtapa === 'Cerrado/Ganado' ? '¿Confirmar Cierre?' :
                 confirmDialog.nuevaEtapa === 'Perdido' ? 'Marcar oportunidad como Perdida' :
                 confirmDialog.nuevaEtapa === 'Visita Programada' ? 'Agendar Visita' :
                 confirmDialog.nuevaEtapa === 'Oferta Realizada' ? 'Registrar Oferta' : ''}
              </h3>
              <button onClick={() => setConfirmDialog(null)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirm} className="space-y-4">
              <div className="bg-[var(--bg-surface-secondary)] rounded-lg p-3 border border-[var(--border-default)] text-[13px] text-[var(--text-secondary)]">
                <div><span className="font-semibold">Cliente:</span> {confirmDialog.ventaInfo.cliente.nombre}</div>
                <div><span className="font-semibold">Propiedad:</span> {confirmDialog.ventaInfo.propiedad?.titulo || 'Sin propiedad asignada'}</div>
              </div>

              {confirmDialog.isOverride && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-[13px] mb-4">
                  Este movimiento no sigue el flujo esperado (de <strong>{confirmDialog.ventaInfo.estado_venta}</strong> a <strong>{confirmDialog.nuevaEtapa}</strong>).
                </div>
              )}

              {confirmDialog.isOverride && (
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1">Razón del movimiento (Obligatorio)</label>
                  <textarea
                    required
                    minLength={10}
                    placeholder="Explica por qué estás realizando este movimiento inusual..."
                    className="w-full px-3 py-2 bg-white border border-[var(--border-default)] rounded-lg text-[13px] min-h-[80px]"
                    value={payload.razon_override || ''}
                    onChange={(e) => setPayload({ ...payload, razon_override: e.target.value })}
                  />
                </div>
              )}

              {confirmDialog.nuevaEtapa === 'Perdido' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1">Motivo Obligatorio</label>
                    <select 
                      required 
                      className="w-full px-3 py-2 bg-white border border-[var(--border-default)] rounded-lg text-[13px]"
                      value={payload.motivo_perdida || ''}
                      onChange={(e) => setPayload({ ...payload, motivo_perdida: e.target.value })}
                    >
                      <option value="">Selecciona una razón...</option>
                      <option value="Presupuesto insuficiente">Presupuesto insuficiente</option>
                      <option value="Eligió otra agencia/competencia">Eligió otra agencia/competencia</option>
                      <option value="No responde">No responde</option>
                      <option value="Financiamiento rechazado">Financiamiento rechazado</option>
                      <option value="El momento no es adecuado">El momento no es adecuado</option>
                      <option value="Propiedad vendida a otro">Propiedad ya no disponible</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  {payload.motivo_perdida === 'Otro' && (
                    <div>
                      <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1">Especificar Razón (Obligatorio)</label>
                      <textarea
                        required
                        className="w-full px-3 py-2 bg-white border border-[var(--border-default)] rounded-lg text-[13px] min-h-[60px]"
                        placeholder="Escribe la razón detallada..."
                        value={payload.razon_otro || ''}
                        onChange={(e) => setPayload({ ...payload, razon_otro: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              )}

              {confirmDialog.nuevaEtapa === 'Visita Programada' && (
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1">Fecha de la visita</label>
                  <input 
                    type="datetime-local" 
                    required 
                    className="w-full px-3 py-2 bg-white border border-[var(--border-default)] rounded-lg text-[13px]"
                    value={payload.fecha_visita || ''}
                    onChange={(e) => setPayload({ ...payload, fecha_visita: e.target.value })}
                  />
                </div>
              )}

              {confirmDialog.nuevaEtapa === 'Oferta Realizada' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1">Monto Ofrecido (USD)</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      className="w-full px-3 py-2 bg-white border border-[var(--border-default)] rounded-lg text-[13px]"
                      value={payload.monto_oferta || ''}
                      onChange={(e) => setPayload({ ...payload, monto_oferta: parseFloat(e.target.value) })}
                      placeholder="Ej. 150000"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1">Documento de Oferta (Obligatorio)</label>
                    <input 
                      type="file" 
                      required
                      accept=".pdf,.doc,.docx,.jpg,.png"
                      className="w-full px-3 py-2 bg-white border border-[var(--border-default)] rounded-lg text-[13px] text-[var(--text-secondary)] file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[12px] file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                    />
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-1">Sube el documento firmado o la propuesta formal.</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(null)}
                  className="px-4 py-2 rounded-md text-[13px] font-medium text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md text-[13px] font-semibold text-white transition-colors shadow-sm bg-[#1A85E5] hover:bg-[#156bb8]"
                  style={confirmDialog.nuevaEtapa === 'Perdido' ? { backgroundColor: '#DC2626' } : {}}
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Pipeline */}
      <div className="flex gap-4 overflow-x-auto p-6 flex-1 items-start">
        {PIPELINE_STAGES.map((stage) => {
          const stageVentas = ventas.filter((v) => v.estado_venta === stage)
          const totalValue = stageVentas.reduce((acc, v) => acc + (v.propiedad?.precio || 0), 0)
          const stageColor = getStageColor(stage)
          const isOver = dragOverStage === stage

          return (
            <div
              key={stage}
              className={`kanban-column border rounded-lg w-80 flex-shrink-0 flex flex-col shadow-sm transition-all duration-200 h-full max-h-full ${
                isOver ? 'bg-blue-50/50 border-blue-300 ring-2 ring-blue-200/50' : 'bg-[var(--bg-hover)] border-[var(--border-default)]'
              }`}
              style={{ borderTopWidth: '3px', borderTopColor: stageColor }}
              onDragEnter={(e) => handleDragEnter(e, stage)}
              onDragLeave={(e) => handleDragLeave(e, stage)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className="p-3 border-b border-[var(--border-default)] flex justify-between items-center bg-[var(--bg-hover)] rounded-t-lg">
                <h3 className="font-semibold text-[13px] text-[var(--text-primary)]">{stage}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                    ${totalValue >= 1000000 ? (totalValue / 1000000).toFixed(1) + 'M' : totalValue.toLocaleString()}
                  </span>
                  <span className="bg-white text-[var(--text-secondary)] text-[11px] font-medium px-2 py-0.5 rounded-full border border-[var(--border-default)]">
                    {stageVentas.length}
                  </span>
                </div>
              </div>

              <div className="p-3 flex-1 overflow-y-auto space-y-3 min-h-[100px]">
                {stageVentas.map((venta) => {
                  const diasInactivo = Math.floor((Date.now() - new Date(venta.fecha_actualizacion_estado).getTime()) / (1000 * 60 * 60 * 24))
                  const isInactivo = diasInactivo > 14 // Alerta si es > 14 días

                  return (
                    <div
                      key={venta.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, venta.id)}
                      onDragEnd={handleDragEnd}
                      className={`kanban-card bg-white p-3 rounded-md shadow-[var(--shadow-sm)] border hover:border-blue-300 transition-all cursor-grab active:cursor-grabbing group relative overflow-hidden ${
                        draggedId === venta.id ? 'opacity-40 scale-95' : ''
                      } ${isInactivo ? 'border-amber-400' : 'border-[var(--border-default)]'}`}
                    >
                      {isInactivo && (
                        <div className="absolute top-0 right-0 bg-amber-100 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded-bl-md flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {diasInactivo}d
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start mb-1.5 mt-1">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <GripVertical className="w-3.5 h-3.5 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          <Link
                            href={`/clientes/${venta.cliente.id}`}
                            className="font-bold text-[13px] text-[var(--text-primary)] group-hover:text-[#1A85E5] truncate"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {venta.cliente.nombre || venta.cliente.telefono}
                          </Link>
                        </div>
                      </div>

                      <Link 
                        href={`/ventas/${venta.id}`}
                        className="block text-[12px] font-medium text-[#1A85E5] hover:underline mb-3 truncate pl-5"
                        onClick={(e) => e.stopPropagation()}
                        title="Ver detalle de oportunidad"
                      >
                        {venta.propiedad?.titulo || 'Sin propiedad asignada'}
                      </Link>

                      <div className="flex justify-between items-center pt-2.5 border-t border-[var(--border-default)]">
                        <div className="font-semibold text-[var(--text-secondary)] text-[13px]">
                          ${venta.propiedad?.precio ? venta.propiedad.precio.toLocaleString() : '0'}
                        </div>
                        <div className="flex items-center gap-1.5" title={venta.agente?.nombre || 'Sin agente'}>
                          <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold">
                            {venta.agente?.nombre.charAt(0) || 'S'}
                          </div>
                          <span className="text-[11px] text-[var(--text-tertiary)] font-medium max-w-[80px] truncate">
                            {venta.agente?.nombre || 'Sin asig.'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Botón rápido de pérdida */}
                      <button 
                        onClick={() => setConfirmDialog({ ventaId: venta.id, nuevaEtapa: 'Perdido', ventaInfo: venta })}
                        className="absolute bottom-2.5 right-20 opacity-0 group-hover:opacity-100 p-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-all"
                        title="Marcar como Perdido"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })}

                {stageVentas.length === 0 && (
                  <div className={`h-20 border-2 border-dashed rounded-md flex items-center justify-center text-[12px] text-[var(--text-tertiary)] transition-colors ${
                    isOver ? 'border-blue-300 bg-blue-50/50 text-blue-500' : 'border-[var(--border-default)]'
                  }`}>
                    {isOver ? 'Soltar aquí' : 'Arrastra oportunidades aquí'}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Global Dropzone for Perdidos / Show Perdidos Toggle */}
      <div 
        className={`mt-auto border-t border-[var(--border-default)] p-4 transition-colors ${dragOverStage === 'Perdido' ? 'bg-red-50 border-red-200' : 'bg-white'}`}
        onDragEnter={(e) => handleDragEnter(e, 'Perdido')}
        onDragLeave={(e) => handleDragLeave(e, 'Perdido')}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'Perdido')}
      >
        <div className="flex justify-between items-center max-w-[1200px] mx-auto px-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${dragOverStage === 'Perdido' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-[14px] text-[var(--text-primary)]">Oportunidades Perdidas</h4>
              <p className="text-[12px] text-[var(--text-tertiary)]">Arrastra tarjetas aquí para marcarlas como perdidas o descártalas</p>
            </div>
          </div>
          <button 
            onClick={() => setShowPerdidos(!showPerdidos)}
            className="text-[13px] font-semibold text-[#1A85E5] hover:underline"
          >
            {showPerdidos ? 'Ocultar historial' : 'Ver perdidos'} ({ventas.filter(v => v.estado_venta === 'Perdido').length})
          </button>
        </div>

        {showPerdidos && (
          <div className="max-w-[1200px] mx-auto px-6 mt-4 flex gap-4 overflow-x-auto pb-4">
            {ventas.filter(v => v.estado_venta === 'Perdido').map(venta => (
              <div key={venta.id} className="kanban-card w-72 flex-shrink-0 bg-red-50/50 p-3 rounded-md shadow-sm border border-red-100 relative">
                <div className="flex justify-between items-start mb-1">
                  <Link href={`/clientes/${venta.cliente.id}`} className="font-bold text-[13px] text-red-900 truncate">
                    {venta.cliente.nombre}
                  </Link>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/ventas/${venta.id}`}
                      className="p-1 text-red-400 hover:text-[#1A85E5] hover:bg-blue-50 rounded transition-colors"
                      title="Ver detalle de oportunidad"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                    {isAdmin && (
                      <button 
                        onClick={() => handleReactivate(venta.id)}
                        className="p-1 text-red-400 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                        title="Reactivar oportunidad"
                      >
                        <RefreshCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <Link 
                  href={`/ventas/${venta.id}`}
                  className="block text-[11px] text-[#1A85E5] hover:underline truncate mb-2"
                  title="Ver detalle de oportunidad"
                >
                  {venta.propiedad?.titulo || 'Sin propiedad asignada'}
                </Link>
                <div className="bg-white p-2 rounded text-[11px] text-slate-600 border border-red-50">
                  <span className="font-semibold block mb-0.5">Motivo:</span>
                  {venta.motivo_perdida || 'Sin motivo especificado'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isPending && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1A85E5] text-white px-5 py-2.5 rounded-full shadow-lg z-50 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span className="text-[13px] font-medium">Procesando...</span>
        </div>
      )}
    </div>
  )
}
