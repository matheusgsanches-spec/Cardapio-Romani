import { GripVertical, X } from 'lucide-react'

export default function FoodCard({ food, dragging = false, overlay = false, onRemove, attributes, listeners, setNodeRef, style }) {
  return (
    <article className={`food-card ${dragging ? 'food-card--dragging' : ''} ${overlay ? 'food-card--overlay' : ''}`} style={style} {...attributes} {...listeners} ref={setNodeRef}>
      <span className="food-card__accent" style={{ '--category-hue': 28 }} />
      <GripVertical className="food-card__grip" size={16} aria-hidden="true" />
      <div className="food-card__content"><strong>{food?.name || 'Alimento indisponível'}</strong></div>
      {onRemove ? <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={onRemove} aria-label={`Remover ${food?.name}`}><X size={15} /></button> : null}
    </article>
  )
}
