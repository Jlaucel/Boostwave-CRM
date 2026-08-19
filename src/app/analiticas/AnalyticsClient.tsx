'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { Badge } from '@/components/Badge'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Download, 
  UserX, 
  FileSpreadsheet, 
  ArrowRight,
  ShieldAlert,
  Target,
  UserCheck
} from 'lucide-react'
import { assignAgentToClient } from '@/app/actions/agentes'

export function AnalyticsClient({ data, agentesList }: { data: any; agentesList: any[] }) {
  const [activeTab, setActiveTab] = useState<'mejora' | 'funnel' | 'agentes'>('mejora')
  const [selectedAgentForAssign, setSelectedAgentForAssign] = useState<Record<string, string>>({})
  const [assigningId, setAssigningId] = useState<string | null>(null)

  const handleAssignAgent = async (clienteId: string) => {
    const agenteId = selectedAgentForAssign[clienteId]
    if (!agenteId) return
    setAssigningId(clienteId)
    await assignAgentToClient(clienteId, agenteId)
    setAssigningId(null)
  }

  const exportCSV = () => {
    const headers = ['Agente', 'Rol', 'Clientes Asignados', 'Cierres', 'Monto Ganado ($)', 'Comisiones ($)', 'Tasa Conversión (%)', 'Estancadas']
    const rows = data.agentesMetrics.map((a: any) => [
      `"${a.nombre}"`,
      `"${a.rol}"`,
      a.clientesAsignados,
      a.cierresLogrados,
      a.montoGanado,
      a.comisionesAgente,
      `${a.tasaConversion}%`,
      a.estancadasAgente
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `reporte_desempeno_agentes_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <PageHeader
        title="Analíticas y Seguimiento de Agentes"
        icon={BarChart3}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Analíticas' }
        ]}
        actions={
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 bg-white border border-[var(--border-default)] text-[var(--text-secondary)] px-4 py-2 rounded-md hover:bg-[var(--bg-hover)] text-[13px] font-semibold transition-colors shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Exportar CSV / Excel
            </button>
          </div>
        }
      />

      <div className="p-6 space-y-6 max-w-[1300px] mx-auto">
        
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Volumen Ventas Ganadas"
            value={`$${(data.kpis.volumenVentasGanadas / 1000000).toFixed(1)}M`}
            subtitle={`$${data.kpis.volumenVentasGanadas.toLocaleString()} USD`}
            icon={DollarSign}
            accent="green"
          />
          <StatCard
            label="Tiempo Prom. Cierre"
            value={`${data.kpis.tiempoPromedioCierreDias} días`}
            subtitle="Desde contacto inicial"
            icon={Clock}
            accent="blue"
          />
          <StatCard
            label="Conversión Global"
            value={`${data.kpis.tasaConversionGlobal}%`}
            subtitle="Oportunidades cerradas"
            icon={TrendingUp}
            accent="purple"
          />
          <StatCard
            label="Clientes Estancados"
            value={data.kpis.ventasEstancadasCount}
            subtitle=">14 días sin movimiento"
            icon={AlertTriangle}
            accent="amber"
          />
          <StatCard
            label="Clientes Sin Agente"
            value={data.kpis.clientesHuérfanosCount}
            subtitle="Requieren asignación"
            icon={UserX}
            accent="red"
          />
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[var(--border-default)]">
          <button
            onClick={() => setActiveTab('mejora')}
            className={`px-5 py-3 text-[13px] font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'mejora'
                ? 'border-[#1A85E5] text-[#1A85E5]'
                : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Puntos de Mejora & Alertas
            {data.kpis.ventasEstancadasCount + data.kpis.clientesHuérfanosCount > 0 && (
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[11px] font-bold">
                {data.kpis.ventasEstancadasCount + data.kpis.clientesHuérfanosCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('agentes')}
            className={`px-5 py-3 text-[13px] font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'agentes'
                ? 'border-[#1A85E5] text-[#1A85E5]'
                : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Users className="w-4 h-4" />
            Rendimiento por Agente
          </button>

          <button
            onClick={() => setActiveTab('funnel')}
            className={`px-5 py-3 text-[13px] font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'funnel'
                ? 'border-[#1A85E5] text-[#1A85E5]'
                : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Target className="w-4 h-4" />
            Funnel & Canales de Marketing
          </button>
        </div>

        {/* TAB 1: Puntos de Mejora & Alertas */}
        {activeTab === 'mejora' && (
          <div className="space-y-6">
            
            {/* Clientes Estancados Card */}
            <div className="bg-white border rounded-xl shadow-[var(--shadow-card)] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[16px] font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Clientes y Oportunidades Estancadas ({data.ventasEstancadas.length})
                  </h3>
                  <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
                    Prospectos en el pipeline sin cambio de etapa durante más de 14 días. Requieren atención inmediata del agente.
                  </p>
                </div>
              </div>

              {data.ventasEstancadas.length === 0 ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center text-emerald-800">
                  <UserCheck className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                  <div className="font-bold text-[14px]">¡Excelente trabajo de tu equipo!</div>
                  <div className="text-[12px] mt-0.5">No hay oportunidades estancadas en el pipeline actualmente.</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table w-full">
                    <thead>
                      <tr>
                        <th>Cliente</th>
                        <th>Propiedad</th>
                        <th>Etapa Actual</th>
                        <th>Días Estancado</th>
                        <th>Agente Responsable</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.ventasEstancadas.map((v: any) => (
                        <tr key={v.id}>
                          <td className="font-semibold text-[13px]">
                            <Link href={`/clientes/${v.clienteId}`} className="hover:text-[#1A85E5]">
                              {v.clienteNombre}
                            </Link>
                          </td>
                          <td className="text-[13px]">
                            <Link href={`/propiedades/${v.propiedadId}`} className="hover:text-[#1A85E5]">
                              {v.propiedadTitulo} (${v.propiedadPrecio.toLocaleString()})
                            </Link>
                          </td>
                          <td>
                            <Badge variant="warning">{v.estadoVenta}</Badge>
                          </td>
                          <td>
                            <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full text-[12px]">
                              <Clock className="w-3.5 h-3.5" />
                              {v.diasTranscurridos} días
                            </span>
                          </td>
                          <td className="text-[13px] font-medium text-[var(--text-secondary)]">
                            {v.agenteNombre}
                          </td>
                          <td>
                            <Link
                              href="/ventas"
                              className="text-[12px] text-[#1A85E5] font-semibold hover:underline flex items-center gap-1"
                            >
                              Ir a Pipeline <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Clientes Huérfanos (Sin Agente Asignado) */}
            <div className="bg-white border rounded-xl shadow-[var(--shadow-card)] p-6 border-t-4 border-t-rose-500">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[16px] font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <UserX className="w-5 h-5 text-rose-500" />
                    Clientes Sin Agente Asignado ({data.clientesSinAgente.length})
                  </h3>
                  <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
                    Prospectos ingresados al sistema que no tienen un responsable de ventas. Asigna un agente para darles seguimiento.
                  </p>
                </div>
              </div>

              {data.clientesSinAgente.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-600">
                  <div className="font-semibold text-[13px]">Todos los clientes tienen un agente asignado.</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table w-full">
                    <thead>
                      <tr>
                        <th>Cliente</th>
                        <th>Teléfono</th>
                        <th>Origen</th>
                        <th>Fecha Registro</th>
                        <th>Asignar Agente Comercial</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.clientesSinAgente.map((c: any) => (
                        <tr key={c.id}>
                          <td className="font-semibold text-[13px]">
                            <Link href={`/clientes/${c.id}`} className="hover:text-[#1A85E5]">
                              {c.nombre}
                            </Link>
                          </td>
                          <td className="text-[13px] text-[var(--text-secondary)]">{c.telefono}</td>
                          <td>
                            <Badge variant="neutral">{c.origen || 'Directo'}</Badge>
                          </td>
                          <td className="text-[12px] text-[var(--text-tertiary)]">
                            {new Date(c.fechaCreacion).toLocaleDateString()}
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <select
                                className="h-8 px-2 border rounded text-[12px] bg-white focus:outline-none focus:border-[#1A85E5]"
                                value={selectedAgentForAssign[c.id] || ''}
                                onChange={(e) => setSelectedAgentForAssign({ ...selectedAgentForAssign, [c.id]: e.target.value })}
                              >
                                <option value="">-- Seleccionar Agente --</option>
                                {agentesList.map(a => (
                                  <option key={a.id} value={a.id}>{a.nombre}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleAssignAgent(c.id)}
                                disabled={!selectedAgentForAssign[c.id] || assigningId === c.id}
                                className="bg-[#1A85E5] text-white px-3 py-1 rounded text-[12px] font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors"
                              >
                                {assigningId === c.id ? 'Asignando...' : 'Asignar'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: Rendimiento por Agente */}
        {activeTab === 'agentes' && (
          <div className="bg-white border rounded-xl shadow-[var(--shadow-card)] p-6 space-y-6">
            <h3 className="text-[16px] font-bold text-[var(--text-primary)]">
              Desempeño Individual del Equipo Comercial
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.agentesMetrics.map((a: any) => (
                <div key={a.id} className="border border-[var(--border-default)] rounded-xl p-5 bg-white space-y-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link href={`/agentes/${a.id}`} className="font-bold text-[15px] text-[var(--text-primary)] hover:text-[#1A85E5]">
                        {a.nombre}
                      </Link>
                      <div className="text-[12px] text-[var(--text-tertiary)]">{a.rol}</div>
                    </div>
                    <Badge variant={a.estado === 'Activo' ? 'success' : 'neutral'}>{a.estado}</Badge>
                  </div>

                  {/* Progress to sales goal */}
                  <div>
                    <div className="flex justify-between text-[12px] mb-1">
                      <span className="text-[var(--text-secondary)] font-medium">Meta de Ventas</span>
                      <span className="font-bold text-[#1A85E5]">{a.porcentajeMeta}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1A85E5] rounded-full transition-all"
                        style={{ width: `${a.porcentajeMeta}%` }}
                      ></div>
                    </div>
                    <div className="text-[11px] text-[var(--text-tertiary)] mt-1 text-right">
                      ${a.montoGanado.toLocaleString()} / ${a.meta.toLocaleString()} USD
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--border-default)] text-[12px]">
                    <div>
                      <span className="text-[var(--text-tertiary)] block">Cierres Logrados</span>
                      <span className="font-bold text-[14px] text-[var(--text-primary)]">{a.cierresLogrados}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-tertiary)] block">Conversión</span>
                      <span className="font-bold text-[14px] text-emerald-600">{a.tasaConversion}%</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-tertiary)] block">Comisiones</span>
                      <span className="font-semibold text-[var(--text-primary)]">${a.comisionesAgente.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-tertiary)] block">Estancados</span>
                      <span className={`font-semibold ${a.estancadasAgente > 0 ? 'text-amber-600 font-bold' : 'text-gray-500'}`}>
                        {a.estancadasAgente} prospectos
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/agentes/${a.id}`}
                      className="w-full flex items-center justify-center gap-1 bg-[var(--bg-surface-secondary)] border border-[var(--border-default)] text-[var(--text-secondary)] py-1.5 rounded-lg text-[12px] font-semibold hover:bg-[var(--bg-hover)] transition-colors"
                    >
                      Ver Perfil y Cartera <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Funnel & Canales de Marketing */}
        {activeTab === 'funnel' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Funnel Pipeline */}
            <div className="bg-white border rounded-xl shadow-[var(--shadow-card)] p-6">
              <h3 className="text-[16px] font-bold text-[var(--text-primary)] mb-4">
                Embudo de Conversión (Funnel por Etapas)
              </h3>
              <div className="space-y-4">
                {data.funnel.map((item: any) => {
                  const maxCount = Math.max(...data.funnel.map((f: any) => f.count), 1)
                  const percentage = Math.round((item.count / maxCount) * 100)
                  return (
                    <div key={item.stage} className="space-y-1">
                      <div className="flex justify-between text-[13px]">
                        <span className="font-semibold text-[var(--text-primary)]">{item.stage}</span>
                        <span className="font-bold text-[#1A85E5]">{item.count} oport. (${item.valor.toLocaleString()})</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: 
                              item.stage === 'Cerrado/Ganado' ? '#2E844A' :
                              item.stage === 'Perdido' ? '#C23934' : '#1A85E5'
                          }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Canales de Marketing */}
            <div className="bg-white border rounded-xl shadow-[var(--shadow-card)] p-6">
              <h3 className="text-[16px] font-bold text-[var(--text-primary)] mb-4">
                Efectividad por Canal de Marketing / Origen
              </h3>
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th>Canal / Origen</th>
                    <th>Leads Registrados</th>
                    <th>Ventas Cerradas</th>
                    <th>Tasa Conversión</th>
                  </tr>
                </thead>
                <tbody>
                  {data.canalesData.map((c: any) => (
                    <tr key={c.canal}>
                      <td className="font-semibold text-[13px]">{c.canal}</td>
                      <td className="text-[13px]">{c.totalClientes}</td>
                      <td className="text-[13px] font-bold text-emerald-600">{c.cierres}</td>
                      <td>
                        <span className="font-bold text-[13px] text-[#1A85E5]">{c.tasaConversion}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>
    </>
  )
}
