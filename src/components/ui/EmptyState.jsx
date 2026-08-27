export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state">
      {Icon && <span className="empty-state__icon"><Icon size={22} /></span>}
      <strong>{title}</strong>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}
