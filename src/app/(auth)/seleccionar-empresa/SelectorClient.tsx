'use client'

import { useState } from 'react'
import { Building2, ChevronRight, Loader2 } from 'lucide-react'
import { seleccionarEmpresaAction } from '@/app/actions/auth'

interface EmpresaData {
  id: string
  nombre: string
  rnc: string | null
  direccion: string | null
  rol: string
}

export default function SelectorClient({ empresas }: { empresas: EmpresaData[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleSelect = async (id: string) => {
    setLoadingId(id)
    try {
      await seleccionarEmpresaAction(id)
    } catch (error) {
      console.error(error)
      setLoadingId(null)
    }
  }

  return (
    <div className="grid gap-4">
      {empresas.map((empresa) => (
        <button
          key={empresa.id}
          onClick={() => handleSelect(empresa.id)}
          disabled={loadingId !== null}
          className="flex items-center p-4 w-full text-left bg-white border border-gray-200 rounded-xl hover:border-[#1A85E5] hover:shadow-md transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#1A85E5] flex items-center justify-center shrink-0 mr-4 group-hover:bg-[#1A85E5] group-hover:text-white transition-colors">
            <Building2 className="w-6 h-6" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[15px] text-gray-900 truncate">
              {empresa.nombre}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-[13px] text-gray-500">
              <span className="capitalize text-[#1A85E5] font-medium">{empresa.rol.toLowerCase()}</span>
              {empresa.rnc && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>RNC: {empresa.rnc}</span>
                </>
              )}
            </div>
          </div>

          <div className="ml-4 shrink-0 text-gray-400 group-hover:text-[#1A85E5] transition-colors">
            {loadingId === empresa.id ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
