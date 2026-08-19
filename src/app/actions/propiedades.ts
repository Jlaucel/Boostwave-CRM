'use server'

import { requireAuth } from '@/lib/auth'
import { getTenantId, tenantWhere } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export async function editarPropiedad(id: string, formData: FormData) {
  const empresaId = await getTenantId()
  try {
    const titulo = formData.get('titulo') as string
    const descripcion = formData.get('descripcion') as string
    const precio = parseFloat(formData.get('precio') as string)
    const tipo = formData.get('tipo') as string
    const provincia = formData.get('provincia') as string
    const sector = formData.get('sector') as string
    const estado = formData.get('estado') as string
    
    const tamano_str = formData.get('tamano_m2')
    const tamano_m2 = tamano_str ? parseFloat(tamano_str as string) : null
    const pisos_str = formData.get('numero_pisos')
    const numero_pisos = pisos_str ? parseInt(pisos_str as string, 10) : null
    const cocinas_str = formData.get('numero_cocinas')
    const numero_cocinas = cocinas_str ? parseInt(cocinas_str as string, 10) : null
    
    const estado_legal = formData.get('estado_legal') as string
    const agente_asignado_id = formData.get('agente_asignado_id') as string | null
    
    const hab = formData.get('hab') as string
    const banos = formData.get('banos') as string
    const parqueos = formData.get('parqueos') as string
    const multiempresa = formData.get('multiempresa') === 'on' || formData.get('multiempresa') === 'true'
    const comision_multiempresa_str = formData.get('comision_multiempresa') as string
    const comision_multiempresa = comision_multiempresa_str ? parseFloat(comision_multiempresa_str) : null
    
    // Arrays para etiquetas - filtrar tags hab/baños/parqueos antiguos para sobreescribir limpiamente
    let etiquetas = formData.getAll('etiquetas') as string[]
    etiquetas = etiquetas.filter(e => !/^\d+(\.\d+)?\s*(hab|habitacion|baño|bano|parqueo)/i.test(e) && !/^\d+\+?\s*habitacion/i.test(e))

    if (hab) {
      const habNum = parseInt(hab, 10)
      etiquetas.push(`${habNum} hab`)
      if (habNum === 1) etiquetas.push('1 habitación')
      else if (habNum === 2) etiquetas.push('2 habitaciones')
      else if (habNum === 3) etiquetas.push('3 habitaciones')
      else if (habNum >= 4) etiquetas.push('4+ habitaciones')
    }
    if (banos) {
      etiquetas.push(`${banos} baños`)
    }
    if (parqueos) {
      etiquetas.push(`${parqueos} parqueos`)
    }
    
    // Procesar imágenes actuales (las que se mantienen)
    const imagenesActuales = formData.getAll('imagenes_actuales') as string[]
    
    // Procesar archivos subidos
    const archivos = formData.getAll('nuevas_imagenes') as File[]
    
    const session = await requireAuth()

    // Buscar propiedad actual para comparar y generar historial — scoped to tenant
    const propiedadActual = await prisma.propiedad.findFirst({
      where: { id, empresa_id: empresaId }
    })

    if (!propiedadActual) {
      return { success: false, error: 'Propiedad no encontrada en tu empresa' }
    }

    if (!session.isGlobalAdmin && (session.rol !== 'Agente Owner' && session.rol !== 'Agente Admin')) {
      return { success: false, error: 'Solo los administradores u owners de la empresa creadora pueden editar esta propiedad.' }
    }

    // Directorio de subida
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'propiedades', id)
    
    // Crear directorio si no existe y si hay archivos nuevos
    const archivosValidos = archivos.filter(f => f.size > 0 && f.name)
    if (archivosValidos.length > 0) {
      await fs.mkdir(uploadDir, { recursive: true })
    }

    const imagenesNuevasUrls: string[] = []

    for (const file of archivosValidos) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const ext = path.extname(file.name) || '.jpg'
      const filename = `${crypto.randomUUID()}${ext}`
      const filepath = path.join(uploadDir, filename)
      
      await fs.writeFile(filepath, buffer)
      
      // Guardar URL relativa para ser servida por Next.js public directory
      imagenesNuevasUrls.push(`/uploads/propiedades/${id}/${filename}`)
    }

    // Array final de imágenes
    const todasLasImagenes = [...imagenesActuales, ...imagenesNuevasUrls]

    // Iniciar transacción para actualizar y registrar historial
    await prisma.$transaction(async (tx) => {
      // 1. Actualizar propiedad
      await tx.propiedad.updateMany({
        where: { id, empresa_id: empresaId },
        data: {
          titulo,
          descripcion,
          precio,
          tipo,
          provincia,
          sector,
          estado,
          tamano_m2,
          numero_pisos,
          numero_cocinas,
          estado_legal,
          agente_asignado_id: agente_asignado_id || null,
          caracteristicas_etiquetas: JSON.stringify(etiquetas),
          multiempresa,
          comision_multiempresa,
          imagenes: todasLasImagenes.length > 0 ? JSON.stringify(todasLasImagenes) : null
        }
      })

      // 2. Registrar historial si hubo cambios clave
      if (propiedadActual.precio !== precio) {
        await tx.historialPropiedad.create({
          data: {
            propiedad_id: id,
            campo_modificado: 'precio',
            valor_anterior: propiedadActual.precio.toString(),
            valor_nuevo: precio.toString()
          }
        })
      }

      if (propiedadActual.estado !== estado) {
        await tx.historialPropiedad.create({
          data: {
            propiedad_id: id,
            campo_modificado: 'estado',
            valor_anterior: propiedadActual.estado,
            valor_nuevo: estado
          }
        })
      }

      if (propiedadActual.estado_legal !== estado_legal && (propiedadActual.estado_legal || estado_legal)) {
        await tx.historialPropiedad.create({
          data: {
            propiedad_id: id,
            campo_modificado: 'estado_legal',
            valor_anterior: propiedadActual.estado_legal || 'No especificado',
            valor_nuevo: estado_legal
          }
        })
      }

      if (propiedadActual.agente_asignado_id !== agente_asignado_id) {
        // Fetch agent names for history if needed, or just store IDs/messages
        // For simplicity, we just store that it changed
        const agenteAnterior = propiedadActual.agente_asignado_id ? await tx.agente.findFirst({ where: { id: propiedadActual.agente_asignado_id, empresa_id: empresaId } }) : null
        const agenteNuevo = agente_asignado_id ? await tx.agente.findFirst({ where: { id: agente_asignado_id, empresa_id: empresaId } }) : null
        
        await tx.historialPropiedad.create({
          data: {
            propiedad_id: id,
            campo_modificado: 'agente_asignado',
            valor_anterior: agenteAnterior?.nombre || 'Ninguno',
            valor_nuevo: agenteNuevo?.nombre || 'Ninguno'
          }
        })
      }
    })

    // Procesar imágenes eliminadas para borrarlas del disco
    const imagenesEliminar = formData.getAll('imagenes_eliminar') as string[]
    for (const url of imagenesEliminar) {
      if (url.startsWith('/uploads/')) {
        try {
          const absolutePath = path.join(process.cwd(), 'public', url)
          await fs.unlink(absolutePath)
        } catch (e) {
          console.error('Error eliminando archivo:', url, e)
        }
      }
    }

    revalidatePath('/propiedades')
    revalidatePath(`/propiedades/${id}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error actualizando propiedad:', error)
    return { success: false, error: 'Error interno del servidor' }
  }
}

export async function crearPropiedad(formData: FormData) {
  const empresaId = await getTenantId()
  try {
    const titulo = formData.get('titulo') as string
    const descripcion = formData.get('descripcion') as string
    const precio = parseFloat(formData.get('precio') as string)
    const tipo = formData.get('tipo') as string
    const provincia = formData.get('provincia') as string || 'Distrito Nacional'
    const sector = formData.get('sector') as string || 'Centro'
    const estado = (formData.get('estado') as string) || 'Disponible'
    
    const tamano_str = formData.get('tamano_m2')
    const tamano_m2 = tamano_str ? parseFloat(tamano_str as string) : null
    const pisos_str = formData.get('numero_pisos')
    const numero_pisos = pisos_str ? parseInt(pisos_str as string, 10) : null
    const cocinas_str = formData.get('numero_cocinas')
    const numero_cocinas = cocinas_str ? parseInt(cocinas_str as string, 10) : null
    
    const estado_legal = (formData.get('estado_legal') as string) || 'Al día'
    let agente_asignado_id = (formData.get('agente_asignado_id') as string) || null

    if (!agente_asignado_id) {
      const session = await requireAuth()
      if (session && session.agenteId) {
        agente_asignado_id = session.agenteId
      }
    }

    const hab = formData.get('hab') as string
    const banos = formData.get('banos') as string
    const parqueos = formData.get('parqueos') as string
    const multiempresa = formData.get('multiempresa') === 'on' || formData.get('multiempresa') === 'true'
    const comision_multiempresa_str = formData.get('comision_multiempresa') as string
    const comision_multiempresa = comision_multiempresa_str ? parseFloat(comision_multiempresa_str) : null
    
    let etiquetas = formData.getAll('etiquetas') as string[]
    if (hab) {
      const habNum = parseInt(hab, 10)
      if (!etiquetas.some(e => e.includes('hab'))) etiquetas.push(`${habNum} hab`)
      if (habNum === 1) etiquetas.push('1 habitación')
      else if (habNum === 2) etiquetas.push('2 habitaciones')
      else if (habNum === 3) etiquetas.push('3 habitaciones')
      else if (habNum >= 4) etiquetas.push('4+ habitaciones')
    }
    if (banos && !etiquetas.some(e => e.includes('baño'))) {
      etiquetas.push(`${banos} baños`)
    }
    if (parqueos && !etiquetas.some(e => e.includes('parqueo'))) {
      etiquetas.push(`${parqueos} parqueos`)
    }

    if (!titulo || !precio || !tipo) {
      return { success: false, error: 'Título, precio y tipo son requeridos' }
    }

    const propiedad = await prisma.propiedad.create({
      data: {
        titulo,
        descripcion: descripcion || '',
        precio,
        tipo,
        provincia,
        sector,
        estado,
        tamano_m2,
        numero_pisos,
        numero_cocinas,
        estado_legal,
        agente_asignado_id: agente_asignado_id || null,
        caracteristicas_etiquetas: JSON.stringify(etiquetas),
        multiempresa,
        comision_multiempresa,
        empresa_id: empresaId,
      }
    })

    // Subir imágenes si se adjuntaron
    const archivos = formData.getAll('nuevas_imagenes') as File[]
    const archivosValidos = archivos.filter(f => f.size > 0 && f.name)
    
    if (archivosValidos.length > 0) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'propiedades', propiedad.id)
      await fs.mkdir(uploadDir, { recursive: true })
      
      const imagenesUrls: string[] = []
      for (const file of archivosValidos) {
        const buffer = Buffer.from(await file.arrayBuffer())
        const ext = path.extname(file.name) || '.jpg'
        const filename = `${crypto.randomUUID()}${ext}`
        const filepath = path.join(uploadDir, filename)
        await fs.writeFile(filepath, buffer)
        imagenesUrls.push(`/uploads/propiedades/${propiedad.id}/${filename}`)
      }

      await prisma.propiedad.update({
        where: { id: propiedad.id },
        data: { imagenes: JSON.stringify(imagenesUrls) }
      })
    }

    await prisma.historialPropiedad.create({
      data: {
        propiedad_id: propiedad.id,
        campo_modificado: 'creacion',
        valor_anterior: null,
        valor_nuevo: 'Propiedad creada en el sistema'
      }
    })

    revalidatePath('/propiedades')
    return { success: true, id: propiedad.id }
  } catch (error) {
    console.error('Error creando propiedad:', error)
    return { success: false, error: 'Error interno al crear propiedad' }
  }
}

export async function marcarPropiedadVendida(id: string) {
  const session = await requireAuth()
  const empresaId = await getTenantId()

  try {
    const propiedad = await prisma.propiedad.findFirst({
      where: { id, empresa_id: empresaId }
    })

    if (!propiedad) return { success: false, error: 'Propiedad no encontrada' }

    if (!session.isGlobalAdmin && (session.rol !== 'Agente Owner' && session.rol !== 'Agente Admin')) {
      return { success: false, error: 'No tienes permisos para marcar como vendida esta propiedad' }
    }

    await prisma.$transaction(async (tx) => {
      await tx.propiedad.update({
        where: { id },
        data: { estado: 'Vendida' }
      })

      await tx.historialPropiedad.create({
        data: {
          propiedad_id: id,
          campo_modificado: 'estado',
          valor_anterior: propiedad.estado,
          valor_nuevo: 'Vendida'
        }
      })
    })

    revalidatePath('/propiedades')
    revalidatePath(`/propiedades/${id}`)

    return { success: true }
  } catch (error) {
    console.error('Error marcando propiedad como vendida:', error)
    return { success: false, error: 'Error interno del servidor' }
  }
}

