// Define las transiciones válidas según las reglas de negocio

export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  'Contacto Inicial': ['Interesado', 'Visita Programada', 'Oferta Realizada', 'Negociación', 'Cerrado/Ganado', 'Perdido'],
  'Interesado': ['Visita Programada', 'Oferta Realizada', 'Negociación', 'Cerrado/Ganado', 'Perdido'],
  'Visita Programada': ['Oferta Realizada', 'Negociación', 'Cerrado/Ganado', 'Perdido'],
  'Oferta Realizada': ['Negociación', 'Cerrado/Ganado', 'Perdido'],
  'Negociación': ['Cerrado/Ganado', 'Perdido'],
  'Cerrado/Ganado': [], // Estado final, sin salidas estándar
  'Perdido': ['Contacto Inicial'] // Reactivación/Reapertura
}

export function isTransitionAllowed(estadoActual: string, estadoDestino: string): boolean {
  if (estadoActual === estadoDestino) return true;
  
  const posibles = ALLOWED_TRANSITIONS[estadoActual] || [];
  return posibles.includes(estadoDestino);
}
