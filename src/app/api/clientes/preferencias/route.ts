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
    const { telefono, etiquetas, presupuesto_min, presupuesto_max } = body

    if (!telefono) {
      return NextResponse.json({ error: 'El teléfono es requerido' }, { status: 400, headers: corsHeaders })
    }

    const normTel = normalizarTelefono(String(telefono))

    // Search only within the current tenant's clients
    const clientesEmpresa = await prisma.cliente.findMany({
      where: { empresa_id: empresaId }
    })
    const cliente = clientesEmpresa.find(c => normalizarTelefono(c.telefono) === normTel || c.telefono === String(telefono).trim())

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente no encontrado en tu empresa' }, { status: 404, headers: corsHeaders })
    }

    // Update preferences scoped to tenant
    const updatedCliente = await prisma.cliente.updateMany({
      where: { id: cliente.id, empresa_id: empresaId },
      data: {
        etiquetas: etiquetas ? JSON.stringify(etiquetas) : cliente.etiquetas,
        presupuesto_min: presupuesto_min !== undefined ? presupuesto_min : cliente.presupuesto_min,
        presupuesto_max: presupuesto_max !== undefined ? presupuesto_max : cliente.presupuesto_max,
      },
    })

    return NextResponse.json({ success: true, updated: updatedCliente.count }, { headers: corsHeaders })
  } catch (error: any) {
    console.error('Error updating preferencias:', error)
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500, headers: corsHeaders })
  }
}
