import { useMemo, useState } from 'react'
import { ChevronDown, Library, Plus, SearchX, X } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import { Link } from 'react-router-dom'
import { BRAND_CATEGORY_HUES } from '../../config/brand'
import FoodCard from './FoodCard'
import SearchInput from '../ui/SearchInput'
import EmptyState from '../ui/EmptyState'

function DraggableLibraryFood({ food, category }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library:${food.id}`,
    data: { type: 'library', foodId: food.id },
  })
  return <FoodCard food={food} category={category} dragging={isDragging} attributes={attributes} listeners={listeners} setNodeRef={setNodeRef} />
}

export default function FoodLibrary({ foods, categories, onClose }) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [collapsed, setCollapsed] = useState({})
  const activeCategories = useMemo(() => categories.filter((category) => category.active), [categories])
  const activeFoods = useMemo(() => foods.filter((food) => food.active), [foods])
  const visibleFoods = useMemo(() => activeFoods.filter((food) => {
    const matchesSearch = food.name.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))
    const matchesCategory = categoryFilter === 'all' || food.categoryId === categoryFilter
    return matchesSearch && matchesCategory
  }), [activeFoods, categoryFilter, search])
  const visibleCategories = categoryFilter === 'all'
    ? activeCategories
    : activeCategories.filter((category) => category.id === categoryFilter)

  return (
    <aside className="food-library">
      <header>
        <div><span className="food-library__icon"><Library size={18} /></span><div><strong>Biblioteca de alimentos</strong><small>Arraste para um dia</small></div></div>
        <span>{visibleFoods.length}</span>
        <button className="food-library__close" type="button" onClick={onClose} aria-label="Fechar biblioteca"><X size={18} /></button>
      </header>
      <SearchInput value={search} onChange={setSearch} placeholder="Pesquisar alimento..." />
      <div className="food-library__filters" aria-label="Filtrar por categoria">
        <button className={categoryFilter === 'all' ? 'is-active' : ''} type="button" onClick={() => setCategoryFilter('all')}>Todos</button>
        {activeCategories.map((category) => (
          <button className={categoryFilter === category.id ? 'is-active' : ''} type="button" key={category.id} onClick={() => setCategoryFilter(category.id)}>{category.name}</button>
        ))}
      </div>
      <div className="food-library__groups">
        {visibleCategories.map((category) => {
          const categoryIndex = activeCategories.findIndex((item) => item.id === category.id)
          const categoryFoods = visibleFoods.filter((food) => food.categoryId === category.id)
          if (!categoryFoods.length) return null
          const displayCategory = { ...category, hue: BRAND_CATEGORY_HUES[categoryIndex % BRAND_CATEGORY_HUES.length] }
          const isCollapsed = collapsed[category.id]
          return (
            <section className="food-group" key={category.id}>
              <button type="button" onClick={() => setCollapsed((current) => ({ ...current, [category.id]: !current[category.id] }))}><span>{category.name}</span><i>{categoryFoods.length}</i><ChevronDown className={isCollapsed ? 'is-collapsed' : ''} size={15} /></button>
              {!isCollapsed && <div>{categoryFoods.map((food) => <DraggableLibraryFood key={food.id} food={food} category={displayCategory} />)}</div>}
            </section>
          )
        })}
        {!visibleFoods.length && (
          <EmptyState
            icon={search || categoryFilter !== 'all' ? SearchX : Library}
            title={activeFoods.length ? 'Nenhum alimento encontrado' : 'Nenhum alimento cadastrado'}
            description={activeFoods.length ? 'Ajuste a pesquisa ou selecione outra categoria.' : 'Cadastre um alimento para começar a montar o buffet.'}
            action={!activeFoods.length ? <Link className="button button--primary button--sm" to="/admin/alimentos"><Plus size={14} /> Cadastrar alimento</Link> : undefined}
          />
        )}
      </div>
      <footer><span className="drag-tip-icon">↗</span><p><strong>Dica rápida</strong> Clique, segure e arraste um bloco para o dia desejado.</p></footer>
    </aside>
  )
}
