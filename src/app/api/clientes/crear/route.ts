import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getTenantId } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
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
        { success: false, error: 'No autorizado. Se requiere iniciar sesión.' },
        { status: 401, headers: corsHeaders }
      )
    }

    const empresaId = await getTenantId()
    if (!empresaId) {
      return NextResponse.json(
        { success: false, error: 'No hay una empresa activa en la sesión.' },
        { status: 400, headers: corsHeaders }
      )
    }

    const isCompanyAdmin = session.isGlobalAdmin || session.rol === 'Agente Owner' || session.rol === 'Agente Admin'

    // Accept JSON or FormData
    let nombre: string | null = null
    let rawTelefono: string | null = null
    let presupuesto_min: number | null = null
    let presupuesto_max: number | null = null
    let agente_asignado_id: string | null = null
    let etiquetasArray: string[] = []

    const contentType = request.headers.get('content-type') || ''
    
    if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData()
      nombre = (formData.get('nombre') as string)?.trim() || null
      rawTelefono = (formData.get('telefono') as string)?.trim() || null
      presupuesto_min = formData.get('presupuesto_min') ? Number(formData.get('presupuesto_min')) : null
      presupuesto_max = formData.get('presupuesto_max') ? Number(formData.get('presupuesto_max')) : null
      agente_asignado_id = (formData.get('agente_asignado_id') as string)?.trim() || null
      etiquetasArray = formData.getAll('etiquetas') as string[]
    } else {
      const body = await request.json()
      nombre = body.nombre ? String(body.nombre).trim() : null
      rawTelefono = body.telefono ? String(body.telefono).trim() : null
      presupuesto_min = body.presupuesto_min ? Number(body.presupuesto_min) : null
      presupuesto_max = body.presupuesto_max ? Number(body.presupuesto_max) : null
      agente_asignado_id = body.agente_asignado_id ? String(body.agente_asignado_id).trim() : null
      
      if (Array.isArray(body.etiquetas)) {
        etiquetasArray = body.etiquetas.map(String)
      } else if (typeof body.etiquetas === 'string') {
        etiquetasArray = [body.etiquetas]
      }
    }

    if (!isCompanyAdmin && session.agenteId) {
      agente_asignado_id = session.agenteId
    } else if (agente_asignado_id) {
      // Validate agent belongs to this tenant
      const agenteExiste = await prisma.agente.findFirst({
        where: { id: agente_asignado_id, empresa_id: empresaId }
      })
      if (!agenteExiste) {
        agente_asignado_id = null
      }
    }

    if (!rawTelefono) {
      return NextResponse.json(
        { success: false, error: 'El teléfono es requerido' },
        { status: 400, headers: corsHeaders }
      )
    }

    const normTel = normalizarTelefono(rawTelefono)

    // Check duplicate across DB (for Prisma @unique constraint safety)
    const todosClientes = await prisma.cliente.findMany({
      select: { id: true, nombre: true, telefono: true, empresa_id: true }
    })

    const duplicado = todosClientes.find(
      c => normalizarTelefono(c.telefono) === normTel || c.telefono === rawTelefono
    )

    if (duplicado) {
      return NextResponse.json({
        success: false,
        isDuplicate: true,
        clienteExistente: {
          id: duplicado.id,
          nombre: duplicado.nombre || 'Cliente sin nombre',
          telefono: duplicado.telefono
        }
      }, { headers: corsHeaders })
    }

    let etiquetas: string | null = null
    if (etiquetasArray && etiquetasArray.length > 0) {
      etiquetas = JSON.stringify(etiquetasArray)
    }

    const cliente = await prisma.cliente.create({
      data: {
        empresa_id: empresaId,
        nombre,
        telefono: rawTelefono,
        presupuesto_min,
        presupuesto_max,
        origen: 'Manual',
        etiquetas,
        estado: agente_asignado_id ? 'En Asignación' : 'Nuevo',
        agente_asignado_id,
      },
    })

    revalidatePath('/clientes')
    revalidatePath('/ventas')
    revalidatePath('/')
    if (agente_asignado_id) revalidatePath(`/agentes/${agente_asignado_id}`)

    return NextResponse.json({ success: true, clienteId: cliente.id, cliente }, { headers: corsHeaders })
  } catch (error: any) {
    console.error('Error en API crear cliente:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Error interno del servidor' },
      { status: 500, headers: corsHeaders }
    )
  }
}
