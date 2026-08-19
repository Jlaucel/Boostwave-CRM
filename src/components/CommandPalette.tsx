'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { 
  Users, Building, GitCommitHorizontal, Settings, 
  Search, Shield, FileText, UserCircle, Globe 
} from 'lucide-react'

export function CommandPalette({ 
  open, 
  setOpen 
}: { 
  open: boolean
  setOpen: (open: boolean) => void 
}) {
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [setOpen])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [setOpen])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" 
        onClick={() => setOpen(false)}
      />
      
      <Command 
        className="relative z-50 w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
        style={{
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)'
        }}
      >
        <div className="flex items-center border-b border-slate-200 px-3">
          <Search className="w-5 h-5 text-slate-400 mr-2" />
          <Command.Input 
            autoFocus
            placeholder="¿Qué necesitas hacer? (Buscar clientes, ir a ajustes...)" 
            className="flex-1 h-14 bg-transparent outline-none text-[15px] placeholder:text-slate-400"
          />
          <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 font-mono text-[10px] font-medium text-slate-500">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-[350px] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-slate-500">
            No se encontraron resultados.
          </Command.Empty>

          <Command.Group heading="Accesos Rápidos" className="text-xs font-semibold text-slate-500 px-2 py-1">
            <Command.Item 
              onSelect={() => runCommand(() => router.push('/clientes/nuevo'))}
              className="flex items-center gap-2 px-3 py-2.5 mt-1 rounded-lg cursor-pointer text-[14px] text-slate-700 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700 transition-colors"
            >
              <Users className="w-4 h-4 text-blue-500" />
              Crear nuevo cliente
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => router.push('/propiedades/nueva'))}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-[14px] text-slate-700 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700 transition-colors"
            >
              <Building className="w-4 h-4 text-emerald-500" />
              Registrar propiedad
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => router.push('/ventas/nueva'))}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-[14px] text-slate-700 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700 transition-colors"
            >
              <GitCommitHorizontal className="w-4 h-4 text-amber-500" />
              Iniciar oportunidad de venta
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Navegación" className="text-xs font-semibold text-slate-500 px-2 pt-3 pb-1 mt-1 border-t border-slate-100">
            <Command.Item 
              onSelect={() => runCommand(() => router.push('/pipeline'))}
              className="flex items-center gap-2 px-3 py-2.5 mt-1 rounded-lg cursor-pointer text-[14px] text-slate-700 data-[selected=true]:bg-slate-100 transition-colors"
            >
              <GitCommitHorizontal className="w-4 h-4 text-slate-400" />
              Ir al Pipeline
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => router.push('/configuraciones'))}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-[14px] text-slate-700 data-[selected=true]:bg-slate-100 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              Ir a Configuración de roles
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => router.push('/admin'))}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-[14px] text-slate-700 data-[selected=true]:bg-slate-100 transition-colors"
            >
              <Shield className="w-4 h-4 text-slate-400" />
              Panel Global
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  )
}
