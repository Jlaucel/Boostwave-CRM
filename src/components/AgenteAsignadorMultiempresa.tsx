'use client'

import { useState } from 'react'
import { UserPlus, Check } from 'lucide-react'
import { asignarAgenteMultiempresaAction } from '@/app/actions/multiempresa'

interface Props {
  propiedadId: string
  agentesEmpresa: Array<{ id: string; nombre: string; rol: string }>
  agenteAsignadoActualId?: string | null
  agenteAsignadoActualNombre?: string | null
  nombreEmpresaActual: string
  esPropietaria: boolean
  puedeEditar: boolean
}

export function AgenteAsignadorMultiempresa({
  propiedadId,
  agentesEmpresa,
  agenteAsignadoActualId,
  agenteAsignadoActualNombre,
  nombreEmpresaActual,
  esPropietaria,
  puedeEditar
}: Props) {
  const [selectedAgenteId, setSelectedAgenteId] = useState<string>(agenteAsignadoActualId || '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSaved(false)
    try {
      const res = await asignarAgenteMultiempresaAction(propiedadId, selectedAgenteId || null)
      if (res.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        alert(res.error || 'Error al asignar agente')
      }
    } catch (err: any) {
      alert(err.message || 'Error al asignar agente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-[var(--border-default)] rounded-xl shadow-[var(--shadow-card)] p-6 no-print">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          {esPropietaria ? 'Agente Comercial Asignado' : `Agente Asignado en ${nombreEmpresaActual}`}
        </h3>
        {!esPropietaria && (
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
            Colaboración Red
          </span>
        )}
      </div>

      {puedeEditar ? (
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <select
              value={selectedAgenteId}
              onChange={(e) => setSelectedAgenteId(e.target.value)}
              className="w-full h-10 px-3 text-[13px] border border-[var(--border-default)] rounded-lg outline-none focus:border-[#1A85E5] bg-white font-medium text-[var(--text-primary)]"
            >
              <option value="">-- Sin Agente Asignado en {nombreEmpresaActual} --</option>
              {agentesEmpresa.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.nombre} ({ag.rol})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="submit"
              disabled={loading || selectedAgenteId === (agenteAsignadoActualId || '')}
              className="w-full px-4 py-2.5 bg-[#1A85E5] text-white text-[12px] font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              {loading ? (
                <span>Guardando...</span>
              ) : saved ? (
                <>
                  <Check className="w-4 h-4" /> Asignación Guardada
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Guardar Asignación en {nombreEmpresaActual}
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1A85E5] text-white flex items-center justify-center font-bold text-[14px]">
            {agenteAsignadoActualNombre ? agenteAsignadoActualNombre.substring(0, 2).toUpperCase() : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-[14px] text-[var(--text-primary)] truncate">
              {agenteAsignadoActualNombre || 'Sin agente asignado'}
            </h4>
            <p className="text-[12px] text-[var(--text-tertiary)]">
              {agenteAsignadoActualNombre ? 'Asesor Responsable' : `Sin agente en ${nombreEmpresaActual}`}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
