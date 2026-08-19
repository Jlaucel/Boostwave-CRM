'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/Badge'
import { Printer, ArrowLeft, Trash2, CheckCircle2, Clock } from 'lucide-react'
import { actualizarEstadoDocumento, eliminarDocumentoLegal } from '@/app/actions/documentos'

function getDocumentStatusVariant(estado: string) {
  switch (estado) {
    case 'Firmado': return 'success'
    case 'Pendiente de Firma': return 'warning'
    case 'Vencido': return 'error'
    case 'Borrador': default: return 'neutral'
  }
}

export function DocumentDetailClient({ doc }: { doc: any }) {
  const [estado, setEstado] = useState<string>(doc.estado)
  const [isPending, startTransition] = useTransition()

  const handleStatusChange = (nuevoEstado: string) => {
    setEstado(nuevoEstado)
    startTransition(async () => {
      await actualizarEstadoDocumento(doc.id, nuevoEstado)
    })
  }

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de eliminar este documento legal?')) {
      await eliminarDocumentoLegal(doc.id)
      window.location.href = '/documentos'
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <PageHeader
        title={doc.titulo}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Documentos', href: '/documentos' },
          { label: doc.titulo }
        ]}
        actions={
          <div className="flex gap-2 no-print">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-[#1A85E5] text-white px-4 py-2 rounded-md hover:bg-blue-600 text-[13px] font-semibold transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimir / PDF
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-md hover:bg-red-100 text-[13px] font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        }
      />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        
        {/* Status Control Panel (Hidden on Print) */}
        <div className="bg-white border rounded-xl shadow-[var(--shadow-card)] p-4 flex flex-wrap items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-semibold text-[var(--text-secondary)]">Estado del Contrato:</span>
            <Badge variant={getDocumentStatusVariant(estado)}>{estado}</Badge>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[var(--text-tertiary)] mr-1">Cambiar estado:</span>
            <button
              onClick={() => handleStatusChange('Borrador')}
              className={`px-3 py-1 rounded text-[12px] font-semibold border transition-colors ${
                estado === 'Borrador' ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Borrador
            </button>
            <button
              onClick={() => handleStatusChange('Pendiente de Firma')}
              className={`px-3 py-1 rounded text-[12px] font-semibold border transition-colors ${
                estado === 'Pendiente de Firma' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Pendiente Firma
            </button>
            <button
              onClick={() => handleStatusChange('Firmado')}
              className={`px-3 py-1 rounded text-[12px] font-semibold border transition-colors ${
                estado === 'Firmado' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              ✓ Firmado
            </button>
          </div>
        </div>

        {/* Contract Sheet (Print Target) */}
        <div className="bg-white border rounded-xl shadow-lg p-10 space-y-6 print:border-0 print:shadow-none print:p-0">
          
          {/* Header Banner */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-end">
            <div>
              <div className="text-[18px] font-bold text-slate-900 tracking-wider">BOOSTWAVE REAL ESTATE</div>
              <div className="text-[11px] text-slate-500 uppercase tracking-widest">Documentación Jurídica Inmobiliaria RD</div>
            </div>
            <div className="text-right">
              <div className="text-[12px] font-bold text-[#1A85E5]">{doc.tipo_documento}</div>
              <div className="text-[10px] text-slate-400">ID: {doc.id.slice(0, 8).toUpperCase()}</div>
            </div>
          </div>

          {/* Document Metadata Bar */}
          <div className="grid grid-cols-3 gap-4 bg-slate-50 border border-slate-200 rounded-lg p-4 text-[12px]">
            <div>
              <span className="block text-slate-400 font-semibold text-[10px] uppercase">Cliente</span>
              <span className="font-bold text-slate-800">{doc.cliente?.nombre || doc.cliente?.telefono || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-slate-400 font-semibold text-[10px] uppercase">Propiedad</span>
              <span className="font-bold text-slate-800">{doc.propiedad?.titulo || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-slate-400 font-semibold text-[10px] uppercase">Agente Comercial</span>
              <span className="font-bold text-slate-800">{doc.agente?.nombre || 'BoostWave RD'}</span>
            </div>
          </div>

          {/* Contract Content */}
          <div className="whitespace-pre-line font-mono text-[13px] leading-relaxed text-slate-800 bg-slate-50/50 p-6 rounded-lg border border-slate-200">
            {doc.contenido || 'Sin contenido en el contrato.'}
          </div>

          {/* Footer Seals */}
          <div className="pt-8 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
            <div>Generado vía BoostWave CRM — Sistema Inmobiliario República Dominicana</div>
            <div>Fecha: {new Date(doc.fecha_creacion).toLocaleDateString()}</div>
          </div>

        </div>

        {/* Back Link */}
        <div className="no-print pt-2">
          <Link
            href="/documentos"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1A85E5] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Repositorio de Documentos
          </Link>
        </div>

      </div>
    </>
  )
}
