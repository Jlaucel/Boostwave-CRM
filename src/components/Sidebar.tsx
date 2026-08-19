'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Users, Building, GitCommitHorizontal, 
  UserCircle, Search, Bell, BarChart3, FileText, Settings,
  Shield, LogOut, ChevronDown, Globe, Zap, HelpCircle, Menu, X, Calendar
} from 'lucide-react'
import { clsx } from 'clsx'
import { logoutAction } from '@/app/actions/auth'
import type { SessionData } from '@/lib/auth'
import { useState, useEffect } from 'react'
import { CommandPalette } from '@/components/CommandPalette'

// Navigation items organized by section
const navSections = [
  {
    label: null, // No section header for primary
    items: [
      { key: 'dashboard', name: 'Dashboard', href: '/', icon: LayoutDashboard },
    ]
  },
  {
    label: 'Gestión',
    items: [
      { key: 'clientes', name: 'Clientes', href: '/clientes', icon: Users },
      { key: 'propiedades', name: 'Propiedades', href: '/propiedades', icon: Building },
      { key: 'pipeline', name: 'Pipeline', href: '/ventas', icon: GitCommitHorizontal },
      { key: 'calendario', name: 'Calendario', href: '/calendario', icon: Calendar },
    ]
  },
  {
    label: 'Equipo',
    items: [
      { key: 'agentes', name: 'Agentes', href: '/agentes', icon: UserCircle },
      { key: 'multiempresa', name: 'Red Multiempresa', href: '/multiempresa', icon: Globe },
    ]
  },
  {
    label: 'Herramientas',
    items: [
      { key: 'analiticas', name: 'Analíticas', href: '/analiticas', icon: BarChart3 },
      { key: 'documentos', name: 'Documentos', href: '/documentos', icon: FileText },
    ]
  }
]

// Admin-only items
const adminItems = [
  { key: 'admin', name: 'Panel Global', href: '/admin', icon: Shield },
]

const configItem = { key: 'configuracion', name: 'Configuración', href: '/configuraciones', icon: Settings }

function getVisibleSections(session: SessionData | null) {
  const sections = navSections.map(section => ({
    ...section,
    items: [...section.items]
  }))

  if (session?.isGlobalAdmin) {
    // Prepend admin item
    sections[0].items.unshift(...adminItems)
  }

  if (!session) {
    // Remove admin-only items
    return sections.map(s => ({
      ...s,
      items: s.items.filter(i => i.key !== 'admin')
    }))
  }

  const rol = session.rol
  if (rol === 'Agente Normal') {
    return sections.map(s => ({
      ...s,
      items: s.items.filter(i => i.key !== 'admin')
    }))
  }

  return sections
}

function getUserInitials(session: SessionData | null): string {
  if (!session) return '??'
  if (session.nombre) {
    const parts = session.nombre.split(' ')
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  return session.email.slice(0, 2).toUpperCase()
}

function getUserDisplayName(session: SessionData | null): string {
  if (!session) return 'Invitado'
  return session.nombre || session.email.split('@')[0]
}

function getRolBadge(session: SessionData | null): string {
  if (!session) return ''
  if (session.isGlobalAdmin) return 'Admin Global'
  return session.rol || ''
}

export function TopBar({ session, onToggleMobile }: { session: SessionData | null, onToggleMobile?: () => void }) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const initials = getUserInitials(session)
  const displayName = getUserDisplayName(session)
  const rolBadge = getRolBadge(session)

  return (
    <header 
      className="fixed top-0 right-0 h-[56px] flex items-center justify-between px-4 lg:px-6 z-50 left-0 lg:left-[var(--sidenav-width)]"
      style={{ 
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-default)',
        boxShadow: '0 1px 3px rgba(15,23,42,0.04)'
      }}
    >
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button 
          onClick={onToggleMobile}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
        >
          <Menu className="w-5 h-5 text-[var(--text-secondary)]" />
        </button>
        {session?.empresaNombre && (
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span className="text-[13px] font-semibold text-[var(--text-secondary)] hidden sm:inline">
              {session.empresaNombre}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 max-w-lg mx-4 lg:mx-8 hidden sm:block">
        <div className="relative cursor-text" onClick={() => setIsCommandOpen(true)}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <div 
            className="w-full flex items-center h-9 pl-9 pr-4 text-[13px] bg-[var(--bg-surface-secondary)] border border-[var(--border-default)] rounded-lg hover:border-[var(--border-brand)] transition-all text-[var(--text-tertiary)]"
          >
            Buscar clientes, propiedades...
          </div>
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-tertiary)] font-medium bg-white border border-[var(--border-default)] rounded px-1.5 py-0.5 hidden lg:inline-block">⌘K</kbd>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Mobile search button */}
        <button 
          onClick={() => setIsCommandOpen(true)}
          className="sm:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
        >
          <Search className="w-[18px] h-[18px] text-[var(--text-tertiary)]" />
        </button>
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
          <Bell className="w-[18px] h-[18px] text-[var(--text-tertiary)]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-white"></span>
        </button>
        <button className="w-9 h-9 hidden md:flex items-center justify-center rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
          <HelpCircle className="w-[18px] h-[18px] text-[var(--text-tertiary)]" />
        </button>
        <div className="w-px h-6 bg-[var(--border-default)] mx-1 hidden md:block"></div>
        
        {/* User menu */}
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 h-9 pl-1 pr-2.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
          >
            <div 
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-sm"
              style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' }}
            >
              {initials}
            </div>
            <span className="text-[13px] font-medium text-[var(--text-secondary)] hidden md:inline">{displayName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-tertiary)] hidden md:block" />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div 
                className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-[var(--border-default)] rounded-xl z-50 overflow-hidden"
                style={{ boxShadow: 'var(--shadow-xl)' }}
              >
                <div className="p-4 border-b border-[var(--border-default)]" style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)' }}>
                  <div className="text-[13px] font-bold text-[var(--text-primary)]">{displayName}</div>
                  <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{session?.email}</div>
                  {rolBadge && (
                    <div className="mt-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {rolBadge}
                      </span>
                    </div>
                  )}
                </div>
                
                {session?.isGlobalAdmin && session.empresaNombre && (
                  <Link
                    href="/seleccionar-empresa"
                    className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Building className="w-4 h-4" />
                    Cambiar empresa
                  </Link>
                )}
                
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      <CommandPalette open={isCommandOpen} setOpen={setIsCommandOpen} />
    </header>
  )
}

