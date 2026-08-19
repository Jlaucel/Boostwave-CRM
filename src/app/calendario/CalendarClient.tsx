'use client'

import { useState } from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, User, Building, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/Badge'

interface CalendarClientProps {
  visitas: any[] // Lista de Ventas con relaciones (cliente, propiedad, agente)
}

export function CalendarClient({ visitas }: CalendarClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }) // Semana empieza el lunes
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const dateFormat = "MMMM yyyy"
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  // Filtrar visitas del mes actual para renderizarlas en los días
  const getVisitasForDay = (day: Date) => {
    return visitas.filter(v => v.fecha_visita && isSameDay(new Date(v.fecha_visita), day))
  }

  function getInitials(name: string) {
    if (!name) return '?'
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className="flex flex-col h-full bg-white border border-[var(--border-default)] rounded-xl shadow-[var(--shadow-card)] overflow-hidden">
      
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-default)]" style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)' }}>
        <h2 className="text-lg font-bold text-[var(--text-primary)] capitalize">
          {format(currentDate, dateFormat, { locale: es })}
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={prevMonth}
            className="p-1.5 rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)]"
          >
            Hoy
          </button>
          <button 
            onClick={nextMonth}
            className="p-1.5 rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)]"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 border-b border-[var(--border-default)] bg-[var(--bg-surface-secondary)]">
        {weekDays.map(day => (
          <div key={day} className="py-2 text-center text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto">
        {days.map((day, idx) => {
          const dayVisitas = getVisitasForDay(day)
          const isCurrentMonth = isSameMonth(day, monthStart)
          const isTodayDay = isToday(day)

          return (
            <div 
              key={day.toString()} 
              className={`min-h-[120px] p-2 border-b border-r border-[var(--border-default)] transition-colors relative
                ${!isCurrentMonth ? 'bg-[var(--bg-surface-secondary)]/50 opacity-60' : 'bg-white hover:bg-slate-50/50'}
                ${idx % 7 === 6 ? 'border-r-0' : ''}
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                  ${isTodayDay ? 'bg-blue-600 text-white shadow-sm' : isCurrentMonth ? 'text-[var(--text-secondary)]' : 'text-[var(--text-tertiary)]'}
                `}>
                  {format(day, 'd')}
                </span>
                {dayVisitas.length > 0 && (
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                    {dayVisitas.length}
                  </span>
                )}
              </div>

              <div className="space-y-1.5 overflow-y-auto max-h-[85px] custom-scrollbar">
                {dayVisitas.map((visita: any) => (
                  <Link 
                    key={visita.id} 
                    href={`/ventas/${visita.id}`}
                    className="block group bg-white border border-[var(--border-default)] rounded p-1.5 hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-[10px] font-bold text-blue-600 truncate mr-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        {format(new Date(visita.fecha_visita), 'HH:mm')}
                      </div>
                      <Badge variant="purple" className="text-[8px] px-1 py-0 leading-tight">
                        {visita.estado_venta}
                      </Badge>
                    </div>
                    
                    <div className="text-[11px] font-medium text-[var(--text-primary)] truncate mb-0.5 group-hover:text-blue-700">
                      {visita.propiedad?.titulo || 'Propiedad'}
                    </div>
                    
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1 min-w-0">
                        <User className="w-3 h-3 text-[var(--text-tertiary)] flex-shrink-0" />
                        <span className="text-[9px] text-[var(--text-secondary)] truncate">
                          {visita.cliente?.nombre || 'Cliente'}
                        </span>
                      </div>
                      
                      {visita.agente && (
                        <div 
                          className="w-4 h-4 rounded-full flex items-center justify-center font-bold text-[7px] text-white flex-shrink-0 ml-1"
                          style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}
                          title={`Agente: ${visita.agente.nombre}`}
                        >
                          {getInitials(visita.agente.nombre)}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
