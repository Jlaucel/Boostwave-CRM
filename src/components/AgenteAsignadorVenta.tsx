'use client'

import { useState } from 'react'
import { reasignarVenta } from '@/app/actions/pipeline'
import { Check, Loader2 } from 'lucide-react'

export function AgenteAsignadorVenta({ 
  ventaId, 
  agenteAsignadoId, 
  agentes 
}: { 
  ventaId: string;
  agenteAsignadoId: string | null;
  agentes: Array<{ id: string, nombre: string }> 
}) {
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState(agenteAsignadoId || '')
  const [success, setSuccess] = useState(false)

  const handleAssign = async () => {
    if (!selectedId || selectedId === agenteAsignadoId) return
    setLoading(true)
    setSuccess(false)
    
    try {
      const res = await reasignarVenta(ventaId, selectedId)
      if (res.success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        alert(res.error)
      }
    } catch (e) {
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <select 
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        disabled={loading}
        className="w-full h-10 px-3 text-[13px] border border-[var(--border-default)] rounded-md outline-none focus:border-[#42A5F5] focus:ring-1 focus:ring-[#42A5F5]/20 bg-slate-50"
      >
        <option value="" disabled>Seleccionar agente...</option>
        {agentes.map(ag => (
          <option key={ag.id} value={ag.id}>{ag.nombre}</option>
        ))}
      </select>
      
      {selectedId !== (agenteAsignadoId || '') && (
        <button
          onClick={handleAssign}
          disabled={loading}
          className="flex items-center justify-center gap-2 h-9 px-4 bg-[#1A85E5] text-white text-[13px] font-medium rounded-md hover:bg-[#156EBD] transition-colors disabled:opacity-50 w-full"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Cambio'}
        </button>
      )}

      {success && (
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-600 mt-1">
          <Check className="w-3.5 h-3.5" />
          Agente reasignado exitosamente
        </div>
      )}
    </div>
  )
}
