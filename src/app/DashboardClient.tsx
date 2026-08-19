'use client'

import Link from 'next/link'
import { Users, Building, Target, TrendingUp, LayoutDashboard, ArrowRight, Activity, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { Badge, getStatusVariant } from '@/components/Badge'

export function DashboardClient({ 
  totalClientes, 
  totalPropiedades, 
  totalVentas, 
  ventasRecientes, 
  whatsappLeads,
  pipelineCounts
}: any) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 30 } }
  }

  const conversionRate = totalClientes > 0 ? (totalVentas / totalClientes * 100).toFixed(1) : '0.0'

  const maxPipelineCount = Math.max(
    pipelineCounts.contacto,
    pipelineCounts.interesado,
    pipelineCounts.visita,
    pipelineCounts.oferta,
    pipelineCounts.ganado,
    pipelineCounts.perdido,
    1
  )

  const pipelineStages = [
    { name: 'Contacto', count: pipelineCounts.contacto, color: '#3B82F6' },
    { name: 'Interesado', count: pipelineCounts.interesado, color: '#06B6D4' },
    { name: 'Visita', count: pipelineCounts.visita, color: '#F59E0B' },
    { name: 'Oferta', count: pipelineCounts.oferta, color: '#8B5CF6' },
    { name: 'Ganado', count: pipelineCounts.ganado, color: '#16A34A' },
    { name: 'Perdido', count: pipelineCounts.perdido, color: '#EF4444' },
  ]

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      <PageHeader 
        title="Panorama General"
        icon={LayoutDashboard}
        breadcrumbs={[{ label: 'Dashboard' }]}
      />

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={item}>
          <StatCard label="Clientes Totales" value={totalClientes} icon={Users} accent="blue" />
        </motion.div>
        <motion.div variants={item}>
          <StatCard label="Propiedades Activas" value={totalPropiedades} icon={Building} accent="green" />
        </motion.div>
        <motion.div variants={item}>
          <StatCard label="Oportunidades Abiertas" value={totalVentas} icon={Target} accent="amber" />
        </motion.div>
        <motion.div variants={item}>
          <StatCard label="Tasa de Conversión" value={`${conversionRate}%`} icon={TrendingUp} accent="purple" />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 30 }}
          className="bg-white border border-[var(--border-default)] rounded-xl overflow-hidden"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="px-5 py-3.5 border-b border-[var(--border-default)] flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)' }}>
            <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">Pipeline Summary</h2>
            <Link href="/ventas" className="text-[12px] font-medium text-blue-600 hover:underline flex items-center gap-1">
              Ver todo <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {pipelineStages.map((stage) => {
              const widthPct = (stage.count / maxPipelineCount) * 100
              return (
                <div key={stage.name} className="flex items-center gap-3">
                  <div className="w-20 text-[12px] font-medium text-[var(--text-secondary)]">{stage.name}</div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                  </div>
                  <div className="w-7 text-right text-[12px] font-bold text-[var(--text-primary)]">
                    {stage.count}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 400, damping: 30 }}
          className="bg-white border border-[var(--border-default)] rounded-xl overflow-hidden"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="px-5 py-3.5 border-b border-[var(--border-default)] flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)' }}>
            <Activity className="w-4 h-4 text-[var(--text-tertiary)]" />
            <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">Actividad Reciente</h2>
          </div>
          <div className="p-0">
            {ventasRecientes.length === 0 ? (
              <div className="p-6 text-center text-[13px] text-[var(--text-tertiary)]">
                No hay actividad reciente registrada.
              </div>
            ) : (
              <ul className="relative">
                {ventasRecientes.map((venta: any) => (
                  <li key={venta.id} className="relative p-4 border-b border-[var(--border-default)] last:border-b-0 hover:bg-[var(--bg-hover)] transition-colors flex items-start gap-3 group">
                    <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0 shadow-[0_0_0_3px_var(--bg-active)]" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[13px] text-[var(--text-primary)] truncate">
                          {venta.cliente.nombre || venta.cliente.telefono}
                        </span>
                        <span className="text-[10px] text-[var(--text-tertiary)] shrink-0 font-medium">
                          {new Date(venta.fecha_interes).toISOString().split('T')[0]}
                        </span>
                      </div>
                      <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5 truncate">
                        Interesado en &quot;{venta.propiedad.titulo}&quot;
                      </p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <Badge variant={getStatusVariant ? getStatusVariant(venta.estado_venta) : 'neutral'}>
                          {venta.estado_venta}
                        </Badge>
                        <Link 
                          href={`/clientes/${venta.cliente_id}`}
                          className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 400, damping: 30 }}
        className="bg-white border border-[var(--border-default)] rounded-xl overflow-hidden"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="px-5 py-3.5 border-b border-[var(--border-default)] flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)' }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">Leads de WhatsApp</h2>
          </div>
        </div>
        
        {whatsappLeads.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-[var(--text-tertiary)]">
            No hay leads recientes desde WhatsApp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Contacto</th>
                  <th>Teléfono</th>
                  <th>Etiquetas</th>
                  <th>Fecha</th>
                  <th className="text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {whatsappLeads.map((lead: any) => {
                  let etiquetas: string[] = []
                  try {
                    etiquetas = lead.etiquetas ? JSON.parse(lead.etiquetas) : []
                  } catch(e){}

                  const initial = lead.nombre ? lead.nombre.charAt(0).toUpperCase() : '?'

                  return (
                    <tr key={lead.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-7 h-7 rounded-full text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}
                          >
                            {initial}
                          </div>
                          <span className="font-medium text-[var(--text-primary)] text-[13px]">
                            {lead.nombre || 'Lead Anónimo'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="text-[var(--text-secondary)]">{lead.telefono}</span>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {etiquetas.slice(0, 3).map((tag: string, i: number) => (
                            <Badge key={i} variant="neutral">{tag}</Badge>
                          ))}
                          {etiquetas.length > 3 && (
                            <Badge variant="neutral">+{etiquetas.length - 3}</Badge>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="text-[var(--text-secondary)]">
                          {new Date(lead.fecha_creacion).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="text-right">
                        <Link 
                          href={`/clientes/${lead.id}`} 
                          className="inline-flex items-center gap-1 text-[12px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          Gestionar
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}
