import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getTenantId } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado. Se requiere iniciar sesión.' }, { status: 401 })
    }

    const empresaId = await getTenantId()
    if (!empresaId) {
      return NextResponse.json({ error: 'No hay una empresa activa en la sesión.' }, { status: 400 })
    }

    const body = await request.json()
    const { telefono, propiedad_id } = body

    if (!telefono || !propiedad_id) {
      return NextResponse.json({ error: 'El teléfono y el ID de la propiedad son requeridos' }, { status: 400 })
    }

    // Find client ONLY within this tenant
    const cliente = await prisma.cliente.findFirst({
      where: { telefono, empresa_id: empresaId },
    })

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente no encontrado en tu empresa' }, { status: 404 })
    }

    // Find property: must belong to this tenant OR be multiempresa
    const propiedad = await prisma.propiedad.findFirst({
      where: { 
        id: { startsWith: propiedad_id.toLowerCase() },
        OR: [
          { empresa_id: empresaId },
          { multiempresa: true }
        ]
      }
    })

    if (!propiedad) {
      return NextResponse.json({ error: 'Propiedad no encontrada o no accesible para tu empresa' }, { status: 404 })
    }

    // Find an active agent ONLY within this tenant
    const agentes = await prisma.agente.findMany({
      where: { empresa_id: empresaId, estado: 'Activo' },
      take: 1
    })
    const agente_id = agentes.length > 0 ? agentes[0].id : null

    // Update client status — scoped to tenant
    await prisma.cliente.updateMany({
      where: { id: cliente.id, empresa_id: empresaId },
      data: {
        estado: 'Inicio de Negociación',
        agente_asignado_id: agente_id,
      }
    })

    // Create the sale with empresa_id
    const venta = await prisma.venta.create({
      data: {
        empresa_id: empresaId,
        cliente_id: cliente.id,
        propiedad_id: propiedad.id,
        estado_venta: 'Contacto Inicial',
        agente_id: agente_id
      }
    })

    return NextResponse.json({ success: true, venta })
  } catch (error) {
    console.error('Error iniciando venta:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
