import { useMemo, useState } from 'react'
import { ChefHat, MoreHorizontal, Pencil, Plus, Power } from 'lucide-react'
import AddFoodModal from '../../components/foods/AddFoodModal'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Loader from '../../components/ui/Loader'
import SearchInput from '../../components/ui/SearchInput'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'

export default function FoodsPage() {
  const { foods, loading, saveFood } = useData()
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editing, setEditing] = useState(undefined)
  const [modalOpen, setModalOpen] = useState(false)
  const visible = useMemo(() => foods.filter((food) => {
    const matchesSearch = food.name.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))
    const matchesStatus = statusFilter === 'all' || String(food.active) === statusFilter
    return matchesSearch && matchesStatus
  }), [foods, search, statusFilter])

  async function handleSave(food) {
    await saveFood(food)
    showToast(food.id ? 'Alimento atualizado com sucesso.' : 'Alimento adicionado à biblioteca.')
  }

  async function toggleActive(food) {
    try { await saveFood({ ...food, active: !food.active }); showToast(food.active ? 'Alimento desativado.' : 'Alimento reativado.', 'info') }
    catch { showToast('Não foi possível alterar o alimento.', 'error') }
  }

  if (loading) return <Loader label="Carregando alimentos..." />
  return (
    <div className="page-stack">
      <section className="toolbar-card toolbar-card--foods">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar alimento..." />
        <label className="filter-select"><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Todos os status</option><option value="true">Ativos</option><option value="false">Inativos</option></select></label>
        <span className="result-count">{visible.length} itens</span>
        <Button onClick={() => { setEditing(undefined); setModalOpen(true) }}><Plus size={17} /> Novo alimento</Button>
      </section>
      <section className="surface-card entity-list-card">
        <header className="table-heading table-row table-row--foods"><span>Alimento</span><span>Descrição</span><span>Status</span><span><MoreHorizontal size={17} /></span></header>
        {visible.length ? visible.map((food) => (
          <article className="table-row table-row--foods" key={food.id}>
            <div className="entity-name"><span className="entity-avatar entity-avatar--food"><ChefHat size={18} /></span><strong>{food.name}</strong></div>
            <span className="description-cell">{food.description || '—'}</span>
            <span><i className={`status-dot ${food.active ? 'is-active' : ''}`} />{food.active ? 'Ativo' : 'Inativo'}</span>
            <div className="row-actions"><button type="button" onClick={() => { setEditing(food); setModalOpen(true) }} aria-label={`Editar ${food.name}`}><Pencil size={16} /></button><button type="button" onClick={() => toggleActive(food)} aria-label={food.active ? 'Desativar' : 'Ativar'}><Power size={16} /></button></div>
          </article>
        )) : <EmptyState icon={ChefHat} title="Nenhum alimento encontrado" description={search || statusFilter !== 'all' ? 'Ajuste os filtros para ver outros resultados.' : 'Adicione o primeiro alimento à biblioteca.'} />}
      </section>
      {modalOpen && <AddFoodModal food={editing} foods={foods} onClose={() => setModalOpen(false)} onSave={handleSave} />}
    </div>
  )
}