export function SideNav({ session, mobileOpen, onCloseMobile }: { session: SessionData | null, mobileOpen?: boolean, onCloseMobile?: () => void }) {
  const pathname = usePathname()
  const sections = getVisibleSections(session)
  const initials = getUserInitials(session)
  const displayName = getUserDisplayName(session)
  const rolBadge = getRolBadge(session)
  const showConfig = session?.isGlobalAdmin || session?.rol === 'Agente Owner'

  // Close mobile menu on navigation
  useEffect(() => {
    if (onCloseMobile) onCloseMobile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <nav 
        className={clsx(
          "fixed top-0 bottom-0 flex flex-col z-40 transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ 
          width: 'var(--sidenav-width)',
          background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
        }}
      >
        {/* Brand Logo */}
        <div className="flex items-center justify-between px-5 h-[56px] flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)' }}
            >
              <Zap className="w-[18px] h-[18px] text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-white tracking-tight leading-none">
                AlterEstate
              </span>
              <span className="text-[10px] font-medium text-blue-400 tracking-wide uppercase mt-0.5">
                CRM Pro
              </span>
            </div>
          </div>
          {/* Mobile close button */}
          <button 
            onClick={onCloseMobile}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {sections.map((section, sIdx) => (
            <div key={sIdx}>
              {section.label && (
                <div className="px-3 pt-4 pb-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    {section.label}
                  </span>
                </div>
              )}
              {section.items.map((item) => {
                const isActive = item.href === '/' 
                  ? pathname === '/'
                  : pathname.startsWith(item.href)
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "group relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-[13px] font-medium",
                      isActive 
                        ? "bg-blue-600/15 text-blue-400" 
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-blue-400 rounded-r-full" />
                    )}
                    <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          ))}
        </div>

        {/* Config link */}
        {showConfig && (
          <div className="px-3 pb-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <Link
              href={configItem.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 mt-2 rounded-lg transition-all duration-200 text-[13px] font-medium",
                pathname.startsWith(configItem.href)
                  ? "bg-blue-600/15 text-blue-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              <Settings className="w-[18px] h-[18px] flex-shrink-0" />
              <span>Configuración</span>
            </Link>
          </div>
        )}

        {/* User Profile Footer */}
        <div className="px-3 pb-4 pt-2 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Status indicator */}
          <div className="flex items-center gap-2.5 px-3 py-2 mb-2 rounded-lg bg-emerald-500/10">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/40"></div>
            <span className="text-[11px] font-medium text-emerald-400">Sistema activo</span>
          </div>
          {/* User */}
          <div className="flex items-center gap-2.5 px-3 py-1.5">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-slate-200 truncate">{displayName}</div>
              <div className="text-[10px] text-slate-500 truncate">{rolBadge}</div>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
