import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CalendarCheck2, ChefHat, Plus, Sparkles, Utensils } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { getDayKey, getWeekStart, WEEK_DAYS } from '../../domain/week'
import Loader from '../../components/ui/Loader'

export default function DashboardPage() {
  const { foods, loading, subscribeMenu } = useData()
  const [menu, setMenu] = useState(null)
  const today = useMemo(() => new Date(), [])

  useEffect(() => subscribeMenu(getWeekStart(today), setMenu, () => setMenu(null)), [subscribeMenu, today])

  if (loading) return <Loader label="Preparando o painel..." />
  const todayKey = getDayKey(today)
  const todayInfo = WEEK_DAYS.find((day) => day.key === todayKey)
  const todayItems = menu?.days?.[todayKey] || []
  const filledDays = menu ? WEEK_DAYS.filter(({ key }) => menu.days[key]?.length).length : 0
  const getFood = (id) => foods.find((food) => food.id === id)

  return (
    <div className="dashboard page-stack">
      <section className="welcome-banner">
        <div><span className="eyebrow eyebrow--light">RESUMO DA SEMANA</span><h2>Olá, equipe Romani.</h2><p>Seu buffet está pronto para receber uma nova semana de sabores.</p></div>
        <Sparkles className="welcome-banner__sparkle" size={84} />
        <Link className="button button--cream button--md" to="/admin/cardapio">Montar cardápio <ArrowRight size={17} /></Link>
      </section>

      <section className="stat-grid">
        <article className="stat-card"><span className="stat-card__icon stat-card__icon--green"><Utensils size={20} /></span><div><strong>{foods.filter((food) => food.active).length}</strong><span>Alimentos ativos</span></div><Link to="/admin/alimentos"><Plus size={16} /></Link></article>
        <article className="stat-card"><span className="stat-card__icon stat-card__icon--blue"><CalendarCheck2 size={20} /></span><div><strong>{filledDays}<small>/7</small></strong><span>Dias planejados</span></div><Link to="/admin/cardapio"><ArrowRight size={16} /></Link></article>
      </section>

      <section className="dashboard-grid">
        <article className="surface-card today-summary">
          <header className="section-header"><div><span className="eyebrow">BUFFET DE HOJE</span><h3>{todayInfo.label}</h3></div><span className="count-pill">{todayItems.length} itens</span></header>
          {todayItems.length ? (
            <div className="today-summary__list">
              {todayItems.slice(0, 6).map((item) => {
                const food = getFood(item.foodId)
                return <div key={item.instanceId}><span><ChefHat size={17} /></span><div><strong>{food?.name || 'Alimento removido'}</strong></div></div>
              })}
            </div>
          ) : <div className="compact-empty"><ChefHat size={24} /><p>Nenhum alimento planejado para hoje.</p></div>}
          <Link className="text-link" to="/admin/cardapio">Editar cardápio <ArrowRight size={16} /></Link>
        </article>
        <article className="surface-card week-progress">
          <header className="section-header"><div><span className="eyebrow">PLANEJAMENTO</span><h3>Visão da semana</h3></div></header>
          <div className="week-progress__days">
            {WEEK_DAYS.map((day) => {
              const count = menu?.days?.[day.key]?.length || 0
              return <div key={day.key} className={count ? 'is-filled' : ''}><span>{day.short}</span><strong>{count}</strong><small>{count === 1 ? 'item' : 'itens'}</small></div>
            })}
          </div>
          <div className="week-progress__bar"><i style={{ width: `${(filledDays / 7) * 100}%` }} /></div>
          <p>{filledDays === 7 ? 'Semana completa. Tudo pronto!' : `Faltam ${7 - filledDays} dias para completar a semana.`}</p>
        </article>
      </section>
    </div>
  )
}
