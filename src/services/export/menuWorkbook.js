import { addDays, formatLongDate, formatWeekRange, fromISODate, getWeekStart, toISODate, WEEK_DAYS } from '../../domain/week.js'

const COLORS = { coffee: '#3B2021', coffeeLight: '#5B3031', orange: '#EE7900', green: '#389643', cream: '#FFF8EE', sand: '#F3E4D2', border: '#DDCDBB', muted: '#7D6C62', white: '#FFFFFF' }
const emptyMergedCells = (amount) => Array.from({ length: amount }, () => null)
const mergedRow = (value, style = {}) => [{ value, columnSpan: 4, ...style }, ...emptyMergedCells(3)]

function getStatusLabel(menu) {
  if (menu?.status !== 'published') return 'Rascunho'
  return menu.hasUnpublishedChanges ? 'Rascunho com alterações não publicadas' : 'Publicado'
}

function getPriceCell(value) {
  const amount = Number(value)
  return Number.isFinite(amount) ? { value: amount, format: '"R$" #,##0.00', fontWeight: 'bold', textColor: COLORS.coffee } : { value: 'Não informado', fontStyle: 'italic', textColor: COLORS.muted }
}

export function hasExportableMenuContent(menu) {
  if (!menu) return false
  const hasFoods = WEEK_DAYS.some(({ key }) => menu.days?.[key]?.length)
  const hasDailySpecial = WEEK_DAYS.some(({ key }) => String(menu.dailySpecials?.[key] || '').trim())
  const hasPrice = [menu.prices?.buffet, menu.prices?.dailySpecial].some((value) => value !== null && value !== undefined && value !== '')
  return Boolean(hasFoods || hasDailySpecial || hasPrice)
}

export function buildMenuWorkbook({ menu, foods, weekStart }) {
  const start = menu?.weekStart ? fromISODate(menu.weekStart) : getWeekStart(weekStart)
  const foodsById = new Map(foods.map((food) => [food.id, food]))
  const borderStyle = { borderColor: COLORS.border, borderStyle: 'thin' }
  const cellStyle = { ...borderStyle, alignVertical: 'top', wrap: true, height: 48 }
  const rows = WEEK_DAYS.map((day, index) => {
    const dayFoods = (menu?.days?.[day.key] || []).map((item) => foodsById.get(item.foodId)).filter(Boolean)
    return [
      { value: day.label, backgroundColor: index % 2 ? COLORS.sand : COLORS.cream, fontWeight: 'bold', textColor: COLORS.coffee, ...cellStyle },
      { value: formatLongDate(addDays(start, index)), backgroundColor: index % 2 ? COLORS.sand : COLORS.cream, textColor: COLORS.coffee, ...cellStyle },
      { value: String(menu?.dailySpecials?.[day.key] || '').trim() || '—', backgroundColor: '#FFF5E8', textColor: COLORS.coffeeLight, ...cellStyle },
      { value: dayFoods.length ? dayFoods.map((food) => food.name).join('\n') : '—', backgroundColor: index % 2 ? '#FFFCF8' : COLORS.white, textColor: dayFoods.length ? COLORS.coffee : COLORS.muted, ...cellStyle },
    ]
  })
  const data = [
    mergedRow('ROMANI CAFÉ — CARDÁPIO SEMANAL', { backgroundColor: COLORS.coffee, textColor: COLORS.white, fontSize: 18, fontWeight: 'bold', align: 'center', alignVertical: 'center', height: 34 }),
    mergedRow(`${formatWeekRange(start)}  •  ${getStatusLabel(menu)}`, { backgroundColor: COLORS.coffeeLight, textColor: COLORS.white, fontSize: 11, align: 'center', alignVertical: 'center', height: 25 }),
    Array(4).fill(null),
    mergedRow('VALORES DA SEMANA', { backgroundColor: COLORS.orange, textColor: COLORS.white, fontWeight: 'bold', align: 'center', alignVertical: 'center', height: 23 }),
    [{ value: 'Buffet', backgroundColor: COLORS.sand, textColor: COLORS.coffee, fontWeight: 'bold', ...borderStyle }, { ...getPriceCell(menu?.prices?.buffet), backgroundColor: COLORS.white, ...borderStyle }, { value: 'Prato feito', backgroundColor: COLORS.sand, textColor: COLORS.coffee, fontWeight: 'bold', ...borderStyle }, { ...getPriceCell(menu?.prices?.dailySpecial), backgroundColor: COLORS.white, ...borderStyle }],
    Array(4).fill(null),
    [{ value: 'Dia', backgroundColor: COLORS.green, textColor: COLORS.white, fontWeight: 'bold', align: 'center', ...borderStyle }, { value: 'Data', backgroundColor: COLORS.green, textColor: COLORS.white, fontWeight: 'bold', align: 'center', ...borderStyle }, { value: 'Prato feito', backgroundColor: COLORS.green, textColor: COLORS.white, fontWeight: 'bold', align: 'center', ...borderStyle }, { value: 'Alimentos do buffet', backgroundColor: COLORS.green, textColor: COLORS.white, fontWeight: 'bold', align: 'center', ...borderStyle }],
    ...rows,
  ]
  return { data, filename: `cardapio-romani-${menu?.weekStart || toISODate(start)}.xlsx`, options: { sheet: 'Cardápio semanal', columns: [{ width: 22 }, { width: 22 }, { width: 38 }, { width: 56 }], stickyRowsCount: 7, stickyColumnsCount: 1, orientation: 'landscape', showGridLines: false, zoomScale: 1 }, globalOptions: { fontFamily: 'Arial', fontSize: 10 } }
}
