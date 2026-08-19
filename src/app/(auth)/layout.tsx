import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BoostWave CRM - Acceso',
  description: 'Inicia sesión en BoostWave CRM',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
