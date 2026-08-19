import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getTenantId } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { normalizarTelefono } from '@/lib/phoneUtils'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-empresa-id',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere iniciar sesión.' },
        { status: 401, headers: corsHeaders }
      )
    }

    const empresaId = await getTenantId()
    if (!empresaId) {
      return NextResponse.json(
        { error: 'No hay una empresa activa en la sesión.' },
        { status: 400, headers: corsHeaders }
      )
    }

    const body = await request.json()
    const { telefono, nombre, origen, etiquetas, presupuesto_max, presupuesto_min, tipo, agente_id } = body

    if (!telefono) {
      return NextResponse.json({ error: 'El teléfono es requerido' }, { status: 400, headers: corsHeaders })
    }

    if (!nombre || !String(nombre).trim()) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400, headers: corsHeaders })
    }

    const normTel = normalizarTelefono(String(telefono))

    // Process tags
    let tagsArray: string[] = []
    if (Array.isArray(etiquetas)) {
      tagsArray = etiquetas.map(t => String(t).toLowerCase().trim())
    } else if (typeof etiquetas === 'string') {
      try {
        const parsed = JSON.parse(etiquetas)
        tagsArray = Array.isArray(parsed) 
          ? parsed.map(t => String(t).toLowerCase().trim()) 
          : [etiquetas.toLowerCase().trim()]
      } catch {
        if (etiquetas.includes(',')) {
          tagsArray = etiquetas.split(',').map(t => t.toLowerCase().trim())
        } else {
          tagsArray = [etiquetas.toLowerCase().trim()]
        }
      }
    }

    if (tipo && typeof tipo === 'string') {
      const tipoClean = tipo.toLowerCase().trim()
      if (!tagsArray.includes(tipoClean)) {
        tagsArray.push(tipoClean)
      }
    }

    const tagsJSON = tagsArray.length > 0 ? JSON.stringify(tagsArray) : null
    const presMax = presupuesto_max ? parseFloat(presupuesto_max) : null
    const presMin = presupuesto_min ? parseFloat(presupuesto_min) : null

    // Search existing client ONLY within this tenant
    const clientesEmpresa = await prisma.cliente.findMany({
      where: { empresa_id: empresaId }
    })

    let clienteExistente = clientesEmpresa.find(c => normalizarTelefono(c.telefono) === normTel || c.telefono === String(telefono).trim())

    // Determine agent assignment — only agents from this tenant
    let agenteAsignadoId = agente_id || null
    if (!agenteAsignadoId && !clienteExistente?.agente_asignado_id) {
      const agenteActivo = await prisma.agente.findFirst({
        where: { empresa_id: empresaId, estado: 'Activo' },
        orderBy: { nombre: 'asc' }
      })
      if (agenteActivo) {
        agenteAsignadoId = agenteActivo.id
      }
    }

    // Validate agent belongs to this tenant
    if (agenteAsignadoId) {
      const agenteValido = await prisma.agente.findFirst({
        where: { id: agenteAsignadoId, empresa_id: empresaId }
      })
      if (!agenteValido) {
        agenteAsignadoId = null
      }
    }

    let cliente

    if (clienteExistente) {
      // Update existing client — scoped to tenant
      cliente = await prisma.cliente.update({
        where: { id: clienteExistente.id },
        data: {
          nombre: nombre || clienteExistente.nombre,
          origen: origen || clienteExistente.origen,
          etiquetas: tagsJSON || clienteExistente.etiquetas,
          presupuesto_max: presMax || clienteExistente.presupuesto_max,
          presupuesto_min: presMin || clienteExistente.presupuesto_min,
          agente_asignado_id: clienteExistente.agente_asignado_id || agenteAsignadoId,
        },
      })
    } else {
      // Create new client — always scoped to current tenant
      cliente = await prisma.cliente.create({
        data: {
          empresa_id: empresaId,
          telefono: String(telefono).trim(),
          nombre: nombre || null,
          origen: origen || 'Web / External',
          estado: agenteAsignadoId ? 'En Asignación' : 'Nuevo',
          etiquetas: tagsJSON,
          presupuesto_max: presMax,
          presupuesto_min: presMin,
          agente_asignado_id: agenteAsignadoId,
        },
      })
    }

    if (agenteAsignadoId && clienteExistente?.agente_asignado_id !== agenteAsignadoId) {
      await prisma.venta.updateMany({
        where: {
          cliente_id: cliente.id,
          empresa_id: empresaId
        },
        data: {
          agente_id: agenteAsignadoId
        }
      })
    }

    return NextResponse.json({ success: true, cliente }, { headers: corsHeaders })
  } catch (error: any) {
    console.error('Error upserting cliente:', error)
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500, headers: corsHeaders })
  }
}
