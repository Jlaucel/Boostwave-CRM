import React from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { LucideIcon } from 'lucide-react'

export interface TimelineEvent {
  id: string
  title: string
  description: string
  date: Date
  icon: LucideIcon
  color: string
}

interface ActivityTimelineProps {
  events: TimelineEvent[]
}

export function ActivityTimeline({ events }: ActivityTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-[13px] text-[var(--text-tertiary)] p-4 text-center border border-dashed border-[var(--border-default)] rounded-lg">
        No hay actividad registrada aún.
      </div>
    )
  }

  return (
    <div className="relative border-l-2 border-[var(--border-default)] ml-4 space-y-6 pb-2">
      {events.map((evt, idx) => (
        <div key={evt.id} className="relative pl-6 group">
          {/* Connector Line */}
          {idx !== events.length - 1 && (
            <div className="absolute left-[-2px] top-8 bottom-[-24px] w-0.5 bg-[var(--border-default)] group-hover:bg-[var(--border-strong)] transition-colors" />
          )}
          
          {/* Icon Badge */}
          <div className={`absolute -left-[17px] p-1.5 rounded-full bg-white border-2 border-[var(--border-default)] shadow-sm group-hover:border-[var(--color-brand-400)] transition-colors ${evt.color}`}>
            <evt.icon className="w-4 h-4" />
          </div>
          
          {/* Content Card */}
          <div className="bg-white border border-[var(--border-default)] rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="text-[13px] font-bold text-[var(--text-primary)]">{evt.title}</div>
                <div className="text-[12px] text-[var(--text-secondary)] mt-0.5">{evt.description}</div>
              </div>
              <div className="text-[11px] font-medium text-[var(--text-tertiary)] whitespace-nowrap bg-[var(--bg-surface-secondary)] px-2 py-1 rounded">
                {format(evt.date, "d MMM yyyy, h:mm a", { locale: es })}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
