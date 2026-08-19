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
    const { telefono } = body

    if (!telefono) {
      return NextResponse.json({ error: 'El teléfono es requerido' }, { status: 400 })
    }

    // Search client ONLY within this tenant
    const cliente = await prisma.cliente.findFirst({
      where: { telefono, empresa_id: empresaId }
    })

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente no encontrado en tu empresa' }, { status: 404 })
    }

    let cEtiquetas: string[] = []
    if (cliente.etiquetas) {
      try {
        cEtiquetas = JSON.parse(cliente.etiquetas)
      } catch (e) {}
    }

    // Search properties: own tenant + multiempresa from other tenants
    const propiedades = await prisma.propiedad.findMany({
      where: {
        estado: 'Disponible',
        OR: [
          { empresa_id: empresaId },
          { multiempresa: true }
        ]
      }
    })

    // Match logic
    const matches = propiedades.filter(prop => {
      const propTipo = prop.tipo.toLowerCase()
      
      if (!cEtiquetas.includes(propTipo)) return false

      let pEtiquetas: string[] = []
      if (prop.caracteristicas_etiquetas) {
        try {
          pEtiquetas = JSON.parse(prop.caracteristicas_etiquetas)
        } catch (e) {}
      }

      if (prop.provincia && !pEtiquetas.includes(prop.provincia.toLowerCase())) {
        pEtiquetas.push(prop.provincia.toLowerCase())
      }
      if (prop.sector && !pEtiquetas.includes(prop.sector.toLowerCase())) {
        pEtiquetas.push(prop.sector.toLowerCase())
      }

      const sharedTags = pEtiquetas.filter(t => t.toLowerCase() !== propTipo && cEtiquetas.includes(t.toLowerCase()))
      
      let encajaEnPresupuesto = true
      if (cliente.presupuesto_max && prop.precio > cliente.presupuesto_max * 1.1) {
        encajaEnPresupuesto = false
      }

      return sharedTags.length >= 2 && encajaEnPresupuesto
    })

    const topMatches = matches.slice(0, 3).map(m => ({
      id: m.id,
      codigo: m.id.substring(0, 6).toUpperCase(),
      titulo: m.titulo,
      precio: m.precio,
      tipo: m.tipo,
      descripcion: m.descripcion
    }))

    return NextResponse.json({ 
      success: true, 
      count: topMatches.length,
      matches: topMatches 
    })

  } catch (error) {
    console.error('Error matching properties:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
