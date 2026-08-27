import { Beef, ChefHat, CookingPot, IceCreamBowl, Leaf, Soup, UtensilsCrossed, Wheat } from 'lucide-react'
import { formatPublicDate } from '../../domain/week'
import { groupDailyFoods } from '../../domain/menuPresentation'

const categoryIcons = [Wheat, Soup, Beef, CookingPot, Leaf, UtensilsCrossed, IceCreamBowl]

export default function PublicDailyMenu({ day, date, items, foods, categories }) {
  const groups = groupDailyFoods(items, foods, categories)

  return (
    <>
      <section className="public-hero">
        <span className="public-hero__line" />
        <span className="eyebrow eyebrow--gold">BUFFET DE HOJE</span>
        <h1>{day.label}</h1>
        <p>{formatPublicDate(date)}</p>
        <div className="public-hero__ornament"><i /><ChefHat size={21} /><i /></div>
      </section>
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
      ) : (
        <section className="public-empty">
          <span><CookingPot size={30} /></span>
          <h2>Cardápio de hoje ainda não disponível.</h2>
          <p>Consulte novamente em breve.</p>
        </section>
      )}
    </>
  )
}
