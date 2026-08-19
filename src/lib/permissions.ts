export type Rol = 'Agente Owner' | 'Agente Admin' | 'Agente Normal'
export type Modulo = 'dashboard' | 'clientes' | 'agentes' | 'propiedades' | 'pipeline' | 'analiticas' | 'documentos' | 'configuracion' | 'admin'
export type Alcance = 'empresa' | 'propio' | 'sin_restriccion' | 'ninguno'

// Permission matrix from spec section 5
const PERMISOS: Record<Modulo, Record<Rol, Alcance>> = {
  dashboard:      { 'Agente Owner': 'empresa', 'Agente Admin': 'empresa', 'Agente Normal': 'propio' },
  clientes:       { 'Agente Owner': 'empresa', 'Agente Admin': 'empresa', 'Agente Normal': 'propio' },
  agentes:        { 'Agente Owner': 'empresa', 'Agente Admin': 'empresa', 'Agente Normal': 'propio' },
  propiedades:    { 'Agente Owner': 'empresa', 'Agente Admin': 'empresa', 'Agente Normal': 'empresa' },  // Normal sees all properties
  pipeline:       { 'Agente Owner': 'empresa', 'Agente Admin': 'empresa', 'Agente Normal': 'propio' },
  analiticas:     { 'Agente Owner': 'empresa', 'Agente Admin': 'empresa', 'Agente Normal': 'propio' },
  documentos:     { 'Agente Owner': 'sin_restriccion', 'Agente Admin': 'sin_restriccion', 'Agente Normal': 'sin_restriccion' },
  configuracion:  { 'Agente Owner': 'empresa', 'Agente Admin': 'ninguno', 'Agente Normal': 'ninguno' },
  admin:          { 'Agente Owner': 'ninguno', 'Agente Admin': 'ninguno', 'Agente Normal': 'ninguno' },
}

export function getAlcance(rol: Rol, modulo: Modulo): Alcance {
  return PERMISOS[modulo]?.[rol] ?? 'ninguno'
}

export function tieneAcceso(rol: Rol, modulo: Modulo): boolean {
  return getAlcance(rol, modulo) !== 'ninguno'
}

// Section 7: Deactivation rules
export function canDeactivateUser(actorRol: Rol | 'Admin Owner Global', targetRol: Rol): boolean {
  if (actorRol === 'Admin Owner Global') return true
  if (actorRol === 'Agente Owner') return targetRol === 'Agente Admin' || targetRol === 'Agente Normal'
  if (actorRol === 'Agente Admin') return targetRol === 'Agente Normal'
  return false
}

// Only Owner can assign/remove Admin role
export function canChangeRole(actorRol: Rol | 'Admin Owner Global', targetCurrentRol: Rol, newRol: Rol): boolean {
  if (actorRol === 'Admin Owner Global') return true
  if (actorRol === 'Agente Owner') {
    // Owner can promote Normal to Admin or demote Admin to Normal
    return (targetCurrentRol === 'Agente Normal' && newRol === 'Agente Admin') ||
           (targetCurrentRol === 'Agente Admin' && newRol === 'Agente Normal')
  }
  return false
}

// Check if a property action is allowed
export function canEditProperty(rol: Rol | 'Admin Owner Global'): boolean {
  if (rol === 'Admin Owner Global') return true
  return rol === 'Agente Owner' || rol === 'Agente Admin'
}

// Sidebar navigation items filtered by role
export function getNavItemsForRole(rol: Rol | 'Admin Owner Global' | null, isGlobalAdmin: boolean): string[] {
  if (isGlobalAdmin) return ['admin', 'dashboard', 'clientes', 'agentes', 'propiedades', 'pipeline', 'analiticas', 'documentos', 'configuracion']
  if (!rol) return []
  
  const items: string[] = []
  const modulos: Modulo[] = ['dashboard', 'clientes', 'agentes', 'propiedades', 'pipeline', 'analiticas', 'documentos', 'configuracion']
  
  for (const modulo of modulos) {
    if (tieneAcceso(rol as Rol, modulo)) items.push(modulo)
  }
  
  return items
}

// Allowed to reopen a closed deal
export function canReopenCerrado(rol: Rol | 'Admin Owner Global' | null, isGlobalAdmin: boolean): boolean {
  if (isGlobalAdmin || rol === 'Admin Owner Global') return true
  return rol === 'Agente Owner' || rol === 'Agente Admin'
}
