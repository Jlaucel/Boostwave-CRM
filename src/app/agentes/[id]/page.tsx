import { requireAuth } from '@/lib/auth'
import { getTenantId } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { PageHeader } from '@/components/PageHeader'
import { Badge, getStatusVariant } from '@/components/Badge'
import { UserCircle, Mail, Phone, Target, TrendingUp, DollarSign, Award, Clock, FileText, CheckCircle2, Building, GitCommitHorizontal } from 'lucide-react'

export const dynamic = 'force-dynamic'

function timeSince(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + " años"
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + " meses"
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + " días"
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + " horas"
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + " min"
  return Math.floor(seconds) + " seg"
}

export default async function AgenteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireAuth()
  const empresaId = await getTenantId()
  const { id } = await params

  const isCompanyAdmin = session.isGlobalAdmin || session.rol === 'Agente Owner' || session.rol === 'Agente Admin'
  if (!isCompanyAdmin && session.agenteId && session.agenteId !== id) {
    redirect(`/agentes/${session.agenteId}`)
  }
  
  const agente = await prisma.agente.findFirst({
    where: { id, empresa_id: empresaId },
    include: {
      clientes: {
        orderBy: { fecha_actualizacion: 'desc' }
      },
      propiedades: {
        orderBy: { fecha_creacion: 'desc' }
      },
      ventas: {
        include: {
          propiedad: true,
          cliente: true
        },
        orderBy: { fecha_interes: 'desc' }
      },
      actividades: {
        orderBy: { fecha: 'desc' },
        take: 15
      }
    },
  })

  if (!agente) {
    notFound()
  }

  // --- CALCULATE METRICS ---
  const totalVentas = agente.ventas.length
  const cierres = agente.ventas.filter(v => v.estado_venta === 'Cerrado/Ganado')
  const cierresCount = cierres.length
  
  const oportunidadesEnProceso = agente.ventas.filter(
    v => v.estado_venta !== 'Cerrado/Ganado' && v.estado_venta !== 'Perdido'
  )
  
  const tasaConversion = totalVentas > 0 ? ((cierresCount / totalVentas) * 100).toFixed(1) : 0
  
  let volumenVentasCerradas = 0
  cierres.forEach(cierre => {
    if (cierre.propiedad && cierre.propiedad.precio) {
      volumenVentasCerradas += cierre.propiedad.precio
    }
  })

  const porcentajeComision = agente.comision_porcentaje || 3.0
  const comisionesGeneradas = volumenVentasCerradas * (porcentajeComision / 100)
  
  const metaVentas = agente.meta_ventas || 1000000
  const progresoMeta = metaVentas > 0 ? Math.min((volumenVentasCerradas / metaVentas) * 100, 100) : 0

  return (
    <>
      <PageHeader
        title="Perfil del Agente"
        icon={UserCircle}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Equipo', href: '/agentes' },
          { label: agente.nombre }
        ]}
      />

      <div className="p-6 max-w-[1400px] mx-auto space-y-6">
        
        {/* Cabecera del Perfil */}
        <div className="bg-white shadow-[var(--shadow-card)] rounded-xl border border-[var(--border-default)] p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-[#1A85E5] to-[#0D47A1]"></div>
          
          <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 mt-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-white p-1 shadow-md">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1A85E5] to-[#0D47A1] text-white flex items-center justify-center text-4xl font-bold">
                  {agente.nombre.substring(0, 2).toUpperCase()}
                </div>
              </div>
              <div className="absolute bottom-1 right-1">
                <Badge variant={agente.estado === 'Activo' ? 'success' : 'neutral'} className="text-[10px] px-2 py-0.5 border-2 border-white shadow-sm">
                  {agente.estado}
                </Badge>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-[28px] font-bold text-[var(--text-primary)] leading-tight">{agente.nombre}</h1>
              <div className="text-[15px] font-medium text-[#1A85E5] mb-3">{agente.rol}</div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[13px] text-[var(--text-secondary)]">
                <div className="flex items-center gap-1.5 bg-[var(--bg-surface-secondary)] px-3 py-1.5 rounded-full border border-[var(--border-default)]">
                  <Mail className="w-4 h-4 text-[var(--text-tertiary)]" /> {agente.email}
                </div>
                {agente.telefono && (
                  <div className="flex items-center gap-1.5 bg-[var(--bg-surface-secondary)] px-3 py-1.5 rounded-full border border-[var(--border-default)]">
                    <Phone className="w-4 h-4 text-[var(--text-tertiary)]" /> {agente.telefono}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* KPIs Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Tarjeta Meta */}
          <div className="bg-white border border-[var(--border-default)] rounded-xl shadow-[var(--shadow-card)] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Ventas vs Meta</div>
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <Target className="w-4 h-4 text-[#1A85E5]" />
              </div>
            </div>
            <div className="text-[24px] font-bold text-[var(--text-primary)] mb-1">
              ${volumenVentasCerradas.toLocaleString()}
            </div>
            <div className="text-[12px] text-[var(--text-secondary)] mb-3">
              de ${metaVentas.toLocaleString()}
            </div>
            <div className="w-full bg-[var(--bg-surface-secondary)] rounded-full h-2 overflow-hidden border border-[var(--border-default)]">
              <div 
                className="bg-[#1A85E5] h-2 rounded-full transition-all" 
                style={{ width: `${progresoMeta}%` }}
              ></div>
            </div>
            <div className="text-[11px] font-medium text-[#1A85E5] mt-1.5 text-right">{progresoMeta.toFixed(1)}%</div>
          </div>

          {/* Tarjeta Comisiones */}
          <div className="bg-white border border-[var(--border-default)] rounded-xl shadow-[var(--shadow-card)] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Comisiones Gen.</div>
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-[24px] font-bold text-[var(--text-primary)] mb-1">
              ${comisionesGeneradas.toLocaleString()}
            </div>
            <div className="text-[12px] text-[var(--text-secondary)]">
              (Basado en {porcentajeComision}% estándar)
            </div>
          </div>

          {/* Tarjeta Cierres */}
          <div className="bg-white border border-[var(--border-default)] rounded-xl shadow-[var(--shadow-card)] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Cierres Logrados</div>
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                <Award className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div className="text-[24px] font-bold text-[var(--text-primary)] mb-1">
              {cierresCount} <span className="text-[14px] text-[var(--text-tertiary)] font-normal">cierres</span>
            </div>
            <div className="text-[12px] text-[var(--text-secondary)]">
              De {totalVentas} oportunidades totales
            </div>
          </div>

          {/* Tarjeta Conversión */}
          <div className="bg-white border border-[var(--border-default)] rounded-xl shadow-[var(--shadow-card)] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Conversión</div>
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div className="text-[24px] font-bold text-[var(--text-primary)] mb-1">
              {tasaConversion}%
            </div>
            <div className="text-[12px] text-[var(--text-secondary)]">
              Win rate del período actual
            </div>
          </div>

        </div>

        {/* Columnas Inferiores */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna Principal Izquierda */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Oportunidades en Proceso (Pipeline Activo) */}
            <div className="bg-white shadow-[var(--shadow-card)] rounded-xl border border-[var(--border-default)] overflow-hidden">
              <div className="px-6 py-5 border-b border-[var(--border-default)] flex items-center justify-between">
                <h2 className="text-[16px] font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <GitCommitHorizontal className="w-4 h-4 text-[#1A85E5]" />
                  Oportunidades en Proceso ({oportunidadesEnProceso.length})
                </h2>
                <Link href="/ventas" className="text-[12px] font-semibold text-[#1A85E5] hover:underline">
                  Ver Pipeline ➔
                </Link>
              </div>
              <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
                <table className="data-table w-full text-left">
                  <thead className="sticky top-0 bg-[var(--bg-surface-secondary)] z-10 shadow-sm">
                    <tr>
                      <th className="py-3 px-6 text-[11px]">Cliente / Contacto</th>
                      <th className="py-3 px-6 text-[11px]">Propiedad de Interés</th>
                      <th className="py-3 px-6 text-[11px]">Estado Actual</th>
                      <th className="py-3 px-6 text-[11px]">Última Actualización</th>
                      <th className="py-3 px-6 text-[11px] text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {oportunidadesEnProceso.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-[var(--text-tertiary)] text-[13px]">
                          No tiene oportunidades activas en proceso actualmente.
                        </td>
                      </tr>
                    ) : (
                      oportunidadesEnProceso.map((venta) => (
                        <tr key={venta.id} className="hover:bg-[var(--bg-hover)]">
                          <td className="py-3 px-6">
                            <div className="font-semibold text-[13px] text-[var(--text-primary)]">
                              {venta.cliente?.nombre || 'Cliente sin nombre'}
                            </div>
                            <div className="text-[11px] text-[var(--text-tertiary)] font-mono">
                              {venta.cliente?.telefono}
                            </div>
                          </td>
                          <td className="py-3 px-6">
                            <div className="font-medium text-[13px] text-[var(--text-primary)]">
                              {venta.propiedad?.titulo || 'Propiedad'}
                            </div>
                            <div className="text-[11px] text-[var(--text-tertiary)]">
                              ${venta.propiedad?.precio?.toLocaleString()} USD
                            </div>
                          </td>
                          <td className="py-3 px-6">
                            <Badge variant="info" className="text-[11px] px-2.5 py-0.5 font-semibold">
                              {venta.estado_venta}
                            </Badge>
                          </td>
                          <td className="py-3 px-6 text-[12px] text-[var(--text-secondary)]">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{timeSince(new Date(venta.fecha_interes))}</span>
                            </div>
                            <div className="text-[10px] text-[var(--text-tertiary)]">
                              {new Date(venta.fecha_interes).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </td>
                          <td className="py-3 px-6 text-right">
                            <Link href={`/clientes/${venta.cliente_id}`} className="text-[#1A85E5] hover:underline text-[12px] font-semibold">
                              Ver Ficha
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Propiedades en Gestión */}
            <div className="bg-white shadow-[var(--shadow-card)] rounded-xl border border-[var(--border-default)] overflow-hidden">
              <div className="px-6 py-5 border-b border-[var(--border-default)] flex items-center justify-between">
                <h2 className="text-[16px] font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#1A85E5]" />
                  Propiedades en Gestión ({agente.propiedades.length})
                </h2>
              </div>
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                <table className="data-table w-full text-left">
                  <thead className="sticky top-0 bg-[var(--bg-surface-secondary)] z-10 shadow-sm">
                    <tr>
                      <th className="py-3 px-6 text-[11px]">Propiedad</th>
                      <th className="py-3 px-6 text-[11px]">Precio</th>
                      <th className="py-3 px-6 text-[11px]">Estado</th>
                      <th className="py-3 px-6 text-[11px] text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agente.propiedades.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-[var(--text-tertiary)] text-[13px]">
                          No tiene propiedades asignadas actualmente.
                        </td>
                      </tr>
                    ) : (
                      agente.propiedades.map((prop) => (
                        <tr key={prop.id} className="hover:bg-[var(--bg-hover)]">
                          <td className="py-3 px-6">
                            <div className="font-medium text-[13px] text-[var(--text-primary)]">{prop.titulo}</div>
                            <div className="text-[11px] text-[var(--text-tertiary)]">{prop.sector}</div>
                          </td>
                          <td className="py-3 px-6 text-[13px] font-medium text-[var(--text-secondary)]">
                            ${prop.precio.toLocaleString()}
                          </td>
                          <td className="py-3 px-6">
                            <Badge variant={getStatusVariant(prop.estado)} className="text-[10px] px-2 py-0.5">{prop.estado}</Badge>
                          </td>
                          <td className="py-3 px-6 text-right">
                            <Link href={`/propiedades/${prop.id}`} className="text-[#1A85E5] hover:underline text-[12px] font-medium">Ver</Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cartera de Clientes */}
            <div className="bg-white shadow-[var(--shadow-card)] rounded-xl border border-[var(--border-default)] overflow-hidden">
              <div className="px-6 py-5 border-b border-[var(--border-default)] flex items-center justify-between">
                <h2 className="text-[16px] font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <UserCircle className="w-4 h-4 text-[#1A85E5]" />
                  Cartera de Clientes ({agente.clientes.length})
                </h2>
              </div>
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                <table className="data-table w-full text-left">
                  <thead className="sticky top-0 bg-[var(--bg-surface-secondary)] z-10 shadow-sm">
                    <tr>
                      <th className="py-3 px-6 text-[11px]">Cliente</th>
                      <th className="py-3 px-6 text-[11px]">Presupuesto Máx</th>
                      <th className="py-3 px-6 text-[11px]">Estado</th>
                      <th className="py-3 px-6 text-[11px] text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agente.clientes.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-[var(--text-tertiary)] text-[13px]">
                          No tiene clientes asignados en su cartera.
                        </td>
                      </tr>
                    ) : (
                      agente.clientes.map((cliente) => (
                        <tr key={cliente.id} className="hover:bg-[var(--bg-hover)]">
                          <td className="py-3 px-6">
                            <div className="font-medium text-[13px] text-[var(--text-primary)] flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[9px] font-bold">
                                {cliente.nombre ? cliente.nombre.charAt(0).toUpperCase() : '?'}
                              </div>
                              {cliente.nombre || 'Desconocido'}
                            </div>
                          </td>
                          <td className="py-3 px-6 text-[13px] text-[var(--text-secondary)]">
                            {cliente.presupuesto_max ? `$${cliente.presupuesto_max.toLocaleString()}` : 'N/A'}
                          </td>
                          <td className="py-3 px-6">
                            <Badge variant={getStatusVariant(cliente.estado)} className="text-[10px] px-2 py-0.5">{cliente.estado}</Badge>
                          </td>
                          <td className="py-3 px-6 text-right">
                            <Link href={`/clientes/${cliente.id}`} className="text-[#1A85E5] hover:underline text-[12px] font-medium">Ver</Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Columna Secundaria Derecha (Historial) */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-[var(--shadow-card)] rounded-xl border border-[var(--border-default)] overflow-hidden sticky top-6">
              <div className="px-6 py-5 border-b border-[var(--border-default)] flex items-center justify-between">
                <h2 className="text-[16px] font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#1A85E5]" />
                  Historial de Actividad
                </h2>
              </div>
              
              <div className="p-6">
                {agente.actividades && agente.actividades.length > 0 ? (
                  <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
                    {agente.actividades.map((act) => (
                      <div key={act.id} className="relative pl-6">
                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-[#1A85E5]"></div>
                        <div className="mb-0.5 text-[11px] font-medium text-[var(--text-tertiary)] flex items-center gap-1.5">
                          {new Date(act.fecha).toLocaleString('es-ES', { 
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                        <div className="text-[13px] font-semibold text-[var(--text-primary)]">
                          {act.tipo}
                        </div>
                        <div className="text-[12px] text-[var(--text-secondary)] mt-1">
                          {act.descripcion}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[var(--text-tertiary)] flex flex-col items-center">
                    <FileText className="w-10 h-10 mb-3 opacity-30" />
                    <span className="text-[13px]">Sin actividad reciente</span>
                    <p className="text-[11px] mt-1 opacity-75">Las acciones del agente (llamadas, visitas) aparecerán aquí.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
