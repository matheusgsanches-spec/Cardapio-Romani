import { useDroppable } from '@dnd-kit/core'
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CalendarPlus, NotebookPen, Trash2 } from 'lucide-react'
import { addDays, formatShortDate } from '../../domain/week'
import FoodCard from './FoodCard'

function SortableMenuFood({ item, day, food, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `menu:${day}:${item.instanceId}`, data: { type: 'menu', day, instanceId: item.instanceId, foodId: item.foodId } })
  return <FoodCard food={food} dragging={isDragging} onRemove={onRemove} style={{ transform: CSS.Transform.toString(transform), transition }} attributes={attributes} listeners={listeners} setNodeRef={setNodeRef} />
}

export default function DayColumn({ day, dayIndex, weekStart, items, dailySpecial, foods, onRemove, onClear, onDailySpecialChange, mobileVisible, dragActive, dropBlocked }) {
  const { setNodeRef, isOver } = useDroppable({ id: `day:${day.key}`, data: { type: 'day', day: day.key } })
  const date = addDays(weekStart, dayIndex)
  const isToday = date.toDateString() === new Date().toDateString()
  return (
    <section className={`day-column ${dragActive && !dropBlocked ? 'day-column--drop-ready' : ''} ${dropBlocked ? 'day-column--drop-blocked' : ''} ${isOver && !dropBlocked ? 'day-column--over' : ''} ${isToday ? 'day-column--today' : ''} ${mobileVisible ? 'day-column--mobile-visible' : ''}`}>
      <header><div><span>{day.label}</span><strong>{formatShortDate(date)}</strong></div>{isToday && <i>HOJE</i>}</header>
      <div className="day-column__meta"><span>{items.length} {items.length === 1 ? 'item' : 'itens'}</span>{items.length > 0 && <button type="button" onClick={onClear}><Trash2 size={13} /> Limpar</button>}</div>
      <label className="daily-special-field"><span><NotebookPen size={15} /> Prato feito do dia</span><textarea value={dailySpecial} onChange={(event) => onDailySpecialChange(event.target.value)} maxLength={500} rows={3} placeholder="Ex.: Bife acebolado, arroz, feijão e salada" aria-label={`Prato feito de ${day.label}`} /><small>{dailySpecial.length}/500</small></label>
      <SortableContext items={items.map((item) => `menu:${day.key}:${item.instanceId}`)} strategy={verticalListSortingStrategy}>
        <div className="day-column__dropzone" ref={setNodeRef}>
          {items.map((item) => <SortableMenuFood key={item.instanceId} item={item} day={day.key} food={foods.find((food) => food.id === item.foodId)} onRemove={() => onRemove(item.instanceId)} />)}
          {!items.length && <div className="day-column__empty"><CalendarPlus size={21} /><span>Arraste alimentos para montar o buffet deste dia.</span><small>Solte o primeiro item aqui</small></div>}
          {isOver && !dropBlocked && <div className="day-column__drop-hint">Solte para adicionar</div>}
          {isOver && dropBlocked && <div className="day-column__drop-hint day-column__drop-hint--blocked">Este alimento já está neste dia</div>}
        </div>
      </SortableContext>
    </section>
  )
}
