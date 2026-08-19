import { type LucideIcon } from 'lucide-react'
import { clsx } from 'clsx'

type AccentColor = 'blue' | 'green' | 'amber' | 'purple' | 'red' | 'cyan'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  accent?: AccentColor
  trend?: { value: string; positive: boolean }
  subtitle?: string
}

const accentConfig: Record<AccentColor, { gradient: string; iconColor: string; bgLight: string }> = {
  blue:   { gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)', iconColor: '#2563EB', bgLight: '#EFF6FF' },
  green:  { gradient: 'linear-gradient(135deg, #22C55E, #16A34A)', iconColor: '#16A34A', bgLight: '#F0FDF4' },
  amber:  { gradient: 'linear-gradient(135deg, #F59E0B, #D97706)', iconColor: '#D97706', bgLight: '#FFFBEB' },
  purple: { gradient: 'linear-gradient(135deg, #A78BFA, #7C3AED)', iconColor: '#7C3AED', bgLight: '#F5F3FF' },
  red:    { gradient: 'linear-gradient(135deg, #F87171, #DC2626)', iconColor: '#DC2626', bgLight: '#FEF2F2' },
  cyan:   { gradient: 'linear-gradient(135deg, #22D3EE, #0891B2)', iconColor: '#0891B2', bgLight: '#ECFEFF' },
}

export function StatCard({ label, value, icon: Icon, accent = 'blue', trend, subtitle }: StatCardProps) {
  const config = accentConfig[accent]

  return (
    <div 
      className="bg-white rounded-xl border border-[var(--border-default)] p-4 transition-all duration-200 hover:shadow-[var(--shadow-md)] group relative overflow-hidden"
    >
      {/* Subtle gradient accent line at top */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: config.gradient }}
      />

      <div className="flex items-center justify-between mb-2.5">
        <div 
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: config.bgLight }}
        >
          <Icon className="w-[18px] h-[18px]" style={{ color: config.iconColor }} />
        </div>
        {trend && (
          <span className={clsx(
            "text-[11px] font-bold px-2 py-0.5 rounded-full",
            trend.positive
              ? "text-emerald-700 bg-emerald-50"
              : "text-red-700 bg-red-50"
          )}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div className="text-[24px] font-bold text-[var(--text-primary)] tracking-tight leading-none mb-1">
        {value}
      </div>
      <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
        {label}
      </div>
      {subtitle && (
        <div className="text-[11px] text-[var(--text-tertiary)] mt-1">
          {subtitle}
        </div>
      )}
    </div>
  )
}
