import { Search, X } from 'lucide-react'

export default function SearchInput({ value, onChange, placeholder = 'Pesquisar...' }) {
  return (
    <label className="search-input">
      <Search size={17} aria-hidden="true" />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label="Limpar pesquisa">
          <X size={15} />
        </button>
      )}
    </label>
  )
}
