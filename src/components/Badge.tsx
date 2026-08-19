import { clsx } from 'clsx'

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple' | 'cyan'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  dot?: boolean
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success)]/15',
  warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-warning)]/15',
  error: 'bg-[var(--color-error-bg)] text-[var(--color-error)] border-[var(--color-error)]/15',
  info: 'bg-[var(--color-info-bg)] text-[var(--color-info)] border-[var(--color-info)]/15',
  neutral: 'bg-[#EDF1F7] text-[var(--text-secondary)] border-[var(--border-default)]',
  purple: 'bg-[#F3EEFF] text-[#7C3AED] border-[#7C3AED]/15',
  cyan: 'bg-[#E0F7FA] text-[#0097A7] border-[#0097A7]/15',
}

const dotColors: Record<BadgeVariant, string> = {
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
  error: 'bg-[var(--color-error)]',
  info: 'bg-[var(--color-info)]',
  neutral: 'bg-[var(--text-tertiary)]',
  purple: 'bg-[#7C3AED]',
  cyan: 'bg-[#0097A7]',
}

export function Badge({ children, variant = 'neutral', dot = false, className }: BadgeProps) {
  return (
    <span className={clsx(
      "inline-flex items-center gap-1.5 px-2 py-[3px] text-[11px] font-semibold rounded border leading-none",
      variantStyles[variant],
      className
    )}>
      {dot && <span className={clsx("w-1.5 h-1.5 rounded-full flex-shrink-0", dotColors[variant])} />}
      {children}
    </span>
  )
}

/* Helper function to get badge variant based on common CRM statuses */
export function getStatusVariant(status: string): BadgeVariant {
  const s = status.toLowerCase()
  if (s.includes('nuevo') || s.includes('whatsapp') || s.includes('contacto inicial')) return 'info'
  if (s.includes('disponible') || s.includes('ganado') || s.includes('cerrado')) return 'success'
  if (s.includes('negociación') || s.includes('interesado') || s.includes('visita')) return 'warning'
  if (s.includes('oferta')) return 'purple'
  if (s.includes('perdido') || s.includes('no disponible')) return 'error'
  return 'neutral'
}

export function getOriginVariant(origin: string): BadgeVariant {
  const o = origin?.toLowerCase() || ''
  if (o.includes('whatsapp')) return 'success'
  if (o.includes('instagram')) return 'purple'
  if (o.includes('referido')) return 'cyan'
  return 'neutral'
}
