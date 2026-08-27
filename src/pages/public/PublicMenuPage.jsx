import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Clock3, RefreshCw, WifiOff } from 'lucide-react'
import PublicDailyMenu from '../../components/public/PublicDailyMenu'
import PublicMenuSkeleton from '../../components/public/PublicMenuSkeleton'
import { restaurantConfig } from '../../config/restaurant'
import { getDateInTimeZone, getDayKey, WEEK_DAYS } from '../../domain/week'
import { dataRepository } from '../../services/dataRepository'

export default function PublicMenuPage() {
  const [requestKey, setRequestKey] = useState(0)
  const [state, setState] = useState({ status: 'loading', data: null })
  const today = useMemo(() => getDateInTimeZone(new Date(), restaurantConfig.timeZone), [])
  const day = WEEK_DAYS.find((entry) => entry.key === getDayKey(today))

  useEffect(() => {
    let active = true
    dataRepository.getPublicDailyMenu(today)
      .then((data) => active && setState({ status: 'ready', data }))
      .catch((error) => {
        if (import.meta.env.DEV) console.error('Falha ao carregar o cardápio público:', error)
        if (active) setState({ status: 'error', data: null })
      })
    return () => { active = false }
  }, [requestKey, today])

  function retry() {
    setState({ status: 'loading', data: null })
    setRequestKey((current) => current + 1)
  }

  const content = state.data
  return (
    <main className="public-page">
      <header className="public-header">
        <a href="/menu" className="public-brand" aria-label={`Cardápio ${restaurantConfig.name}`}>
          <span className="brand-mark brand-mark--light"><BookOpen size={20} /></span>
          <div><strong>{restaurantConfig.name.toLocaleUpperCase('pt-BR')}</strong><small>{restaurantConfig.tagline.toLocaleUpperCase('pt-BR')}</small></div>
        </a>
        {restaurantConfig.serviceHours && <span className="public-service-hours"><Clock3 size={15} /> {restaurantConfig.serviceHours}</span>}
      </header>

      <div className="public-page__content">
        {state.status === 'loading' && <PublicMenuSkeleton />}
        {state.status === 'error' && (
          <section className="public-empty public-empty--error">
            <span><WifiOff size={28} /></span>
            <h2>Não foi possível carregar o cardápio agora.</h2>
            <p>Verifique sua conexão e tente novamente.</p>
            <button className="button button--primary button--md" type="button" onClick={retry}><RefreshCw size={16} /> Tentar novamente</button>
          </section>
        )}
        {state.status === 'ready' && (
          <PublicDailyMenu
            day={day}
            date={today}
            items={content?.items || []}
            foods={content?.foods || []}
            categories={content?.categories || []}
          />
        )}
      </div>

      <footer className="public-footer public-footer--simple">
        <span className="public-brand public-brand--footer">
          <span className="brand-mark brand-mark--light"><BookOpen size={18} /></span>
          <span><strong>{restaurantConfig.name.toLocaleUpperCase('pt-BR')}</strong><small>{restaurantConfig.tagline.toLocaleUpperCase('pt-BR')}</small></span>
        </span>
      </footer>
    </main>
  )
}
