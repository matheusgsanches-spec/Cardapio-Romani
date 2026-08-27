import { useEffect, useState } from 'react'
import { Check, Eye, Globe2, Save } from 'lucide-react'
import { Link } from 'react-router-dom'
import MenuBuilder from '../../components/menu-builder/MenuBuilder'
import WeekSelector from '../../components/menu-builder/WeekSelector'
import Button from '../../components/ui/Button'
import ConfirmModal from '../../components/ui/ConfirmModal'
import Loader from '../../components/ui/Loader'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { getWeekStart } from '../../domain/week'

export default function MenuBuilderPage() {
  const { foods, categories, getMenu, saveMenu } = useData()
  const { showToast } = useToast()
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()))
  const [menu, setMenu] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [pendingWeek, setPendingWeek] = useState(null)

  useEffect(() => {
    let active = true
    getMenu(weekStart)
      .then((data) => { if (active) { setMenu(data); setDirty(false) } })
      .catch(() => showToast('Não foi possível carregar o cardápio desta semana.', 'error'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [getMenu, showToast, weekStart])

  useEffect(() => {
    const warn = (event) => {
      if (!dirty) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  function requestWeek(nextWeek) {
    if (dirty) setPendingWeek(nextWeek)
    else {
      setLoading(true)
      setWeekStart(nextWeek)
    }
  }

  async function handleSave(publish = false) {
    if (!menu) return
    setSaving(publish ? 'publish' : 'draft')
    try {
      const savedMenu = await saveMenu(menu, { publish })
      setMenu(savedMenu)
      setDirty(false)
      showToast(publish ? 'Cardápio publicado com sucesso.' : 'Rascunho salvo com sucesso.')
    } catch {
      showToast(publish ? 'Não foi possível publicar o cardápio.' : 'Não foi possível salvar o rascunho.', 'error')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="builder-page page-stack">
      <section className="builder-toolbar">
        <WeekSelector value={weekStart} onChange={requestWeek} />
        <div className="builder-toolbar__actions">
          {dirty ? <span className="unsaved-indicator"><i /> Alterações não salvas</span>
            : menu?.hasUnpublishedChanges ? <span className="draft-indicator"><Save size={14} /> Rascunho salvo</span>
              : menu?.status === 'published' ? <span className="published-indicator"><Check size={15} /> Publicado</span>
                : <span className="draft-indicator"><Save size={14} /> Rascunho</span>}
          <Link className="button button--secondary button--md" to="/admin/tabela"><Eye size={16} /> Visualizar tabela</Link>
          <Button variant="secondary" onClick={() => handleSave(false)} disabled={!dirty || Boolean(saving)}><Save size={17} />{saving === 'draft' ? 'Salvando...' : 'Salvar rascunho'}</Button>
          <Button onClick={() => handleSave(true)} disabled={!menu || Boolean(saving) || (!dirty && menu.status === 'published' && !menu.hasUnpublishedChanges)}><Globe2 size={17} />{saving === 'publish' ? 'Publicando...' : 'Publicar cardápio'}</Button>
        </div>
      </section>
      {loading || !menu ? <div className="builder-loading"><Loader label="Carregando a semana..." /></div> : (
        <MenuBuilder
          key={menu.id}
          weekStart={weekStart}
          days={menu.days}
          foods={foods}
          categories={categories}
          onChange={(days) => { setMenu((current) => ({ ...current, days })); setDirty(true) }}
        />
      )}
      <ConfirmModal
        open={Boolean(pendingWeek)}
        onClose={() => setPendingWeek(null)}
        title="Descartar alterações?"
        message="Você alterou este cardápio e ainda não salvou. Ao trocar de semana, essas alterações serão perdidas."
        confirmLabel="Descartar e continuar"
        onConfirm={() => { setLoading(true); setWeekStart(pendingWeek); setPendingWeek(null) }}
      />
    </div>
  )
}
