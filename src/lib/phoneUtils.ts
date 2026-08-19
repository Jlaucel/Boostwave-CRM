/**
 * Extrae únicamente dígitos numéricos y retorna los últimos 10 dígitos.
 * Permite igualar números con o sin prefijos de país (ej. "18092994983" -> "8092994983").
 */
export function normalizarTelefono(phone: string | null | undefined): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length >= 10) {
    return digits.slice(-10)
  }
  return digits
}

/**
 * Formatea un número de 10 dígitos en formato legible de República Dominicana: (809) 299-4983
 */
export function formatearTelefono(phone: string | null | undefined): string {
  if (!phone) return 'Sin teléfono'
  const norm = normalizarTelefono(phone)
  if (norm.length === 10) {
    return `(${norm.slice(0, 3)}) ${norm.slice(3, 6)}-${norm.slice(6)}`
  }
  return phone
}

/**
 * Compara dos números de teléfono considerando la regla de los últimos 10 dígitos
 */
export function sonMismoTelefono(phone1: string, phone2: string): boolean {
  const norm1 = normalizarTelefono(phone1)
  const norm2 = normalizarTelefono(phone2)
  if (!norm1 || !norm2) return false
  return norm1 === norm2
}
