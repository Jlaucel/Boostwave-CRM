'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Types
export interface SessionData {
  userId: string
  email: string
  nombre: string | null
  isGlobalAdmin: boolean
  empresaId: string | null
  empresaNombre: string | null
  rol: string | null  // 'Agente Owner' | 'Agente Admin' | 'Agente Normal' | null
  agenteId: string | null  // linked Agente profile id
}

const SESSION_COOKIE = 'bw_session'
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours

// Password hashing
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

// Password validation rules: min 8 chars, 1 uppercase, 1 lowercase, 1 number
export async function validatePasswordRules(password: string): Promise<{ valid: boolean; error?: string }> {
  if (password.length < 8) return { valid: false, error: 'La contraseña debe tener al menos 8 caracteres' }
  if (!/[A-Z]/.test(password)) return { valid: false, error: 'Debe contener al menos 1 letra mayúscula' }
  if (!/[a-z]/.test(password)) return { valid: false, error: 'Debe contener al menos 1 letra minúscula' }
  if (!/[0-9]/.test(password)) return { valid: false, error: 'Debe contener al menos 1 número' }
  return { valid: true }
}

// Session management
export async function createSession(userId: string, empresaId?: string | null, rol?: string | null): Promise<string> {
  const token = crypto.randomUUID()
  const expires_at = new Date(Date.now() + SESSION_DURATION_MS)
  
  // Clean up any expired sessions for this user
  await prisma.sesion.deleteMany({
    where: { usuario_id: userId, expires_at: { lt: new Date() } }
  })
  
  await prisma.sesion.create({
    data: {
      token,
      usuario_id: userId,
      empresa_id: empresaId || null,
      rol: rol || null,
      expires_at
    }
  })
  
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expires_at
  })
  
  return token
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  
  const sesion = await prisma.sesion.findUnique({
    where: { token },
    include: {
      usuario: {
        include: {
          empresas: {
            include: { empresa: true, agente: true }
          }
        }
      }
    }
  })
  
  if (!sesion || sesion.expires_at < new Date()) {
    if (sesion) await prisma.sesion.delete({ where: { id: sesion.id } })
    return null
  }
  
  if (!sesion.usuario.activo) return null
  
  // Find the active empresa link
  const empresaLink = sesion.empresa_id 
    ? sesion.usuario.empresas.find(ue => ue.empresa_id === sesion.empresa_id)
    : null
  
  // If empresa is deactivated, session is invalid for that empresa
  if (empresaLink && !empresaLink.empresa.activa) return null
  
  return {
    userId: sesion.usuario.id,
    email: sesion.usuario.email,
    nombre: sesion.usuario.nombre,
    isGlobalAdmin: sesion.usuario.is_global_admin,
    empresaId: sesion.empresa_id,
    empresaNombre: empresaLink?.empresa.nombre_comercial || null,
    rol: sesion.rol || empresaLink?.rol || null,
    agenteId: empresaLink?.agente_id || null
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (token) {
    await prisma.sesion.deleteMany({ where: { token } })
    cookieStore.delete(SESSION_COOKIE)
  }
}

// Auth guards - use in server components / server actions
export async function requireAuth(): Promise<SessionData> {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
}

export async function requireRole(allowedRoles: string[]): Promise<SessionData> {
  const session = await requireAuth()
  if (session.isGlobalAdmin) return session  // Global admin bypasses role checks
  if (!session.rol || !allowedRoles.includes(session.rol)) redirect('/')
  return session
}

export async function requireGlobalAdmin(): Promise<SessionData> {
  const session = await requireAuth()
  if (!session.isGlobalAdmin) redirect('/')
  return session
}
