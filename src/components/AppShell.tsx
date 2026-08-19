'use client'

import { useState } from 'react'
import { TopBar, SideNav } from '@/components/Sidebar'
import type { SessionData } from '@/lib/auth'

export function AppShell({ session, children }: { session: SessionData, children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <TopBar session={session} onToggleMobile={() => setMobileOpen(v => !v)} />
      <SideNav session={session} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <main className="lg:ml-[240px] mt-[56px] min-h-[calc(100vh-56px)] overflow-y-auto">
        {children}
      </main>
    </>
  )
}
