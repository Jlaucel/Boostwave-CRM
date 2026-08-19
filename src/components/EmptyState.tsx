import React from 'react'
import Link from 'next/link'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white border border-[var(--border-default)] rounded-xl shadow-[var(--shadow-sm)] mt-6 min-h-[300px]">
      <div 
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'linear-gradient(135deg, var(--color-brand-50) 0%, var(--color-brand-100) 100%)' }}
      >
        <Icon className="w-8 h-8 text-[var(--color-brand-600)]" />
      </div>
      
      <h3 className="text-[16px] font-bold text-[var(--text-primary)] mb-2 text-center">
        {title}
      </h3>
      
      <p className="text-[13px] text-[var(--text-secondary)] text-center max-w-sm mb-6">
        {description}
      </p>
      
      {actionLabel && actionHref && (
        <Link 
          href={actionHref}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-[13px] font-semibold text-white shadow-sm transition-colors hover:-translate-y-0.5 active:translate-y-0 duration-200"
          style={{ background: 'linear-gradient(135deg, var(--color-brand-500) 0%, var(--color-brand-600) 100%)' }}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
