'use server'

import { requireAuth } from '@/lib/auth'
import { getTenantId, tenantWhere } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { normalizarTelefono } from '@/lib/phoneUtils'

export async function createCliente(formData: FormData) {
  const session = await requireAuth()
  const empresaId = await getTenantId()

  if (!empresaId) {
    throw new Error('No hay una empresa activa en la sesión.')
  }

  const isCompanyAdmin = session.isGlobalAdmin || session.rol === 'Agente Owner' || session.rol === 'Agente Admin'

  const nombre = (formData.get('nombre') as string)?.trim() || null
  if (!nombre) {
    throw new Error('El nombre es requerido')
  }

  const rawTelefono = formData.get('telefono') as string
  const presupuesto_min = formData.get('presupuesto_min') ? Number(formData.get('presupuesto_min')) : null
  const presupuesto_max = formData.get('presupuesto_max') ? Number(formData.get('presupuesto_max')) : null
  
  let agente_asignado_id = (formData.get('agente_asignado_id') as string)?.trim() || null
  
  if (!isCompanyAdmin) {
    agente_asignado_id = session.agenteId || null
  } else if (agente_asignado_id) {
    const agenteExiste = await prisma.agente.findFirst({
      where: { id: agente_asignado_id, empresa_id: empresaId }
    })
    if (!agenteExiste) {
      agente_asignado_id = null
    }
  }

  const origen = 'Manual' // Lock origin to Manual when creating manually

  if (!rawTelefono) {
    throw new Error('El teléfono es requerido')
  }

  const normTel = normalizarTelefono(rawTelefono)
  
  // Check if a client with these last 10 digits already exists (across all clients in DB for Prisma @unique constraint safety)
  const clientes = await prisma.cliente.findMany({ select: { id: true, nombre: true, telefono: true } })
  const duplicado = clientes.find(c => normalizarTelefono(c.telefono) === normTel || c.telefono === rawTelefono.trim())

  if (duplicado) {
    throw new Error(`Ya existe un cliente registrado con este número (${duplicado.nombre || duplicado.telefono})`)
  }

  const etiquetasArray = formData.getAll('etiquetas') as string[]
  let etiquetas: string | null = null
  
  if (etiquetasArray && etiquetasArray.length > 0) {
    if (etiquetasArray.length === 1 && etiquetasArray[0].includes(',')) {
      const tagsArray = etiquetasArray[0].split(',').map(tag => tag.trim()).filter(Boolean)
      etiquetas = JSON.stringify(tagsArray)
    } else {
      etiquetas = JSON.stringify(etiquetasArray)
    }
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
  if (agente_asignado_id) revalidatePath(`/agentes/${agente_asignado_id}`)
  redirect(`/clientes/${cliente.id}`)
}

export async function createVenta(formData: FormData) {
  const empresaId = await getTenantId()
  const cliente_id = formData.get('cliente_id') as string
  const propiedad_id = formData.get('propiedad_id') as string || null
  const estado_venta = formData.get('estado_venta') as string || 'Contacto Inicial'
  const notas = formData.get('notas') as string || null

  if (!cliente_id) {
    throw new Error('Cliente es requerido')
  }

  // Validate propiedad belongs to this tenant or is multiempresa
  if (propiedad_id) {
    const propiedadValida = await prisma.propiedad.findFirst({
      where: {
        id: propiedad_id,
        OR: [
          { empresa_id: empresaId },
          { multiempresa: true }
        ]
      }
    })
    if (!propiedadValida) {
      throw new Error('Propiedad no encontrada o no accesible para tu empresa')
    }
  } else if (estado_venta !== 'Contacto Inicial' && estado_venta !== 'Perdido') {
    throw new Error('Debe seleccionar una propiedad para crear la oportunidad en esta etapa')
  }

  // Force agent to be the client's agent
  const cliente = await prisma.cliente.findFirst({ where: { id: cliente_id, empresa_id: empresaId } })
  if (!cliente) throw new Error('Cliente no encontrado')
  
  let agente_id = cliente.agente_asignado_id
  if (!agente_id) {
    const agentes = await prisma.agente.findMany({ where: { estado: 'Activo', empresa_id: empresaId }, take: 1 })
    agente_id = agentes.length > 0 ? agentes[0].id : null
    
    // Assign agent to client if they didn't have one
    if (agente_id) {
      await prisma.cliente.update({
        where: { id: cliente_id },
        data: { agente_asignado_id: agente_id, estado: 'Inicio de Negociación' }
      })
    }
  }

  const venta = await prisma.venta.create({
    data: {
      empresa_id: empresaId,
      cliente_id,
      propiedad_id,
      agente_id,
      estado_venta,
      notas,
    },
  })

  // Register activity for the agent
  if (agente_id) {
    const [cliente, propiedad] = await Promise.all([
      prisma.cliente.findFirst({ where: { id: cliente_id, empresa_id: empresaId } }),
      propiedad_id ? prisma.propiedad.findFirst({ where: { id: propiedad_id, empresa_id: empresaId } }) : Promise.resolve(null)
    ])
    
    await prisma.actividadAgente.create({
      data: {
        agente_id,
        tipo: 'Nueva Oportunidad',
        descripcion: `Nueva oportunidad creada: "${cliente?.nombre || 'Cliente'}" interesado en "${propiedad?.titulo || 'Propiedad'}" ($${propiedad?.precio.toLocaleString() || '0'})`
      }
    })
  }

  revalidatePath('/ventas')
  revalidatePath(`/clientes/${cliente_id}`)
  if (agente_id) revalidatePath(`/agentes/${agente_id}`)
  redirect('/ventas')
}

export async function updateCliente(id: string, formData: FormData) {
  const session = await requireAuth()
  const empresaId = await getTenantId()
  const isCompanyAdmin = session.isGlobalAdmin || session.rol === 'Agente Owner' || session.rol === 'Agente Admin'

  const existingClient = await prisma.cliente.findFirst({
    where: { id, empresa_id: empresaId }
  })
  if (!existingClient) throw new Error('Cliente no encontrado')

  if (!isCompanyAdmin && existingClient.agente_asignado_id !== session.agenteId) {
    throw new Error('No tienes permisos para modificar este cliente')
  }

  const nombre = (formData.get('nombre') as string)?.trim() || null
  if (!nombre) {
    throw new Error('El nombre es requerido')
  }

  const telefono = formData.get('telefono') as string
  const presupuesto_min = formData.get('presupuesto_min') ? Number(formData.get('presupuesto_min')) : null
  const presupuesto_max = formData.get('presupuesto_max') ? Number(formData.get('presupuesto_max')) : null
  
  let agente_asignado_id = formData.get('agente_asignado_id') as string || null
  if (!isCompanyAdmin) {
    // Preserve existing agent for Agente Normal
    agente_asignado_id = existingClient.agente_asignado_id
  }
  
  // Handing array of checkboxes
  const etiquetasArray = formData.getAll('etiquetas') as string[]
  let etiquetas: string | null = null
  
  if (etiquetasArray && etiquetasArray.length > 0) {
    if (etiquetasArray.length === 1 && etiquetasArray[0].includes(',')) {
      const tagsArray = etiquetasArray[0].split(',').map(tag => tag.trim()).filter(Boolean)
      etiquetas = JSON.stringify(tagsArray)
    } else {
      etiquetas = JSON.stringify(etiquetasArray)
    }
  }

  if (!telefono) {
    throw new Error('El teléfono es requerido')
  }

  await prisma.cliente.updateMany({
    where: { id, empresa_id: empresaId },
    data: {
      nombre,
      telefono: telefono.trim(),
      presupuesto_min,
      presupuesto_max,
      etiquetas,
      agente_asignado_id,
    },
  })

  // Transfer active opportunities (pipeline deals) of this client to the new agent
  if (agente_asignado_id && existingClient.agente_asignado_id !== agente_asignado_id) {
    await prisma.venta.updateMany({
      where: {
        cliente_id: id,
        empresa_id: empresaId
      },
      data: {
        agente_id: agente_asignado_id
      }
    })
  }

  revalidatePath('/ventas')
  revalidatePath('/clientes')
  revalidatePath(`/clientes/${id}`)
  if (agente_asignado_id) revalidatePath(`/agentes/${agente_asignado_id}`)
  redirect(`/clientes/${id}`)
}
