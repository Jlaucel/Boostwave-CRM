'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/PageHeader'
import { TAG_CATEGORIES } from '@/lib/constants'
import { Lock, Info, AlertTriangle, X, ExternalLink, Building2, PhoneCall } from 'lucide-react'
import { validarYCrearCliente } from '@/app/actions/cliente_validation'
import { formatearTelefono } from '@/lib/phoneUtils'

export function NuevoClienteClientForm({ 
  agentes,
  isCompanyAdmin = false
}: { 
  agentes: any[]
  isCompanyAdmin?: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  
  // State for Duplicate Client PopUp Modal
  const [duplicateModal, setDuplicateModal] = useState<{
    isOpen: boolean
    clienteExistente?: {
      id: string
      nombre: string
      telefono: string
    }
  }>({ isOpen: false })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorGeneral(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        const response = await fetch('/api/clientes/crear', {
          method: 'POST',
          body: formData
        })

        const text = await response.text()
        let res: any
        try {
          res = JSON.parse(text)
        } catch {
          throw new Error('La respuesta del servidor no es válida. Si usas localtunnel, asegúrate de haber hecho clic en el botón de bienvenida "Click to Continue" en el navegador.')
        }

        if (res.success && res.clienteId) {
          window.location.href = `/clientes/${res.clienteId}`
        } else if (res.isDuplicate && res.clienteExistente) {
          setDuplicateModal({
            isOpen: true,
            clienteExistente: res.clienteExistente
          })
        } else {
          setErrorGeneral(res.error || 'No se pudo crear el cliente.')
        }
      } catch (err: any) {
        setErrorGeneral(err?.message || 'Error de conexión al guardar el cliente. Por favor intente de nuevo.')
      }
    })
  }

  return (
    <>
      <PageHeader
        title="Registrar Cliente"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Clientes', href: '/clientes' },
          { label: 'Nuevo Cliente' }
        ]}
      />

      {/* POPUP MODAL: CLIENTE YA EXISTE */}
      {duplicateModal.isOpen && duplicateModal.clienteExistente && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-7 border border-amber-200 overflow-hidden relative animate-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button
              onClick={() => setDuplicateModal({ isOpen: false })}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Warning Header */}
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-gray-900 leading-snug">
                  Cliente Ya Registrado
                </h3>
                <span className="text-[12px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 inline-block mt-1">
                  Coincidencia Telefónica (10 Dígitos)
                </span>
              </div>
            </div>

            {/* Main Informative Message */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 mb-5 text-[13px] text-amber-900 leading-relaxed space-y-2">
              <p className="font-semibold">
                El número de teléfono introducido ya se encuentra registrado en el sistema.
              </p>
              <p>
                Por favor, <strong>comuníquese con la agencia inmobiliaria</strong> o consulte con el asesor responsable antes de duplicar la información de este cliente.
              </p>
            </div>

            {/* Registered Client Card Details */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Ficha del Cliente Existente
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="font-bold text-[14px] text-slate-800">
                  {duplicateModal.clienteExistente.nombre}
                </span>
                <span className="text-[12px] font-mono font-semibold text-slate-600">
                  {formatearTelefono(duplicateModal.clienteExistente.telefono)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDuplicateModal({ isOpen: false })}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-[13px] font-semibold text-gray-700 border border-gray-300 hover:bg-gray-100 transition-colors"
              >
                Cerrar y Corregir
              </button>

              <Link
                href={`/clientes/${duplicateModal.clienteExistente.id}`}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1A85E5] text-white px-5 py-2.5 rounded-lg text-[13px] font-bold hover:bg-blue-600 transition-colors shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Ver Ficha de Cliente Existente
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* Form Container */}
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-white p-8 rounded-xl border border-[var(--border-default)] shadow-[var(--shadow-card)]">
          
          {errorGeneral && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[13px] font-semibold">
              {errorGeneral}
            </div>
          )}

          <form method="POST" onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <h3 className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-4 border-b border-[var(--border-default)] pb-2">
                Información Personal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="nombre" className="text-[13px] font-medium text-[var(--text-secondary)]">Nombre Completo <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    id="nombre" 
                    name="nombre"
                    required 
                    className="w-full h-10 px-3 border border-[var(--border-default)] rounded-md text-[13px] focus:outline-none focus:border-[#1A85E5]"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label htmlFor="telefono" className="text-[13px] font-medium text-[var(--text-secondary)]">Teléfono <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    id="telefono" 
                    name="telefono" 
                    required
                    className="w-full h-10 px-3 border border-[var(--border-default)] rounded-md text-[13px] focus:outline-none focus:border-[#1A85E5]"
                    placeholder="Ej. 8092994983 (o 18092994983)"
                  />
                  <div className="flex items-center gap-1 text-[11px] text-[var(--text-tertiary)] pt-0.5">
                    <Info className="w-3 h-3 text-[#1A85E5]" />
                    Se validarán los últimos 10 dígitos para evitar duplicados.
                  </div>
                </div>

                {isCompanyAdmin ? (
                  <div className="space-y-1.5">
                    <label htmlFor="agente_asignado_id" className="text-[13px] font-medium text-[var(--text-secondary)]">Agente Comercial Asignado</label>
                    <select 
                      id="agente_asignado_id" 
                      name="agente_asignado_id"
                      className="w-full h-10 px-3 border border-[var(--border-default)] rounded-md text-[13px] focus:outline-none focus:border-[#1A85E5] bg-white font-semibold"
                    >
                      <option value="">-- Sin Asignar --</option>
                      {agentes.map(a => (
                        <option key={a.id} value={a.id}>{a.nombre} ({a.rol})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-[var(--text-secondary)] flex items-center justify-between">
                      <span>Agente Comercial Asignado</span>
                      <span className="text-[10px] text-gray-400 font-normal">(Asignado a ti automáticamente)</span>
                    </label>
                    <input
                      type="text"
                      value="Asignado a ti"
                      disabled
                      readOnly
                      className="w-full h-10 px-3 border border-[var(--border-default)] rounded-md text-[13px] bg-gray-100 text-gray-600 font-semibold cursor-not-allowed"
                    />
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label htmlFor="origen_display" className="text-[13px] font-medium text-[var(--text-secondary)] flex items-center gap-1">
                    Origen del Lead <Lock className="w-3 h-3 text-amber-500" />
                  </label>
                  <input
                    type="text"
                    id="origen_display"
                    value="Manual (Creación Directa)"
                    disabled
                    readOnly
                    className="w-full h-10 px-3 border border-[var(--border-default)] rounded-md text-[13px] bg-gray-100 text-gray-600 font-semibold cursor-not-allowed"
                  />
                  <input type="hidden" name="origen" value="Manual" />
                  <p className="text-[11px] text-[var(--text-tertiary)] pt-0.5">El origen al crear manualmente es siempre "Manual".</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-4 border-b border-[var(--border-default)] pb-2 mt-8">
                Preferencias y Presupuesto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className="space-y-1.5">
                  <label htmlFor="presupuesto_min" className="text-[13px] font-medium text-[var(--text-secondary)]">Presupuesto Mínimo ($ USD)</label>
                  <input 
                    type="number" 
                    id="presupuesto_min" 
                    name="presupuesto_min" 
                    className="w-full h-10 px-3 border border-[var(--border-default)] rounded-md text-[13px] focus:outline-none focus:border-[#1A85E5]"
                    placeholder="Ej. 100000"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="presupuesto_max" className="text-[13px] font-medium text-[var(--text-secondary)]">Presupuesto Máximo ($ USD)</label>
                  <input 
                    type="number" 
                    id="presupuesto_max" 
                    name="presupuesto_max" 
                    className="w-full h-10 px-3 border border-[var(--border-default)] rounded-md text-[13px] focus:outline-none focus:border-[#1A85E5]"
                    placeholder="Ej. 250000"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[13px] font-medium text-[var(--text-secondary)]">Etiquetas de Interés</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[var(--bg-hover)] p-5 rounded-md border border-[var(--border-default)]">
                  {TAG_CATEGORIES.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <h4 className="font-semibold text-[var(--text-primary)] text-[13px] border-b border-[var(--border-default)] pb-1 mb-2">{category.name}</h4>
                      <div className="flex flex-col gap-1.5">
                        {category.tags.map((tag) => (
                          <label key={tag} className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]">
                            <input 
                              type="checkbox" 
                              name="etiquetas" 
                              value={tag} 
                              className="rounded border-[var(--border-default)] text-[#1A85E5] focus:ring-[#1A85E5]" 
                            />
                            <span className="capitalize">{tag}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--border-default)] flex justify-end gap-3">
              <Link
                href="/clientes"
                className="px-4 py-2 rounded-md text-[13px] font-medium text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                Cancelar
              </Link>
              <button 
                type="submit" 
                disabled={isPending}
                className="bg-[#1A85E5] text-white px-5 py-2 rounded-md hover:bg-blue-600 focus:outline-none text-[13px] font-semibold transition-colors shadow-sm disabled:opacity-50"
              >
                {isPending ? 'Validando...' : 'Guardar Cliente'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  )
}
