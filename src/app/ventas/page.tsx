import { requireAuth } from '@/lib/auth'
import { getTenantId } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { GitCommitHorizontal } from 'lucide-react'
import { PipelineBoard } from '@/components/PipelineBoard'

export const dynamic = 'force-dynamic'

export default async function VentasPipelinePage() {
  const session = await requireAuth()
  const empresaId = await getTenantId()

  const isCompanyAdmin = session.isGlobalAdmin || session.rol === 'Agente Owner' || session.rol === 'Agente Admin'
  const ventasWhere: any = { empresa_id: empresaId }

  if (!isCompanyAdmin) {
    ventasWhere.agente_id = session.agenteId || 'non-existent-agente-id'
  }

  const ventas = await prisma.venta.findMany({
    where: ventasWhere,
    include: {
      cliente: {
        include: { agente: true }
      },
      propiedad: true,
      agente: true,
    },
    orderBy: { fecha_interes: 'desc' },
  })

  // Serialize dates for client component - siempre mostrando el agente vinculado actualmente al cliente
  const ventasSerialized = ventas.map(v => {
    const agenteActual = v.cliente?.agente || v.agente
    return {
      id: v.id,
      estado_venta: v.estado_venta,
      fecha_interes: v.fecha_interes.toISOString(),
      fecha_actualizacion_estado: v.fecha_actualizacion_estado.toISOString(),
      motivo_perdida: v.motivo_perdida,
      notas: v.notas,
      cliente: {
        id: v.cliente.id,
        nombre: v.cliente.nombre,
        telefono: v.cliente.telefono
      },
      propiedad: v.propiedad ? {
        id: v.propiedad.id,
        titulo: v.propiedad.titulo,
        precio: v.propiedad.precio
      } : null,
      agente: agenteActual ? {
        id: agenteActual.id,
        nombre: agenteActual.nombre
      } : null
    }
  })

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Pipeline de Ventas"
        icon={GitCommitHorizontal}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Pipeline' }
        ]}
        actions={
          <Link 
            href="/ventas/nueva" 
            className="bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-700 text-[13px] font-medium transition-colors shadow-sm"
          >
            + Nueva Oportunidad
          </Link>
        }
      />

      <PipelineBoard ventasIniciales={ventasSerialized} isAdmin={isCompanyAdmin} />
    </div>
  )
}
