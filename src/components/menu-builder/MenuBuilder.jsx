import { useMemo, useState } from 'react'
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { ChevronLeft, ChevronRight, Library } from 'lucide-react'
import { getDayKey, getWeekId, WEEK_DAYS } from '../../domain/week'
import { useToast } from '../../context/ToastContext'
import FoodLibrary from './FoodLibrary'
import DayColumn from './DayColumn'
import FoodCard from './FoodCard'

export default function MenuBuilder({ weekStart, days, dailySpecials, onChange, onDailySpecialChange, foods }) {
  const { showToast } = useToast()
  const currentWeek = getWeekId(new Date()) === getWeekId(weekStart)
  const todayKey = getDayKey(new Date())
  const initialIndex = currentWeek ? WEEK_DAYS.findIndex((day) => day.key === todayKey) : 0
  const [mobileDay, setMobileDay] = useState(initialIndex)
  const [mobileLibraryOpen, setMobileLibraryOpen] = useState(false)
  const [activeDrag, setActiveDrag] = useState(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const activeFood = useMemo(() => activeDrag ? foods.find((food) => food.id === activeDrag.foodId) : null, [activeDrag, foods])

  function updateDay(day, updater) {
    onChange({ ...days, [day]: updater(days[day] || []).map((item, order) => ({ ...item, order })) })
  }

  function handleDragStart({ active }) {
    setActiveDrag(active.data.current)
  }

  function handleDragEnd({ active, over }) {
    setActiveDrag(null)
    if (!over) return
    const source = active.data.current
    const target = over.data.current
    const targetDay = target?.day
    if (!source || !targetDay) return

    const targetItems = days[targetDay] || []
    const targetIndex = target.type === 'menu'
      ? targetItems.findIndex((item) => item.instanceId === target.instanceId)
      : targetItems.length

    if (source.type === 'library') {
      if (targetItems.some((item) => item.foodId === source.foodId)) {
        showToast('Esse alimento já está neste dia.', 'info')
        return
      }
      const nextItems = [...targetItems]
      nextItems.splice(targetIndex < 0 ? nextItems.length : targetIndex, 0, {
        instanceId: crypto.randomUUID(),
        foodId: source.foodId,
      })
      updateDay(targetDay, () => nextItems)
      setMobileLibraryOpen(false)
      return
    }

    const sourceDay = source.day
    const sourceItems = days[sourceDay] || []
    const sourceIndex = sourceItems.findIndex((item) => item.instanceId === source.instanceId)
    if (sourceIndex < 0) return

    if (sourceDay === targetDay) {
      const finalIndex = targetIndex < 0 ? sourceItems.length - 1 : targetIndex
      if (sourceIndex !== finalIndex) updateDay(sourceDay, (items) => arrayMove(items, sourceIndex, finalIndex))
      return
    }

    const movingItem = sourceItems[sourceIndex]
    if (targetItems.some((item) => item.foodId === movingItem.foodId)) {
      showToast('Esse alimento já está neste dia.', 'info')
      return
    }
    const nextSource = sourceItems.filter((item) => item.instanceId !== source.instanceId)
    const nextTarget = [...targetItems]
    nextTarget.splice(targetIndex < 0 ? nextTarget.length : targetIndex, 0, movingItem)
    onChange({
      ...days,
      [sourceDay]: nextSource.map((item, order) => ({ ...item, order })),
      [targetDay]: nextTarget.map((item, order) => ({ ...item, order })),
    })
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragCancel={() => setActiveDrag(null)} onDragEnd={handleDragEnd}>
      <div className="mobile-builder-tools">
        <div className="mobile-day-nav">
          <button type="button" onClick={() => setMobileDay((current) => (current + 6) % 7)} aria-label="Dia anterior"><ChevronLeft size={19} /></button>
          <div><small>DIA SELECIONADO</small><strong>{WEEK_DAYS[mobileDay].label}</strong></div>
          <button type="button" onClick={() => setMobileDay((current) => (current + 1) % 7)} aria-label="Próximo dia"><ChevronRight size={19} /></button>
        </div>
        <button className="mobile-library-trigger" type="button" onClick={() => setMobileLibraryOpen(true)}><Library size={17} /> Alimentos <span>{foods.filter((food) => food.active).length}</span></button>
      </div>
      {mobileLibraryOpen && !activeDrag && <button className="mobile-library-scrim" type="button" onClick={() => setMobileLibraryOpen(false)} aria-label="Fechar biblioteca" />}
      <div className={`builder-layout ${activeDrag ? 'builder-layout--dragging' : ''}`}>
        <div className={`builder-library-panel ${mobileLibraryOpen ? 'is-open' : ''}`}>
          <FoodLibrary foods={foods} onClose={() => setMobileLibraryOpen(false)} />
        </div>
        <div className="days-board">
          {WEEK_DAYS.map((day, index) => {
            const dayItems = days[day.key] || []
            const dropBlocked = Boolean(activeDrag)
              && dayItems.some((item) => item.foodId === activeDrag.foodId)
              && !(activeDrag.type === 'menu' && activeDrag.day === day.key)
            return (
              <DayColumn
                key={day.key}
                day={day}
                dayIndex={index}
                weekStart={weekStart}
                items={dayItems}
                dailySpecial={dailySpecials?.[day.key] || ''}
                foods={foods}
                mobileVisible={mobileDay === index}
                dragActive={Boolean(activeDrag)}
                dropBlocked={dropBlocked}
                onRemove={(instanceId) => updateDay(day.key, (items) => items.filter((item) => item.instanceId !== instanceId))}
                onClear={() => updateDay(day.key, () => [])}
                onDailySpecialChange={(value) => onDailySpecialChange(day.key, value)}
              />
            )
          })}
        </div>
      </div>
      <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>{activeFood ? <FoodCard food={activeFood} overlay /> : null}</DragOverlay>
    </DndContext>
  )
}
