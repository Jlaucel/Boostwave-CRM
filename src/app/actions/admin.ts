'use server'

import { prisma } from '@/lib/prisma'
import { requireGlobalAdmin, hashPassword } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createEmpresa(formData: FormData) {
  await requireGlobalAdmin()
  
  const nombre_comercial = formData.get('nombre_comercial') as string
  const rnc = formData.get('rnc') as string || null
  const telefono_contacto = formData.get('telefono_contacto') as string || null
  const direccion = formData.get('direccion') as string || null

  if (!nombre_comercial) throw new Error('Nombre comercial es requerido')

  const empresa = await prisma.empresa.create({
    data: { nombre_comercial, rnc, telefono_contacto, direccion }
  })

  // Create default ConfiguracionSistema for this empresa
  await prisma.configuracionSistema.create({
    data: {
      id: empresa.id,
      empresa_id: empresa.id,
      nombre_empresa: nombre_comercial,
    }
  })

  // Log audit
  await prisma.auditLog.create({
    data: {
      accion: 'CREAR_EMPRESA',
      descripcion: `Empresa "${nombre_comercial}" creada`,
      empresa_id: empresa.id,
    }
  })

  revalidatePath('/admin/empresas')
  redirect('/admin/empresas')
}

export async function toggleEmpresa(empresaId: string) {
  await requireGlobalAdmin()
  
  const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } })
  if (!empresa) throw new Error('Empresa no encontrada')

  await prisma.empresa.update({
    where: { id: empresaId },
    data: { activa: !empresa.activa }
  })

  await prisma.auditLog.create({
    data: {
      accion: empresa.activa ? 'DESACTIVAR_EMPRESA' : 'ACTIVAR_EMPRESA',
      descripcion: `Empresa "${empresa.nombre_comercial}" ${empresa.activa ? 'desactivada' : 'activada'}`,
      empresa_id: empresaId,
    }
  })

  revalidatePath('/admin/empresas')
  revalidatePath(`/admin/empresas/${empresaId}`)
}

export async function vincularUsuarioEmpresa(formData: FormData) {
  await requireGlobalAdmin()
  
  const usuario_id = formData.get('usuario_id') as string
  const empresa_id = formData.get('empresa_id') as string
  const rol = formData.get('rol') as string || 'Agente Normal'

  if (!usuario_id || !empresa_id) throw new Error('Usuario y Empresa son requeridos')

  // Check if already linked
  const existing = await prisma.usuarioEmpresa.findUnique({
    where: { usuario_id_empresa_id: { usuario_id, empresa_id } }
  })
  if (existing) throw new Error('El usuario ya está vinculado a esta empresa')

  // Create the link
  const usuario = await prisma.usuario.findUnique({ where: { id: usuario_id } })
  if (!usuario) throw new Error('Usuario no encontrado')

  let agente = await prisma.agente.findFirst({
    where: { email: usuario.email, empresa_id }
  })

  if (!agente) {
    agente = await prisma.agente.create({
      data: {
        nombre: usuario.nombre || usuario.email.split('@')[0],
        email: usuario.email,
        telefono: 'N/A',
        rol: rol,
        estado: usuario.activo ? 'Activo' : 'Inactivo',
        empresa_id: empresa_id,
        meta_ventas: 1000000,
        comision_porcentaje: 3,
      }
    })
  }

  await prisma.usuarioEmpresa.create({
    data: { usuario_id, empresa_id, rol, agente_id: agente.id }
  })

  const empresa = await prisma.empresa.findUnique({ where: { id: empresa_id } })

  await prisma.auditLog.create({
    data: {
      accion: 'VINCULAR_USUARIO',
      descripcion: `Usuario "${usuario?.email}" vinculado a "${empresa?.nombre_comercial}" con rol ${rol}`,
      usuario_id,
      empresa_id,
    }
  })

  revalidatePath('/admin/usuarios')
  redirect('/admin/usuarios')
}

export async function resetPassword(formData: FormData) {
  await requireGlobalAdmin()
  
  const usuario_id = formData.get('usuario_id') as string
  const new_password = formData.get('new_password') as string

  if (!usuario_id || !new_password) throw new Error('Usuario y nueva contraseña son requeridos')

  const password_hash = await hashPassword(new_password)
  await prisma.usuario.update({
    where: { id: usuario_id },
    data: { password_hash }
  })

  // Delete all sessions for this user to force re-login
  await prisma.sesion.deleteMany({ where: { usuario_id } })

  const usuario = await prisma.usuario.findUnique({ where: { id: usuario_id } })
  await prisma.auditLog.create({
    data: {
      accion: 'RESET_PASSWORD',
      descripcion: `Contraseña reseteada para usuario "${usuario?.email}"`,
      usuario_id,
    }
  })

  revalidatePath('/admin/usuarios')
}

export async function toggleUsuario(usuarioId: string) {
  await requireGlobalAdmin()
  
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } })
  if (!usuario) throw new Error('Usuario no encontrado')
  if (usuario.is_global_admin) throw new Error('No se puede desactivar al Admin Global')

  await prisma.usuario.update({
    where: { id: usuarioId },
    data: { activo: !usuario.activo }
  })

  if (usuario.activo) {
    // If deactivating, kill all sessions
    await prisma.sesion.deleteMany({ where: { usuario_id: usuarioId } })
  }

  await prisma.auditLog.create({
    data: {
      accion: usuario.activo ? 'DESACTIVAR_USUARIO' : 'ACTIVAR_USUARIO',
      descripcion: `Usuario "${usuario.email}" ${usuario.activo ? 'desactivado' : 'activado'}`,
      usuario_id: usuarioId,
    }
  })

  revalidatePath('/admin/usuarios')
}
