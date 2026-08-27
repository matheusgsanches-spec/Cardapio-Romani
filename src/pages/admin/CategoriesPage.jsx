import { useMemo, useState } from 'react'
import { FolderOpen, MoreHorizontal, Pencil, Plus, Power } from 'lucide-react'
import AddCategoryModal from '../../components/categories/AddCategoryModal'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Loader from '../../components/ui/Loader'
import SearchInput from '../../components/ui/SearchInput'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { sortCategories } from '../../domain/menuPresentation'

export default function CategoriesPage() {
  const { categories, foods, loading, saveCategory } = useData()
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(undefined)
  const [modalOpen, setModalOpen] = useState(false)

  const visible = useMemo(() => sortCategories(categories.filter((category) => category.name.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')))), [categories, search])

  async function handleSave(category) {
    await saveCategory(category)
    showToast(category.id ? 'Categoria atualizada com sucesso.' : 'Categoria criada com sucesso.')
  }

  async function toggleActive(category) {
    try {
      await saveCategory({ ...category, active: !category.active })
      showToast(category.active ? 'Categoria desativada.' : 'Categoria reativada.', 'info')
    } catch {
      showToast('Não foi possível alterar a categoria.', 'error')
    }
  }

  if (loading) return <Loader label="Carregando categorias..." />
  return (
    <div className="page-stack">
      <section className="toolbar-card">
        <div><SearchInput value={search} onChange={setSearch} placeholder="Buscar categoria..." /><span className="result-count">{visible.length} {visible.length === 1 ? 'categoria' : 'categorias'}</span></div>
        <Button onClick={() => { setEditing(undefined); setModalOpen(true) }}><Plus size={17} /> Nova categoria</Button>
      </section>
      <section className="surface-card entity-list-card">
        <header className="table-heading table-row table-row--categories"><span>Categoria</span><span>Alimentos</span><span>Ordem</span><span>Status</span><span><MoreHorizontal size={17} /></span></header>
        {visible.length ? visible.map((category) => {
          const foodCount = foods.filter((food) => food.categoryId === category.id).length
          return (
            <article className="table-row table-row--categories" key={category.id}>
              <div className="entity-name"><span className="entity-avatar"><FolderOpen size={18} /></span><div><strong>{category.name}</strong><small>ID: {category.id.slice(0, 12)}</small></div></div>
              <span>{foodCount} {foodCount === 1 ? 'alimento' : 'alimentos'}</span>
              <span className="category-order">{category.order ?? '—'}</span>
              <span><i className={`status-dot ${category.active ? 'is-active' : ''}`} />{category.active ? 'Ativa' : 'Inativa'}</span>
              <div className="row-actions"><button type="button" onClick={() => { setEditing(category); setModalOpen(true) }} aria-label={`Editar ${category.name}`}><Pencil size={16} /></button><button type="button" onClick={() => toggleActive(category)} aria-label={category.active ? 'Desativar' : 'Ativar'}><Power size={16} /></button></div>
            </article>
          )
        }) : <EmptyState icon={FolderOpen} title="Nenhuma categoria encontrada" description={search ? 'Tente pesquisar por outro termo.' : 'Crie a primeira categoria para organizar seus alimentos.'} />}
      </section>
      {modalOpen && <AddCategoryModal category={editing} categories={categories} onClose={() => setModalOpen(false)} onSave={handleSave} />}
    </div>
  )
}
