import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { type LucideIcon } from 'lucide-react'

interface Breadcrumb {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  icon?: LucideIcon
  breadcrumbs: Breadcrumb[]
  actions?: React.ReactNode
  subtitle?: string
}

export function PageHeader({ title, icon: Icon, breadcrumbs, actions, subtitle }: PageHeaderProps) {
  return (
    <div 
      className="border-b border-[var(--border-default)] px-8 py-5 relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 50%, #F1F5F9 100%)',
        boxShadow: '0 1px 2px rgba(15,23,42,0.04)' 
      }}
    >
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[12px] mb-2">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3 h-3 text-[var(--text-tertiary)]" />}
            {crumb.href ? (
              <Link href={crumb.href} className="text-[var(--text-brand)] hover:underline font-medium">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-[var(--text-tertiary)] font-medium">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Title Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div 
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)' }}
            >
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
          )}
          <div>
            <h1 className="text-[20px] font-bold text-[var(--text-primary)] tracking-tight leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
