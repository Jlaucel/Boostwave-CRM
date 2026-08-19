'use client'

import { useActionState, useState } from 'react'
import { Building, Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { registroAction } from '@/app/actions/auth'
import { Badge } from '@/components/Badge'

export default function RegistroPage() {
  const [state, formAction, isPending] = useActionState(registroAction, null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  if (state?.success) {
    return (
      <div className="w-full max-w-[420px] p-8 bg-white border border-gray-200 rounded-2xl shadow-[var(--shadow-card)] text-center">
        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">¡Registro Exitoso!</h2>
        <p className="text-[13px] text-gray-600 mb-6">{state.message}</p>
        <Link 
          href="/login"
          className="inline-flex w-full h-10 bg-[#1A85E5] hover:bg-blue-600 text-white font-bold text-[13px] rounded-lg transition-colors items-center justify-center"
        >
          Ir al Login
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[420px] p-8 bg-white border border-gray-200 rounded-2xl shadow-[var(--shadow-card)]">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#42A5F5] to-[#1565C0] flex items-center justify-center text-white shadow-sm">
            <Building className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-gray-900 tracking-tight">BoostWave</span>
          <Badge variant="info">CRM</Badge>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Crear Cuenta</h1>
        <p className="text-[13px] text-gray-500 mt-1">Únete a BoostWave CRM</p>
      </div>

      {state?.error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[13px] font-medium">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
            Nombre Completo
          </label>
          <input
            type="text"
            name="nombre"
            required
            className="w-full h-10 px-3 border border-gray-300 rounded-md text-[13px] focus:outline-none focus:border-[#1A85E5] focus:ring-2 focus:ring-[#1A85E5]/15 transition-shadow"
            placeholder="Juan Pérez"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
            Correo Electrónico
          </label>
          <input
            type="email"
            name="email"
            required
            className="w-full h-10 px-3 border border-gray-300 rounded-md text-[13px] focus:outline-none focus:border-[#1A85E5] focus:ring-2 focus:ring-[#1A85E5]/15 transition-shadow"
            placeholder="ejemplo@agencia.com"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              className="w-full h-10 pl-3 pr-10 border border-gray-300 rounded-md text-[13px] focus:outline-none focus:border-[#1A85E5] focus:ring-2 focus:ring-[#1A85E5]/15 transition-shadow"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
            Confirmar Contraseña
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmar_password"
              required
              className="w-full h-10 pl-3 pr-10 border border-gray-300 rounded-md text-[13px] focus:outline-none focus:border-[#1A85E5] focus:ring-2 focus:ring-[#1A85E5]/15 transition-shadow"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-10 bg-[#1A85E5] hover:bg-blue-600 text-white font-bold text-[13px] rounded-lg transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-6"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Registrarse'
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-[13px] text-gray-500">
        ¿Ya tienes una cuenta?{' '}
        <Link href="/login" className="text-[#1A85E5] font-semibold hover:underline">
          Inicia sesión
        </Link>
      </div>
    </div>
  )
}
