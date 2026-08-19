'use client'

import { useActionState, useState } from 'react'
import { Building, Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { loginAction } from '@/app/actions/auth'
import { Badge } from '@/components/Badge'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null)
  const [showPassword, setShowPassword] = useState(false)

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
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Iniciar Sesión</h1>
        <p className="text-[13px] text-gray-500 mt-1">Ingresa a tu cuenta de BoostWave CRM</p>
      </div>

      {state?.error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[13px] font-medium">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
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
            autoComplete="email"
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
              autoComplete="current-password"
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

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-10 bg-[#1A85E5] hover:bg-blue-600 text-white font-bold text-[13px] rounded-lg transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-6"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Ingresar'
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-[13px] text-gray-500">
        ¿No tienes una cuenta?{' '}
        <Link href="/registro" className="text-[#1A85E5] font-semibold hover:underline">
          Regístrate aquí
        </Link>
      </div>
    </div>
  )
}
