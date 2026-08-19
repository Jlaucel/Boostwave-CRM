import { requireAuth } from '@/lib/auth'
import { getTenantId } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { Badge, getStatusVariant } from '@/components/Badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  Building, User, DollarSign, Calendar, Clock, 
  History, UserPlus, GitCommitHorizontal, FileText, ArrowRight
} from 'lucide-react'
import { AgenteAsignadorVenta } from '@/components/AgenteAsignadorVenta'
import { ActivityTimeline } from '@/components/ActivityTimeline'
import { ReactivarVentaBoton } from '@/components/ReactivarVentaBoton'

export const dynamic = 'force-dynamic'

export default async function VentaDetallePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await requireAuth()
  const empresaId = await getTenantId()

  const venta = await prisma.venta.findFirst({
    where: { id: params.id, empresa_id: empresaId },
    include: {
      cliente: true,
      propiedad: true,
      agente: true,
      historial_estados: {
        orderBy: { fecha: 'desc' }
      },
      actividades: {
        orderBy: { fecha: 'desc' }
      }
    }
  })

  if (!venta) notFound()

  const isCompanyAdmin = session.isGlobalAdmin || session.rol === 'Agente Owner' || session.rol === 'Agente Admin'
  const canReassign = isCompanyAdmin

  // Merge history (states + activities)
  const historyEvents = [
    ...venta.historial_estados.map(h => ({
      id: h.id,
      type: 'STATE_CHANGE',
      title: `Cambio de Estado: ${h.estado_anterior} → ${h.estado_nuevo}`,
      description: h.is_override ? `OVERRIDE: ${h.razon}` : 'Transición de flujo estándar',
      date: h.fecha,
      icon: GitCommitHorizontal,
      color: h.is_override ? 'text-amber-500' : 'text-blue-500',
      bgColor: h.is_override ? 'bg-amber-100' : 'bg-blue-100'
    })),
    ...venta.actividades.map(a => ({
      id: a.id,
      type: 'ACTIVITY',
      title: a.tipo,
      description: a.descripcion,
      date: a.fecha,
      icon: a.tipo === 'CAMBIO_AGENTE' ? UserPlus : FileText,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-100'
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  const agentes = await prisma.agente.findMany({
    where: { empresa_id: empresaId, estado: 'Activo' },
    orderBy: { nombre: 'asc' }
  })

  return (
    <>
      <PageHeader
        title="Detalle de Oportunidad"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Pipeline', href: '/ventas' },
          { label: 'Detalle Oportunidad' }
        ]}
      />

      <div className="p-6 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          
          {/* Main Info */}
          <div className="space-y-6">
            <div className="bg-white border border-[var(--border-default)] rounded-xl shadow-[var(--shadow-card)] p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-[20px] font-bold text-[var(--text-primary)] mb-2">Oportunidad de Venta</h2>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(venta.estado_venta)}>
                      {venta.estado_venta}
                    </Badge>
                    {venta.estado_venta === 'Perdido' && isCompanyAdmin && (
                      <ReactivarVentaBoton ventaId={venta.id} />
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[24px] font-bold text-[#1A85E5]">
                    ${venta.propiedad?.precio ? venta.propiedad.precio.toLocaleString() : '0'} USD
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-5 h-5 text-slate-400" />
                    <h3 className="text-[13px] font-semibold text-slate-700">Cliente</h3>
                  </div>
                  <Link href={`/clientes/${venta.cliente.id}`} className="text-[14px] font-medium text-[#1A85E5] hover:underline">
                    {venta.cliente.nombre}
                  </Link>
                  <div className="text-[12px] text-slate-500 mt-1">{venta.cliente.correo_electronico}</div>
                  <div className="text-[12px] text-slate-500">{venta.cliente.telefono}</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Building className="w-5 h-5 text-slate-400" />
                    <h3 className="text-[13px] font-semibold text-slate-700">Propiedad</h3>
                  </div>
                  {venta.propiedad ? (
                    <>
                      <Link href={`/propiedades/${venta.propiedad.id}`} className="text-[14px] font-medium text-[#1A85E5] hover:underline">
                        {venta.propiedad.titulo}
                      </Link>
                      <div className="text-[12px] text-slate-500 mt-1">{venta.propiedad.sector}, {venta.propiedad.provincia}</div>
                      <div className="text-[12px] text-slate-500">{venta.propiedad.tipo}</div>
                    </>
                  ) : (
                    <div className="text-[14px] font-medium text-slate-500">Sin propiedad asignada</div>
                  )}
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-100 pt-6">
                <div>
                  <div className="text-[11px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Fecha Interés
                  </div>
                  <div className="text-[13px] font-medium text-slate-800">
                    {format(venta.fecha_interes, "d MMM yyyy", { locale: es })}
                  </div>
                </div>
                {venta.fecha_visita && (
                  <div>
                    <div className="text-[11px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Visita Prog.
                    </div>
                    <div className="text-[13px] font-medium text-slate-800">
                      {format(venta.fecha_visita, "d MMM yyyy", { locale: es })}
                    </div>
                  </div>
                )}
                {venta.monto_oferta && (
                  <div>
                    <div className="text-[11px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" /> Oferta Realizada
                    </div>
                    <div className="text-[13px] font-medium text-emerald-600">
                      ${venta.monto_oferta.toLocaleString()}
                    </div>
                  </div>
                )}
                {venta.motivo_perdida && (
                  <div>
                    <div className="text-[11px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> Motivo Pérdida
                    </div>
                    <div className="text-[13px] font-medium text-red-600">
                      {venta.motivo_perdida}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            
            {/* Agent Assignation */}
            <div className="bg-white border border-[var(--border-default)] rounded-xl shadow-[var(--shadow-card)] p-6">
              <h3 className="text-[14px] font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                Agente Asignado
              </h3>
              
              {canReassign ? (
                <AgenteAsignadorVenta 
                  ventaId={venta.id} 
                  agenteAsignadoId={venta.agente_id} 
                  agentes={agentes} 
                />
              ) : (
                <div className="text-[14px] text-slate-700 font-medium">
                  {venta.agente ? venta.agente.nombre : 'No asignado'}
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white border border-[var(--border-default)] rounded-xl shadow-[var(--shadow-card)] p-6">
              <h3 className="text-[14px] font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                Historial de la Oportunidad
              </h3>

              <ActivityTimeline events={historyEvents} />
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
