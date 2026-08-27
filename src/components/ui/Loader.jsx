export default function Loader({ label = 'Carregando...' }) {
  return (
    <div className="loader" role="status">
      <span className="loader__spinner" />
      <span>{label}</span>
    </div>
  )
}
