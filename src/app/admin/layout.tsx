import { requireGlobalAdmin } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireGlobalAdmin()
  return (
    <div className="p-6">
      {children}
    </div>
  )
}
