import { Beef, ChefHat, CookingPot, IceCreamBowl, Leaf, Soup, UtensilsCrossed, Wheat } from 'lucide-react'
import { formatPublicDate } from '../../domain/week'
import { groupDailyFoods } from '../../domain/menuPresentation'

const categoryIcons = [Wheat, Soup, Beef, CookingPot, Leaf, UtensilsCrossed, IceCreamBowl]
const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export default function PublicDailyMenu({ day, date, items, foods, categories, dailySpecial, prices }) {
  const groups = groupDailyFoods(items, foods, categories)
  const visiblePrices = [
    { key: 'buffet', label: 'Buffet', value: prices?.buffet },
    { key: 'dailySpecial', label: 'Prato feito', value: prices?.dailySpecial },
  ].filter(({ value }) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)))

  return (
    <>
      <section className="public-hero">
        <span className="public-hero__line" />
        <span className="eyebrow eyebrow--gold">BUFFET DE HOJE</span>
        <h1>{day.label}</h1>
        <p>{formatPublicDate(date)}</p>
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
      {dailySpecial && (
        <article className="public-daily-special">
          <span><ChefHat size={24} /></span>
          <div><small>PRATO FEITO DO DIA</small><p>{dailySpecial}</p></div>
        </article>
      )}
      {groups.length ? (
        <section className="public-menu-grid">
          {groups.map(({ category, foods: groupFoods }, index) => {
            const Icon = categoryIcons[index % categoryIcons.length]
            return (
            <article className="public-category" key={category.id}>
              <header><span><Icon size={20} /></span><h2>{category.name}</h2><i /></header>
              <div>
                {groupFoods.map((food) => (
                  <div className="public-food" key={food.id}>
                    <strong>{food.name}</strong>
                    {food.description && <p>{food.description}</p>}
                  </div>
                ))}
              </div>
            </article>
            )
          })}
        </section>
      ) : !dailySpecial ? (
        <section className="public-empty">
          <span><CookingPot size={30} /></span>
          <h2>Cardápio de hoje ainda não disponível.</h2>
          <p>Consulte novamente em breve.</p>
        </section>
      ) : null}
    </>
  )
}
