import { useEffect, useMemo, useState } from 'react'
import { Clock3, RefreshCw, WifiOff } from 'lucide-react'
import PublicDailyMenu from '../../components/public/PublicDailyMenu'
import PublicMenuSkeleton from '../../components/public/PublicMenuSkeleton'
import BrandLogo from '../../components/ui/BrandLogo'
import { restaurantConfig } from '../../config/restaurant'
import { addDays, getDateInTimeZone, getDayKey, getWeekStart, WEEK_DAYS } from '../../domain/week'
import { dataRepository } from '../../services/dataRepository'
import { cachePublicMenu, getCachedPublicMenu } from '../../services/publicMenuCache'

export default function PublicMenuPage() {
  const [requestKey, setRequestKey] = useState(0)
  const [state, setState] = useState({ status: 'loading', data: null })
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const today = useMemo(() => getDateInTimeZone(new Date(), restaurantConfig.timeZone), [])
  const weekStart = useMemo(() => getWeekStart(today), [today])
  const todayKey = getDayKey(today)
  const weekDates = useMemo(() => WEEK_DAYS.map((day, index) => ({ day, date: addDays(weekStart, index) })), [weekStart])

  useEffect(() => {
    let active = true
    Promise.all(weekDates.map(async ({ day, date }) => {
      try {
        const data = await dataRepository.getPublicDailyMenu(date)
        cachePublicMenu(date, data)
        return { day, date, ...data, source: 'network', isToday: day.key === todayKey }
      } catch (error) {
        if (import.meta.env.DEV) console.error(`Falha ao carregar ${day.label}:`, error)
        const cached = getCachedPublicMenu(date)
        return cached
          ? { day, date, ...cached, source: 'cache', isToday: day.key === todayKey }
          : { day, date, items: [], foods: [], dailySpecial: '', prices: null, source: 'unavailable', isToday: day.key === todayKey }
      }
    })).then((days) => {
      if (!active) return
      const available = days.some((entry) => entry.source !== 'unavailable')
      if (!available) {
        setState({ status: 'error', data: null })
        return
      }
      const prices = days.find((entry) => entry.prices)?.prices || null
      setState({ status: 'ready', data: { days, prices }, source: days.some((entry) => entry.source === 'cache') ? 'cache' : 'network' })
    })
    return () => { active = false }
  }, [requestKey, todayKey, weekDates])

  useEffect(() => {
    const updateConnection = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', updateConnection)
    window.addEventListener('offline', updateConnection)
    return () => {
      window.removeEventListener('online', updateConnection)
      window.removeEventListener('offline', updateConnection)
    }
  }, [])

  function retry() {
    setState({ status: 'loading', data: null })
    setRequestKey((current) => current + 1)
  }

  const content = state.data
  return (
    <main className="public-page">
      <header className="public-header">
        <a href="/menu" className="public-brand" aria-label={`Cardápio ${restaurantConfig.name}`}>
          <BrandLogo className="brand-logo--public" alt="" />
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
          <>
            {(!isOnline || state.source === 'cache') && (
              <div className="public-offline-notice" role="status">
                <WifiOff size={16} />
                <span>{state.source === 'cache' ? 'Último cardápio salvo neste dispositivo.' : 'Sem conexão. O cardápio já carregado continua disponível.'}</span>
              </div>
            )}
            <PublicDailyMenu weekStart={weekStart} days={content?.days || []} prices={content?.prices} />
          </>
        )}
      </div>

      <footer className="public-footer public-footer--simple">
        <span className="public-brand public-brand--footer">
          <BrandLogo className="brand-logo--footer" alt="" />
          <span><strong>{restaurantConfig.name.toLocaleUpperCase('pt-BR')}</strong><small>{restaurantConfig.tagline.toLocaleUpperCase('pt-BR')}</small></span>
        </span>
      </footer>
    </main>
  )
}
