import { useEffect, useRef, useState } from 'react'
import { Check, CircleDollarSign, Eye, Globe2, Save } from 'lucide-react'
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
  const { foods, getMenu, saveMenu } = useData()
  const { showToast } = useToast()
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()))
  const [menu, setMenu] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [pendingWeek, setPendingWeek] = useState(null)
  const editVersion = useRef(0)
  const failedAutosaveVersion = useRef(null)

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

  useEffect(() => {
    if (!dirty || !menu || saving || failedAutosaveVersion.current === editVersion.current) return undefined
    const version = editVersion.current
    const timeout = window.setTimeout(async () => {
      setSaving('draft')
      try {
        const savedMenu = await saveMenu(menu, { publish: false })
        if (editVersion.current === version) {
          setMenu(savedMenu)
          setDirty(false)
        }
        failedAutosaveVersion.current = null
      } catch {
        failedAutosaveVersion.current = version
        showToast('Não foi possível salvar o rascunho automaticamente.', 'error')
      } finally {
        setSaving((current) => current === 'draft' ? null : current)
      }
    }, 900)
    return () => window.clearTimeout(timeout)
  }, [dirty, menu, saveMenu, saving, showToast])

  function markChanged() {
    editVersion.current += 1
    failedAutosaveVersion.current = null
    setDirty(true)
  }

  function requestWeek(nextWeek) {
    if (dirty) setPendingWeek(nextWeek)
    else {
      setLoading(true)
      setWeekStart(nextWeek)
    }
  }

  async function handlePublish() {
    if (!menu) return
    setSaving('publish')
    try {
      const savedMenu = await saveMenu(menu, { publish: true })
      setMenu(savedMenu)
      setDirty(false)
      showToast('Cardápio publicado com sucesso.')
    } catch {
      showToast('Não foi possível publicar o cardápio.', 'error')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="builder-page page-stack">
      <section className="builder-toolbar">
        <WeekSelector value={weekStart} onChange={requestWeek} />
        <div className="builder-toolbar__actions">
          {saving === 'draft' ? <span className="draft-indicator"><Save size={14} /> Salvando rascunho...</span>
            : dirty ? <span className="unsaved-indicator"><i /> Salvamento automático pendente</span>
            : menu?.hasUnpublishedChanges ? <span className="draft-indicator"><Save size={14} /> Rascunho salvo</span>
              : menu?.status === 'published' ? <span className="published-indicator"><Check size={15} /> Publicado</span>
                : <span className="draft-indicator"><Save size={14} />{menu?.exists ? 'Rascunho salvo' : 'Rascunho'}</span>}
          <Link className="button button--secondary button--md" to="/admin/tabela"><Eye size={16} /> Visualizar tabela</Link>
          <Button onClick={handlePublish} disabled={!menu || Boolean(saving) || (!dirty && menu.status === 'published' && !menu.hasUnpublishedChanges)}><Globe2 size={17} />{saving === 'publish' ? 'Publicando...' : 'Publicar cardápio'}</Button>
        </div>
      </section>
      {loading || !menu ? <div className="builder-loading"><Loader label="Carregando a semana..." /></div> : (
        <>
          <section className="menu-pricing-card" aria-labelledby="menu-pricing-title">
            <div className="menu-pricing-card__heading">
              <span><CircleDollarSign size={19} /></span>
              <div><strong id="menu-pricing-title">Preços da semana</strong><small>Os valores serão exibidos no cardápio público após a publicação.</small></div>
            </div>
            <div className="menu-pricing-card__fields">
              <label>
                <span>Buffet</span>
                <div><small>R$</small><input type="number" min="0" step="0.01" inputMode="decimal" value={menu.prices?.buffet ?? ''} onChange={(event) => { setMenu((current) => ({ ...current, prices: { ...current.prices, buffet: event.target.value } })); markChanged() }} placeholder="0,00" aria-label="Preço do buffet" /></div>
              </label>
              <label>
                <span>Prato feito</span>
                <div><small>R$</small><input type="number" min="0" step="0.01" inputMode="decimal" value={menu.prices?.dailySpecial ?? ''} onChange={(event) => { setMenu((current) => ({ ...current, prices: { ...current.prices, dailySpecial: event.target.value } })); markChanged() }} placeholder="0,00" aria-label="Preço do prato feito" /></div>
              </label>
            </div>
          </section>
          <MenuBuilder
            key={menu.id}
            weekStart={weekStart}
            days={menu.days}
            dailySpecials={menu.dailySpecials}
            foods={foods}
            onChange={(days) => { setMenu((current) => ({ ...current, days })); markChanged() }}
            onDailySpecialChange={(day, value) => { setMenu((current) => ({ ...current, dailySpecials: { ...current.dailySpecials, [day]: value } })); markChanged() }}
          />
        </>
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
