import { requireAuth } from '@/lib/auth'
import { getTenantId } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { Globe, SearchX } from 'lucide-react'
import { PropertyCard } from '@/components/PropertyCard'
import { PropertyFilters } from '@/components/PropertyFilters'
import { parsePropertySpecs } from '@/lib/propertySpecs'

export const dynamic = 'force-dynamic'

export default async function MultiempresaPropiedadesPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await requireAuth()
  const empresaId = await getTenantId()
  const resolvedParams = await searchParams
  
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined
  const tipo = typeof resolvedParams.tipo === 'string' ? resolvedParams.tipo : undefined
  const estado = typeof resolvedParams.estado === 'string' ? resolvedParams.estado : undefined
  const agente = typeof resolvedParams.agente === 'string' ? resolvedParams.agente : undefined
  const habFilter = typeof resolvedParams.hab === 'string' ? parseInt(resolvedParams.hab, 10) : 0
  const banosFilter = typeof resolvedParams.banos === 'string' ? parseFloat(resolvedParams.banos) : 0
  const parqueosFilter = typeof resolvedParams.parqueos === 'string' ? parseInt(resolvedParams.parqueos, 10) : 0

  // Build Prisma where clause for shared multiempresa properties
  const where: any = {
    multiempresa: true
  }
  
  if (q) {
    where.AND = [
      {
        OR: [
          { titulo: { contains: q } },
          { sector: { contains: q } },
          { provincia: { contains: q } }
        ]
      }
    ]
  }
  
  if (tipo) {
    where.tipo = tipo
  }
  
  if (estado) {
    if (estado !== 'Todos') {
      where.estado = estado
    }
  } else {
    where.estado = { notIn: ['Vendida'] }
  }
  
  if (agente) {
    if (agente === 'unassigned') {
      where.agente_asignado_id = null
    } else {
      where.agente_asignado_id = agente
    }
  }

  const [rawPropiedades, clientes, agentes] = await Promise.all([
    prisma.propiedad.findMany({ 
      where,
      orderBy: { fecha_creacion: 'desc' },
      include: { 
        agente: true,
        empresa: true,
        asignacionesMultiempresa: {
          where: { empresa_id: empresaId },
          include: { agente: true }
        }
      }
    }),
    prisma.cliente.findMany({ where: { empresa_id: empresaId } }),
    prisma.agente.findMany({ where: { empresa_id: empresaId }, orderBy: { nombre: 'asc' } })
  ])

  // Filter by hab, banos, parqueos specs if specified
  const propiedades = rawPropiedades.filter(p => {
    const specs = parsePropertySpecs(p.caracteristicas_etiquetas, p.descripcion)
    if (habFilter > 0 && specs.hab < habFilter) return false
    if (banosFilter > 0 && specs.banos < banosFilter) return false
    if (parqueosFilter > 0 && specs.parqueos < parqueosFilter) return false
    return true
  })

  return (
    <>
      <PageHeader
        title="Red Multiempresa"
        icon={Globe}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Red Multiempresa' }
        ]}
        actions={
          <Link href="/propiedades/nueva" className="bg-brand-600 text-white px-4 py-2 rounded-md text-[13px] font-semibold hover:bg-brand-700">
            Nueva Propiedad
          </Link>
        }
      />

      <div className="p-6 max-w-[1200px] mx-auto">
        {/* Banner Informativo */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <Globe className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <h3 className="font-bold text-[15px]">Propiedades Compartidas de la Red</h3>
              <p className="text-[12px] text-blue-100">
                Inmuebles marcados como Multiempresa disponibles para colaboración comercial entre agencias de la red BoostWave.
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <PropertyFilters agentes={agentes} />

        {/* Cuadrícula de Propiedades */}
        {propiedades.length === 0 ? (
          <div className="bg-white border border-[var(--border-default)] rounded-xl shadow-[var(--shadow-card)] p-12 flex flex-col items-center justify-center text-center">
            <SearchX className="w-12 h-12 text-[var(--text-tertiary)] mb-4 opacity-50" />
            <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">No hay propiedades multiempresa en este momento</h3>
            <p className="text-[13px] text-[var(--text-tertiary)] mt-1 max-w-md">
              No se encontraron inmuebles marcados para compartir en la red multiempresa o no coinciden con los filtros aplicados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {propiedades.map((prop) => {
              let etiquetas: string[] = []
              try {
                if (prop.caracteristicas_etiquetas) etiquetas = JSON.parse(prop.caracteristicas_etiquetas)
              } catch (e) {}

              let matchCount = 0
              const propTipo = prop.tipo.toLowerCase()
              
              clientes.forEach(cliente => {
                if (!cliente.etiquetas) return
                let cEtiquetas: string[] = []
                try { cEtiquetas = JSON.parse(cliente.etiquetas) } catch (e) { return }
                
                if (!cEtiquetas.includes(propTipo)) return

                const sharedTags = etiquetas.filter(t => t.toLowerCase() !== propTipo && cEtiquetas.includes(t))
                const clientBudget = cliente.presupuesto_max || 0
                const isInBudgetRange = prop.precio <= clientBudget * 1.10

                if (isInBudgetRange && sharedTags.length >= 2) {
                  matchCount++
                } else if (!isInBudgetRange && sharedTags.length >= 3) {
                  matchCount++
                }
              })

              return (
                <PropertyCard 
                  key={prop.id} 
                  propiedad={prop} 
                  matchCount={matchCount} 
                  activeEmpresaId={empresaId}
                />
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
