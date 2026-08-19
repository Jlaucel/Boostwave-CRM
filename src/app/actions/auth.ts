'use server'

import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword, createSession, destroySession, validatePasswordRules } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function loginAction(prevState: any, formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email y contraseña son requeridos' }
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email },
    include: { empresas: { include: { empresa: true } } }
  })

  if (!usuario || !(await verifyPassword(password, usuario.password_hash))) {
    return { error: 'Credenciales incorrectas' }
  }

  if (!usuario.activo) {
    return { error: 'Tu cuenta ha sido desactivada. Contacta al administrador.' }
  }

  const empresasActivas = usuario.empresas.filter(ue => ue.empresa.activa)

  if (usuario.is_global_admin) {
    await createSession(usuario.id)
    redirect('/admin')
  }

  if (empresasActivas.length === 0) {
    return { error: 'Tu cuenta aún no ha sido vinculada a ninguna agencia. Contacta al administrador.' }
  }

  if (empresasActivas.length === 1) {
    const ue = empresasActivas[0]
    await createSession(usuario.id, ue.empresa_id, ue.rol)
    redirect('/')
  }

  // Multiple empresas - go to selector
  await createSession(usuario.id)
  redirect('/seleccionar-empresa')
}

export async function registroAction(prevState: any, formData: FormData) {
  const nombre = (formData.get('nombre') as string)?.trim()
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string
  const confirmar = formData.get('confirmar_password') as string

  if (!nombre || !email || !password || !confirmar) {
    return { error: 'Todos los campos son requeridos' }
  }

  if (password !== confirmar) {
    return { error: 'Las contraseñas no coinciden' }
  }

  const validacion = await validatePasswordRules(password)
  if (!validacion.valid) {
    return { error: validacion.error }
  }

  const existe = await prisma.usuario.findUnique({ where: { email } })
  if (existe) {
    return { error: 'Ya existe una cuenta registrada con este correo electrónico. Por favor inicia sesión o utiliza otro correo.' }
  }

  const password_hash = await hashPassword(password)
  await prisma.usuario.create({
    data: { email, password_hash, nombre }
  })

  return { success: true, message: '¡Cuenta creada exitosamente! Un administrador vinculará tu cuenta a una empresa.' }
}

export async function seleccionarEmpresaAction(empresaId: string) {
  // This needs to get current session, find the UsuarioEmpresa link, and update session
  const { getSession } = await import('@/lib/auth')
  const session = await getSession()
  if (!session) redirect('/login')

  const ue = await prisma.usuarioEmpresa.findFirst({
    where: { usuario_id: session.userId, empresa_id: empresaId },
    include: { empresa: true }
  })

  if (!ue || !ue.empresa.activa) {
    redirect('/login')
  }

  // Delete old session and create new one with empresa context
  await destroySession()
  await createSession(session.userId, ue.empresa_id, ue.rol)
  redirect('/')
}

export async function logoutAction() {
  await destroySession()
  redirect('/login')
}

export async function checkSessionAlive() {
  const { getSession } = await import('@/lib/auth')
  const session = await getSession()
  return !!session
}
