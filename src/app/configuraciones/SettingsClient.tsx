'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Settings, Bell, DollarSign, Sliders, Building2, Save, CheckCircle2 } from 'lucide-react'
import { updateConfiguracionSistema, ConfiguracionData } from '@/app/actions/configuracion'

export function SettingsClient({ config }: { config: ConfiguracionData }) {
  const [activeTab, setActiveTab] = useState<'alertas' | 'comisiones' | 'reglas' | 'empresa'>('alertas')
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const res = await updateConfiguracionSistema(formData)
    if (res.success) {
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    }
  }

  return (
    <>
      <PageHeader
        title="Configuración del Sistema y Parámetros Operativos"
        icon={Settings}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Configuración' }
        ]}
      />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        
        {/* Success Alert Banner */}
        {savedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-[13px] font-semibold">¡Parámetros de configuración guardados e integrados correctamente!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border rounded-xl shadow-[var(--shadow-card)] overflow-hidden">
          
          {/* Settings Tabs Bar */}
          <div className="flex border-b border-[var(--border-default)] bg-[var(--bg-surface-secondary)]">
            <button
              type="button"
              onClick={() => setActiveTab('alertas')}
              className={`flex-1 px-4 py-3.5 text-[13px] font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === 'alertas'
                  ? 'border-[#1A85E5] text-[#1A85E5] bg-white'
                  : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Bell className="w-4 h-4" />
              Alertas y SLA
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('comisiones')}
              className={`flex-1 px-4 py-3.5 text-[13px] font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === 'comisiones'
                  ? 'border-[#1A85E5] text-[#1A85E5] bg-white'
                  : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Comisiones y Metas
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reglas')}
              className={`flex-1 px-4 py-3.5 text-[13px] font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === 'reglas'
                  ? 'border-[#1A85E5] text-[#1A85E5] bg-white'
                  : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Sliders className="w-4 h-4" />
              Reglas de Negocio
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('empresa')}
              className={`flex-1 px-4 py-3.5 text-[13px] font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === 'empresa'
                  ? 'border-[#1A85E5] text-[#1A85E5] bg-white'
                  : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Empresa y Marca
            </button>
          </div>

          <div className="p-8 space-y-6">
            
            {/* TAB 1: ALERTAS Y SLA DE SEGUIMIENTO */}
            {activeTab === 'alertas' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-[15px] font-bold text-[var(--text-primary)] mb-1">
                    Umbrales de Alertas y Tiempos de Respuesta (SLA)
                  </h3>
                  <p className="text-[12px] text-[var(--text-tertiary)]">
                    Configura los límites de tiempo para detectar oportunidades estancadas y clientes desatendidos en el CRM.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5 bg-slate-50 p-4 rounded-lg border">
                    <label htmlFor="dias_estancamiento_pipeline" className="text-[13px] font-semibold text-[var(--text-primary)] block">
                      Días MÁXIMOS para Oportunidad Estancada (Pipeline)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        id="dias_estancamiento_pipeline"
                        name="dias_estancamiento_pipeline"
                        defaultValue={config.dias_estancamiento_pipeline}
                        min={1}
                        max={90}
                        required
                        className="w-32 h-10 px-3 border rounded-md text-[13px] font-bold bg-white focus:outline-none focus:border-[#1A85E5]"
                      />
                      <span className="text-[13px] text-[var(--text-secondary)]">días sin cambio de etapa</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-tertiary)] pt-1">
                      * Si una oportunidad permanece en la misma etapa más de estos días, aparecerá en el bloque "Puntos de Mejora" del módulo de Analíticas.
                    </p>
                  </div>

                  <div className="space-y-1.5 bg-slate-50 p-4 rounded-lg border">
                    <label htmlFor="dias_inactividad_cliente" className="text-[13px] font-semibold text-[var(--text-primary)] block">
                      Días MÁXIMOS de Inactividad General de Cliente
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        id="dias_inactividad_cliente"
                        name="dias_inactividad_cliente"
                        defaultValue={config.dias_inactividad_cliente}
                        min={1}
                        max={180}
                        required
                        className="w-32 h-10 px-3 border rounded-md text-[13px] font-bold bg-white focus:outline-none focus:border-[#1A85E5]"
                      />
                      <span className="text-[13px] text-[var(--text-secondary)]">días sin actividad registrada</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 bg-slate-50 p-4 rounded-lg border">
                    <label htmlFor="alerta_cliente_huerfano_horas" className="text-[13px] font-semibold text-[var(--text-primary)] block">
                      Horas Límite para Alertas de Cliente Sin Agente Asignado
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        id="alerta_cliente_huerfano_horas"
                        name="alerta_cliente_huerfano_horas"
                        defaultValue={config.alerta_cliente_huerfano_horas}
                        min={1}
                        max={168}
                        required
                        className="w-32 h-10 px-3 border rounded-md text-[13px] font-bold bg-white focus:outline-none focus:border-[#1A85E5]"
                      />
                      <span className="text-[13px] text-[var(--text-secondary)]">horas límite</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: COMISIONES Y METAS */}
            {activeTab === 'comisiones' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-[15px] font-bold text-[var(--text-primary)] mb-1">
                    Parámetros de Comisiones y Objetivos Financieros
                  </h3>
                  <p className="text-[12px] text-[var(--text-tertiary)]">
                    Establece el porcentaje predeterminado de comisión y la meta estándar asignada a los asesores comerciales.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div className="space-y-1.5 bg-slate-50 p-4 rounded-lg border">
                    <label htmlFor="comision_porcentaje_defecto" className="text-[13px] font-semibold text-[var(--text-primary)] block">
                      Porcentaje de Comisión Estándar (%)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        id="comision_porcentaje_defecto"
                        name="comision_porcentaje_defecto"
                        defaultValue={config.comision_porcentaje_defecto}
                        required
                        className="w-32 h-10 px-3 border rounded-md text-[13px] font-bold bg-white focus:outline-none focus:border-[#1A85E5]"
                      />
                      <span className="text-[13px] font-bold text-slate-600">%</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-tertiary)] pt-1">
                      Se aplica automáticamente al calcular comisiones por cierre de ventas.
                    </p>
                  </div>

                  <div className="space-y-1.5 bg-slate-50 p-4 rounded-lg border">
                    <label htmlFor="meta_ventas_defecto" className="text-[13px] font-semibold text-[var(--text-primary)] block">
                      Meta de Ventas Inicial para Nuevos Agentes
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-slate-600">$</span>
                      <input
                        type="number"
                        id="meta_ventas_defecto"
                        name="meta_ventas_defecto"
                        defaultValue={config.meta_ventas_defecto}
                        required
                        className="w-full h-10 px-3 border rounded-md text-[13px] font-bold bg-white focus:outline-none focus:border-[#1A85E5]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 bg-slate-50 p-4 rounded-lg border md:col-span-2">
                    <label htmlFor="moneda_defecto" className="text-[13px] font-semibold text-[var(--text-primary)] block">
                      Moneda Principal del CRM
                    </label>
                    <select
                      id="moneda_defecto"
                      name="moneda_defecto"
                      defaultValue={config.moneda_defecto}
                      className="w-48 h-10 px-3 border rounded-md text-[13px] font-bold bg-white focus:outline-none focus:border-[#1A85E5]"
                    >
                      <option value="USD">USD ($ - Dólar Estadounidense)</option>
                      <option value="DOP">DOP (RD$ - Peso Dominicano)</option>
                      <option value="EUR">EUR (€ - Euro)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: REGLAS DE NEGOCIO */}
            {activeTab === 'reglas' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-[15px] font-bold text-[var(--text-primary)] mb-1">
                    Reglas de Negocio y Control del Pipeline
                  </h3>
                  <p className="text-[12px] text-[var(--text-tertiary)]">
                    Activa o desactiva comportamientos automáticos en las asignaciones y confirmaciones.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between p-4 bg-slate-50 border rounded-lg">
                    <div>
                      <div className="font-semibold text-[13px] text-[var(--text-primary)]">
                        Auto-asignación de agente al crear oportunidades
                      </div>
                      <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                        Si está activo, asigna el primer agente disponible cuando se crea una venta sin agente explícito.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      name="auto_asignar_agente"
                      defaultChecked={config.auto_asignar_agente}
                      className="w-5 h-5 accent-[#1A85E5] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 border rounded-lg">
                    <div>
                      <div className="font-semibold text-[13px] text-[var(--text-primary)]">
                        Requerir confirmación para cierres en Pipeline
                      </div>
                      <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                        Muestra un cuadro modal de advertencia antes de marcar una oportunidad como "Cerrado/Ganado" o "Perdido".
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      name="requerir_confirmacion_cierre"
                      defaultChecked={config.requerir_confirmacion_cierre}
                      className="w-5 h-5 accent-[#1A85E5] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: EMPRESA Y MARCA */}
            {activeTab === 'empresa' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-[15px] font-bold text-[var(--text-primary)] mb-1">
                    Datos Institucionales de la Empresa y Marca
                  </h3>
                  <p className="text-[12px] text-[var(--text-tertiary)]">
                    Estos datos se inyectarán automáticamente en las fichas técnicas en PDF y en los contratos legales generados.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div className="space-y-1.5 md:col-span-2">
                    <label htmlFor="nombre_empresa" className="text-[13px] font-semibold text-[var(--text-secondary)]">Nombre Comercial de la Empresa</label>
                    <input
                      type="text"
                      id="nombre_empresa"
                      name="nombre_empresa"
                      defaultValue={config.nombre_empresa}
                      required
                      className="w-full h-10 px-3 border rounded-md text-[13px] font-bold bg-white focus:outline-none focus:border-[#1A85E5]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="telefono_contacto" className="text-[13px] font-semibold text-[var(--text-secondary)]">Teléfono de Contacto Institucional</label>
                    <input
                      type="text"
                      id="telefono_contacto"
                      name="telefono_contacto"
                      defaultValue={config.telefono_contacto}
                      required
                      className="w-full h-10 px-3 border rounded-md text-[13px] bg-white focus:outline-none focus:border-[#1A85E5]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="email_contacto" className="text-[13px] font-semibold text-[var(--text-secondary)]">Correo Electrónico Institucional</label>
                    <input
                      type="email"
                      id="email_contacto"
                      name="email_contacto"
                      defaultValue={config.email_contacto}
                      required
                      className="w-full h-10 px-3 border rounded-md text-[13px] bg-white focus:outline-none focus:border-[#1A85E5]"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Submit Button Bar */}
          <div className="px-8 py-4 bg-[var(--bg-surface-secondary)] border-t border-[var(--border-default)] flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-[#1A85E5] text-white px-6 py-2.5 rounded-lg text-[13px] font-bold hover:bg-blue-600 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              Guardar Configuración
            </button>
          </div>

        </form>
      </div>
    </>
  )
}
