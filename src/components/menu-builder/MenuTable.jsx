import { ClipboardList } from 'lucide-react'
import { WEEK_DAYS } from '../../domain/week'
import EmptyState from '../ui/EmptyState'

export default function MenuTable({ menu, foods, categories }) {
  const activeRows = categories
    .map((category) => ({
      category,
      days: Object.fromEntries(WEEK_DAYS.map(({ key }) => [key, (menu?.days?.[key] || [])
        .map((entry) => foods.find((food) => food.id === entry.foodId))
        .filter((food) => food?.categoryId === category.id)])),
    }))
    .filter((row) => WEEK_DAYS.some(({ key }) => row.days[key].length))

  if (!activeRows.length) return <EmptyState icon={ClipboardList} title="Cardápio ainda vazio" description="Adicione alimentos no construtor para gerar a tabela desta semana." />
  return (
    <div className="menu-table-scroll">
      <table className="menu-table">
        <thead><tr><th>Categoria</th>{WEEK_DAYS.map((day) => <th key={day.key}><span>{day.short}</span><small>{day.label}</small></th>)}</tr></thead>
        <tbody>
          {activeRows.map(({ category, days }, index) => (
            <tr key={category.id}>
              <th><i style={{ '--row-hue': [137, 38, 206, 8, 169, 219, 326][index % 7] }} />{category.name}</th>
              {WEEK_DAYS.map((day) => <td key={day.key}>{days[day.key].length ? days[day.key].map((food) => <span key={food.id}>{food.name}</span>) : <em>—</em>}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
