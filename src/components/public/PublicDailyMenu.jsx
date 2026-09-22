import { ChefHat, CookingPot, UtensilsCrossed } from 'lucide-react'
import { formatPublicDate, formatWeekRange } from '../../domain/week'

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function getDayFoods(items, foods) {
  const foodsById = new Map(foods.map((food) => [food.id, food]))
  return items.map((item) => foodsById.get(item.foodId)).filter(Boolean)
}

export default function PublicDailyMenu({ weekStart, days, prices }) {
  const visiblePrices = [
    { key: 'buffet', label: 'Buffet', value: prices?.buffet },
    { key: 'dailySpecial', label: 'Prato feito', value: prices?.dailySpecial },
  ].filter(({ value }) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)))

  return (
    <>
      <section className="public-hero">
        <span className="public-hero__line" />
        <span className="eyebrow eyebrow--gold">CARDÁPIO DA SEMANA</span>
        <h1>Sabores da semana</h1>
        <p>{formatWeekRange(weekStart)}</p>
        <div className="public-hero__ornament"><i /><ChefHat size={21} /><i /></div>
      </section>

      {visiblePrices.length > 0 && (
        <section className="public-prices" aria-label="Preços do cardápio">
          {visiblePrices.map(({ key, label, value }) => (
            <article key={key}>
              <span>{label}</span>
              <strong>{currencyFormatter.format(Number(value))}</strong>
            </article>
          ))}
        </section>
      )}

      <section className="public-week-grid" aria-label="Cardápio completo da semana">
        {days.map(({ day, date, items, foods, dailySpecial, isToday }) => {
          const dayFoods = getDayFoods(items, foods)
          return (
            <article className={`public-day-card ${isToday ? 'public-day-card--today' : ''}`} key={day.key}>
              <header className="public-day-card__header">
                <div>
                  <span>{day.label}</span>
                  <small>{formatPublicDate(date)}</small>
                </div>
                {isToday && <strong>HOJE</strong>}
              </header>

              {dailySpecial && (
                <div className="public-day-card__special">
                  <ChefHat size={17} />
                  <div><small>PRATO FEITO</small><p>{dailySpecial}</p></div>
                </div>
              )}

              {dayFoods.length > 0 ? (
                <div className="public-day-card__foods">
                  <div className="public-day-card__foods-title"><UtensilsCrossed size={15} /> Buffet</div>
                  {dayFoods.map((food) => (
                    <div className="public-food" key={food.id}>
                      <strong>{food.name}</strong>
                      {food.description && <p>{food.description}</p>}
                    </div>
                  ))}
                </div>
              ) : !dailySpecial ? (
                <div className="public-day-card__empty"><CookingPot size={19} /><span>Cardápio em breve</span></div>
              ) : null}
            </article>
          )
        })}
      </section>
    </>
  )
}
