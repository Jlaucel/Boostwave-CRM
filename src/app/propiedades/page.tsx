import { requireAuth } from '@/lib/auth'
import { getTenantId } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { Building, SearchX } from 'lucide-react'
import { PropertyCard } from '@/components/PropertyCard'
import { PropertyFilters } from '@/components/PropertyFilters'
import { EmptyState } from '@/components/EmptyState'

import { parsePropertySpecs } from '@/lib/propertySpecs'

export const dynamic = 'force-dynamic'

export default async function PropiedadesPage({
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

  // Build Prisma where clause (own tenant properties)
  const where: any = {
    empresa_id: empresaId
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
    if (estado === 'Todos') {
      // Do not filter by estado
    } else {
      where.estado = estado
    }
  } else {
    // Default "active" listing excludes 'Vendida'
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
        title="Inventario de Propiedades"
        icon={Building}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Inventario' }
        ]}
        actions={
          <Link href="/propiedades/nueva" className="bg-brand-600 text-white px-4 py-2 rounded-md text-[13px] font-semibold hover:bg-brand-700">
            Nueva Propiedad
          </Link>
        }
      />

      <div className="p-4 lg:p-6">
        
        {/* Filtros */}
        <PropertyFilters agentes={agentes} />

        {/* Cuadrícula de Propiedades */}
        {propiedades.length === 0 ? (
          <EmptyState 
            icon={SearchX} 
            title="No se encontraron propiedades" 
            description="No hay inmuebles que coincidan con los filtros aplicados. Intenta cambiar los criterios de búsqueda o agrega una nueva propiedad." 
            actionLabel="Nueva Propiedad" 
            actionHref="/propiedades/nueva" 
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {propiedades.map((prop) => {
              // Calcular Matches (migrado de la lógica anterior)
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
