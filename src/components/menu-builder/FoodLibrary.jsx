import { useMemo, useState } from 'react'
import { Library, Plus, SearchX, X } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import { Link } from 'react-router-dom'
import FoodCard from './FoodCard'
import SearchInput from '../ui/SearchInput'
import EmptyState from '../ui/EmptyState'

function DraggableLibraryFood({ food }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `library:${food.id}`, data: { type: 'library', foodId: food.id } })
  return <FoodCard food={food} dragging={isDragging} attributes={attributes} listeners={listeners} setNodeRef={setNodeRef} />
}

export default function FoodLibrary({ foods, onClose }) {
  const [search, setSearch] = useState('')
  const activeFoods = useMemo(() => foods.filter((food) => food.active), [foods])
  const visibleFoods = useMemo(() => activeFoods.filter((food) => food.name.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))), [activeFoods, search])
  return (
    <aside className="food-library">
      <header><div><span className="food-library__icon"><Library size={18} /></span><div><strong>Biblioteca de alimentos</strong><small>Arraste para um dia</small></div></div><span>{visibleFoods.length}</span><button className="food-library__close" type="button" onClick={onClose} aria-label="Fechar biblioteca"><X size={18} /></button></header>
      <SearchInput value={search} onChange={setSearch} placeholder="Pesquisar alimento..." />
      <div className="food-library__groups"><div className="food-library__items">{visibleFoods.map((food) => <DraggableLibraryFood key={food.id} food={food} />)}</div>
        {!visibleFoods.length && <EmptyState icon={search ? SearchX : Library} title={activeFoods.length ? 'Nenhum alimento encontrado' : 'Nenhum alimento cadastrado'} description={activeFoods.length ? 'Ajuste a pesquisa para ver outros resultados.' : 'Cadastre um alimento para começar a montar o buffet.'} action={!activeFoods.length ? <Link className="button button--primary button--sm" to="/admin/alimentos"><Plus size={14} /> Cadastrar alimento</Link> : undefined} />}
      </div>
      <footer><span className="drag-tip-icon">↗</span><p><strong>Dica rápida</strong> Clique, segure e arraste um bloco para o dia desejado.</p></footer>
    </aside>
  )
}
