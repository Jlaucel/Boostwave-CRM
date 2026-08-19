import { requireAuth } from '@/lib/auth'
import { getTenantId } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/Badge'
import { FileText, Plus, CheckCircle, Clock, FileCheck, Eye } from 'lucide-react'
import { StatCard } from '@/components/StatCard'

export const dynamic = 'force-dynamic'

function getDocumentStatusVariant(estado: string) {
  switch (estado) {
    case 'Firmado': return 'success'
    case 'Pendiente de Firma': return 'warning'
    case 'Vencido': return 'error'
    case 'Borrador': default: return 'neutral'
  }
}

export default async function DocumentosPage() {
  const session = await requireAuth()
  const empresaId = await getTenantId()

  let documentos: any[] = []
  try {
    documentos = await prisma.documentoLegal.findMany({
      where: { empresa_id: empresaId },
      include: {
        cliente: true,
        propiedad: true,
        agente: true
      },
      orderBy: { fecha_creacion: 'desc' }
    })
  } catch (error) {
    console.error('DocumentoLegal table not yet created in SQLite db:', error)
  }

  const totalDocs = documentos.length
  const firmados = documentos.filter(d => d.estado === 'Firmado').length
  const pendientes = documentos.filter(d => d.estado === 'Pendiente de Firma').length
  const borradores = documentos.filter(d => d.estado === 'Borrador').length

  return (
    <>
      <PageHeader
        title="Documentos y Contratos Legales"
        icon={FileText}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Documentos' }
        ]}
        actions={
          <Link
            href="/documentos/nuevo"
            className="flex items-center gap-2 bg-[#1A85E5] text-white px-4 py-2 rounded-md hover:bg-blue-600 text-[13px] font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            + Generar Nuevo Contrato
          </Link>
        }
      />

      <div className="p-6 space-y-6 max-w-[1300px] mx-auto">
        
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Documentos"
            value={totalDocs}
            subtitle="Repositorio central"
            icon={FileText}
            accent="blue"
          />
          <StatCard
            label="Firmados"
            value={firmados}
            subtitle="Contratos ejecutados"
            icon={CheckCircle}
            accent="green"
          />
          <StatCard
            label="Pendientes de Firma"
            value={pendientes}
            subtitle="En proceso de firma"
            icon={Clock}
            accent="amber"
          />
          <StatCard
            label="Borradores"
            value={borradores}
            subtitle="En preparación"
            icon={FileCheck}
            accent="purple"
          />
        </div>

        {/* Documents Table */}
        <div className="bg-white border rounded-xl shadow-[var(--shadow-card)] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[16px] font-bold text-[var(--text-primary)]">
                Repositorio de Contratos y Documentos Legales RD
              </h3>
              <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
                Contratos de Arras, Promesas de Compraventa, Alquileres y expedientes legales vinculados a clientes e inmuebles.
              </p>
            </div>
          </div>

          {documentos.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <h4 className="font-bold text-[14px] text-[var(--text-primary)]">No hay documentos registrados</h4>
              <p className="text-[12px] text-[var(--text-tertiary)] mt-1 mb-4">
                Genera tu primer contrato legal automatizado para un cliente o propiedad.
              </p>
              <Link
                href="/documentos/nuevo"
                className="inline-flex items-center gap-2 bg-[#1A85E5] text-white px-4 py-2 rounded-md text-[13px] font-semibold hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Generar Contrato
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th>Título del Documento</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Cliente Vinculado</th>
                    <th>Propiedad Vinculada</th>
                    <th>Fecha Registro</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {documentos.map(doc => (
                    <tr key={doc.id}>
                      <td className="font-bold text-[13px] text-[var(--text-primary)]">
                        <Link href={`/documentos/${doc.id}`} className="hover:text-[#1A85E5]">
                          {doc.titulo}
                        </Link>
                      </td>
                      <td>
                        <span className="text-[12px] font-medium text-[var(--text-secondary)]">
                          {doc.tipo_documento}
                        </span>
                      </td>
                      <td>
                        <Badge variant={getDocumentStatusVariant(doc.estado)}>
                          {doc.estado}
                        </Badge>
                      </td>
                      <td className="text-[13px]">
                        {doc.cliente ? (
                          <Link href={`/clientes/${doc.cliente.id}`} className="text-[#1A85E5] hover:underline">
                            {doc.cliente.nombre || doc.cliente.telefono}
                          </Link>
                        ) : (
                          <span className="text-gray-400 text-[12px]">Sin vincular</span>
                        )}
                      </td>
                      <td className="text-[13px]">
                        {doc.propiedad ? (
                          <Link href={`/propiedades/${doc.propiedad.id}`} className="text-[#1A85E5] hover:underline">
                            {doc.propiedad.titulo}
                          </Link>
                        ) : (
                          <span className="text-gray-400 text-[12px]">Sin vincular</span>
                        )}
                      </td>
                      <td className="text-[12px] text-[var(--text-tertiary)]">
                        {new Date(doc.fecha_creacion).toLocaleDateString()}
                      </td>
                      <td>
                        <Link
                          href={`/documentos/${doc.id}`}
                          className="flex items-center gap-1 text-[12px] font-semibold text-[#1A85E5] hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" /> Ver / Imprimir
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </>
  )
}
