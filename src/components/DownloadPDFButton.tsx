'use client'

import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { generateStructuredPropertyPDF, PropiedadPDFData } from '@/lib/pdfGenerator'

interface DownloadPDFButtonProps {
  propiedad: PropiedadPDFData
  filename?: string
}

export function DownloadPDFButton({ propiedad }: DownloadPDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleDownload = async () => {
    try {
      setIsGenerating(true)
      setErrorMsg(null)
      await generateStructuredPropertyPDF(propiedad)
    } catch (error: any) {
      console.error('Error generando PDF estructurado:', error)
      setErrorMsg(error?.message || 'Error al construir el PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button 
        onClick={handleDownload}
        disabled={isGenerating}
        className="flex items-center gap-2 bg-[#2196F3] text-white px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-[#1A85E5] transition-colors disabled:opacity-70 shadow-sm"
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileDown className="w-4 h-4" />
        )}
        <span>{isGenerating ? 'Generando Ficha Técnica...' : 'Descargar PDF'}</span>
      </button>
      {errorMsg && <span className="text-[10px] text-red-500 max-w-[200px] text-right leading-tight">{errorMsg}</span>}
    </div>
  )
}
