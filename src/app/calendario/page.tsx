import { requireAuth } from '@/lib/auth'
import { getTenantId } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/PageHeader'
import { Calendar as CalendarIcon } from 'lucide-react'
import { CalendarClient } from './CalendarClient'

export const dynamic = 'force-dynamic'

export default async function CalendarioPage() {
  const session = await requireAuth()
  const empresaId = await getTenantId()

  // Solo traemos ventas que tienen fecha de visita programada
  const visitasProgramadas = await prisma.venta.findMany({
    where: {
      empresa_id: empresaId,
      fecha_visita: {
        not: null
      }
    },
    include: {
      cliente: true,
      propiedad: true,
      agente: true
    },
    orderBy: {
      fecha_visita: 'asc'
    }
  })

  return (
    <>
      <PageHeader
        title="Calendario de Visitas"
        icon={CalendarIcon}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Calendario' }
        ]}
      />

      <div className="p-4 lg:p-6 h-[calc(100vh-130px)] flex flex-col">
        <CalendarClient visitas={visitasProgramadas} />
      </div>
    </>
  )
}
