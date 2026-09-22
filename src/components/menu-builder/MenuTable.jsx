import { ClipboardList } from 'lucide-react'
import { addDays, formatLongDate, WEEK_DAYS } from '../../domain/week'
import EmptyState from '../ui/EmptyState'

export default function MenuTable({ menu, foods, weekStart }) {
  const foodsById = new Map(foods.map((food) => [food.id, food]))
  const rows = WEEK_DAYS.map((day, index) => {
    const items = menu?.days?.[day.key] || []
    return {
      day,
      date: addDays(weekStart, index),
      dailySpecial: menu?.dailySpecials?.[day.key] || '',
      foods: items.map((item) => foodsById.get(item.foodId)).filter(Boolean),
    }
  })

  if (!rows.some((row) => row.foods.length || row.dailySpecial)) {
    return <EmptyState icon={ClipboardList} title="Cardápio ainda vazio" description="Adicione alimentos no construtor para gerar a tabela desta semana." />
  }

  return (
    <div className="menu-table-scroll">
      <table className="menu-table">
        <thead><tr><th>Dia</th><th>Data</th><th>Prato feito</th><th>Alimentos do buffet</th></tr></thead>
        <tbody>
          {rows.map(({ day, date, dailySpecial, foods: dayFoods }) => (
            <tr key={day.key}>
              <th><strong>{day.label}</strong><small>{day.short}</small></th>
              <td>{formatLongDate(date)}</td>
              <td>{dailySpecial || <em>—</em>}</td>
              <td>{dayFoods.length ? dayFoods.map((food) => <span key={food.id}>{food.name}</span>) : <em>—</em>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
