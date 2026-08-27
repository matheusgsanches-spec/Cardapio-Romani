import { CalendarDays, ChevronLeft, ChevronRight, LocateFixed } from 'lucide-react'
import { addWeeks, formatWeekRange, getWeekStart, toISODate } from '../../domain/week'
import Button from '../ui/Button'

export default function WeekSelector({ value, onChange, compact = false }) {
  const weekStart = getWeekStart(value)
  return (
    <div className={`week-selector ${compact ? 'week-selector--compact' : ''}`}>
      <Button variant="ghost" size="sm" onClick={() => onChange(addWeeks(weekStart, -1))} aria-label="Semana anterior"><ChevronLeft size={18} /><span>Anterior</span></Button>
      <label className="week-selector__date">
        <CalendarDays size={17} />
        <div><small>SEMANA SELECIONADA</small><strong>{formatWeekRange(weekStart)}</strong></div>
        <input type="date" value={toISODate(weekStart)} onChange={(event) => event.target.value && onChange(getWeekStart(new Date(`${event.target.value}T12:00:00`)))} aria-label="Selecionar semana" />
      </label>
      <Button variant="ghost" size="sm" onClick={() => onChange(addWeeks(weekStart, 1))}><span>Próxima</span><ChevronRight size={18} /></Button>
      {!compact && <button className="current-week-link" type="button" onClick={() => onChange(getWeekStart(new Date()))}><LocateFixed size={13} /> Hoje</button>}
    </div>
  )
}
