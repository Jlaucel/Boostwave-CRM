import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Building } from 'lucide-react'
import { Badge } from '@/components/Badge'
import SelectorClient from './SelectorClient'

export default async function SeleccionarEmpresaPage() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  // Get user's active companies
  const usuarioEmpresas = await prisma.usuarioEmpresa.findMany({
    where: { 
      usuario_id: session.userId,
      empresa: { activa: true }
    },
    include: { empresa: true }
  })

  if (usuarioEmpresas.length === 0) {
    redirect('/login')
  }

  if (usuarioEmpresas.length === 1) {
    // Should be handled in login action, but fallback here
    const ue = usuarioEmpresas[0]
    const { createSession } = await import('@/lib/auth')
    await createSession(session.userId, ue.empresa_id, ue.rol)
    redirect('/')
  }

  // Transform data for client component
  const empresas = usuarioEmpresas.map(ue => ({
    id: ue.empresa.id,
    nombre: ue.empresa.nombre_comercial,
    rnc: ue.empresa.rnc,
    direccion: ue.empresa.direccion,
    rol: ue.rol
  }))

  return (
    <div className="w-full max-w-[600px] p-8 bg-white border border-gray-200 rounded-2xl shadow-[var(--shadow-card)]">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#42A5F5] to-[#1565C0] flex items-center justify-center text-white shadow-sm">
            <Building className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-gray-900 tracking-tight">BoostWave</span>
          <Badge variant="info">CRM</Badge>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Selecciona una Empresa</h1>
        <p className="text-[13px] text-gray-500 mt-1">Elige la empresa a la que deseas acceder</p>
      </div>

      <SelectorClient empresas={empresas} />
    </div>
  )
}
