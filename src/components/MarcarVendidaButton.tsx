'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { marcarPropiedadVendida } from '@/app/actions/propiedades'

export function MarcarVendidaButton({ propiedadId }: { propiedadId: string }) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const handleMarcarVendida = async () => {
    if (!confirm('¿Estás seguro de que deseas marcar esta propiedad como VENDIDA? Se ocultará del listado activo principal.')) {
      return
    }

    setIsPending(true)
    try {
      const result = await marcarPropiedadVendida(propiedadId)
      if (result.success) {
        alert('Propiedad marcada como vendida exitosamente')
        router.refresh()
      } else {
        alert(result.error || 'Error al marcar como vendida')
      }
    } catch (error) {
      alert('Error de red al marcar como vendida')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <button
      onClick={handleMarcarVendida}
      disabled={isPending}
      className="no-print flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-50"
    >
      <CheckCircle className="w-4 h-4" />
      {isPending ? 'Procesando...' : 'Marcar como Vendida'}
    </button>
  )
}
