export interface PropertySpecs {
  hab: number
  banos: number
  parqueos: number
}

export function parsePropertySpecs(tagsJson?: string | null, desc?: string | null): PropertySpecs {
  let tags: string[] = []
  if (tagsJson) {
    try {
      tags = JSON.parse(tagsJson)
    } catch {}
  }

  const text = (tags.join(' ') + ' ' + (desc || '')).toLowerCase()

  // 1. Habitaciones
  let hab = 0
  const habMatch = text.match(/(\d+)\s*(?:hab|habitaciones|dormitorio|dormitorios|habs)/)
  if (habMatch) {
    hab = parseInt(habMatch[1], 10)
  }

  // 2. Baños
  let banos = 0
  const banosMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:baño|baños|bano|banos)/)
  if (banosMatch) {
    banos = parseFloat(banosMatch[1])
  }

  // 3. Parqueos
  let parqueos = 0
  const parqueosMatch = text.match(/(\d+)\s*(?:parqueo|parqueos|estacionamiento|estacionamientos)/)
  if (parqueosMatch) {
    parqueos = parseInt(parqueosMatch[1], 10)
  } else if (text.includes('parqueo techado') || text.includes('parqueo')) {
    parqueos = 1
  }

  return { hab, banos, parqueos }
}

export function formatFechaActualizacion(dateStrOrObj?: string | Date | null): string {
  if (!dateStrOrObj) return 'Reciente'
  const date = new Date(dateStrOrObj)
  if (isNaN(date.getTime())) return 'Reciente'

  const diffMs = new Date().getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 30) return `Hace ${diffDays} días`
  
  return date.toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' })
}
