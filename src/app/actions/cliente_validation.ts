'use server'

import { requireAuth } from '@/lib/auth'
import { getTenantId, tenantWhere } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { normalizarTelefono } from '@/lib/phoneUtils'

export async function validarYCrearCliente(formData: FormData) {
  const session = await requireAuth()
  const empresaId = await getTenantId()

  if (!empresaId) {
    return { success: false, error: 'No hay una empresa activa en la sesión. Por favor inicie sesión nuevamente.' }
  }

  try {
    const isCompanyAdmin = session.isGlobalAdmin || session.rol === 'Agente Owner' || session.rol === 'Agente Admin'

    const nombre = (formData.get('nombre') as string)?.trim() || null
    const rawTelefono = formData.get('telefono') as string
    const presupuesto_min = formData.get('presupuesto_min') ? Number(formData.get('presupuesto_min')) : null
    const presupuesto_max = formData.get('presupuesto_max') ? Number(formData.get('presupuesto_max')) : null
    
    let agente_asignado_id = (formData.get('agente_asignado_id') as string)?.trim() || null
    
    if (!isCompanyAdmin) {
      // Agente Normal: siempre se asigna automáticamente al agente que está creando
      agente_asignado_id = session.agenteId || null
    } else if (agente_asignado_id) {
      // Validar que el agente seleccionado pertenezca a esta empresa
      const agenteExiste = await prisma.agente.findFirst({
        where: { id: agente_asignado_id, empresa_id: empresaId }
      })
      if (!agenteExiste) {
        agente_asignado_id = null
      }
    }

    const origen = 'Manual'

    if (!rawTelefono || !rawTelefono.trim()) {
      return { success: false, error: 'El teléfono es requerido' }
    }

    if (!nombre) {
      return { success: false, error: 'El nombre es requerido' }
    }

    const normTel = normalizarTelefono(rawTelefono)
    
    // Buscar duplicado en TODA la base de datos para evitar violación de índice @unique global en Prisma
    const todosClientes = await prisma.cliente.findMany({
      select: { id: true, nombre: true, telefono: true, empresa_id: true }
    })
    
    const duplicado = todosClientes.find(c => normalizarTelefono(c.telefono) === normTel || c.telefono === rawTelefono.trim())

    if (duplicado) {
      return { 
        success: false, 
        isDuplicate: true, 
        clienteExistente: {
          id: duplicado.id,
          nombre: duplicado.nombre || 'Cliente sin nombre',
          telefono: duplicado.telefono
        } 
      }
    }

    const etiquetasArray = formData.getAll('etiquetas') as string[]
    let etiquetas: string | null = null
    if (etiquetasArray && etiquetasArray.length > 0) {
      etiquetas = JSON.stringify(etiquetasArray)
    }

    const cliente = await prisma.cliente.create({
      data: {
        empresa_id: empresaId,
        nombre,
        telefono: rawTelefono.trim(),
        presupuesto_min,
        presupuesto_max,
        origen,
        etiquetas,
        estado: agente_asignado_id ? 'En Asignación' : 'Nuevo',
        agente_asignado_id,
      },
    })

    revalidatePath('/clientes')
    revalidatePath('/ventas')
    revalidatePath('/')
    if (agente_asignado_id) revalidatePath(`/agentes/${agente_asignado_id}`)
    
    return { success: true, clienteId: cliente.id }
  } catch (error: any) {
    console.error('Error creando cliente:', error)
    const errorMsg = error?.message || 'Ocurrió un error inesperado al registrar el cliente.'
    return { success: false, error: errorMsg }
  }
}
