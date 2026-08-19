'use client'

import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { cambiarEtapaPipeline } from '@/app/actions/pipeline'
import { useRouter } from 'next/navigation'

export function ReactivarVentaBoton({ ventaId }: { ventaId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleReactivate = async () => {
    if (!confirm('¿Estás seguro que deseas reactivar esta oportunidad? Volverá a la etapa "Contacto Inicial".')) {
      return
    }

    setIsLoading(true)
    try {
      const res = await cambiarEtapaPipeline(ventaId, 'Contacto Inicial')
      if (res.success) {
        router.refresh()
      } else {
        alert(res.error || 'Ocurrió un error al reactivar la oportunidad.')
      }
    } catch (err) {
      console.error(err)
      alert('Error interno del servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleReactivate}
      disabled={isLoading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50"
      title="Volver a activar oportunidad"
    >
      <RotateCcw className="w-3.5 h-3.5" />
      {isLoading ? 'Reactivando...' : 'Reactivar'}
    </button>
  )
}
