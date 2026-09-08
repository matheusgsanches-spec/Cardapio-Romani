import { sortCategories } from '../../domain/menuPresentation.js'
import {
  addDays,
  formatShortDate,
  formatWeekRange,
  fromISODate,
  getWeekStart,
  toISODate,
  WEEK_DAYS,
} from '../../domain/week.js'

const COLORS = {
  coffee: '#3B2021',
  coffeeLight: '#5B3031',
  orange: '#EE7900',
  green: '#389643',
  cream: '#FFF8EE',
  sand: '#F3E4D2',
  border: '#DDCDBB',
  muted: '#7D6C62',
  white: '#FFFFFF',
}

const emptyMergedCells = (amount) => Array.from({ length: amount }, () => null)

function mergedRow(value, style = {}) {
  return [{ value, columnSpan: 8, ...style }, ...emptyMergedCells(7)]
}

function getStatusLabel(menu) {
  if (menu?.status !== 'published') return 'Rascunho'
  return menu.hasUnpublishedChanges ? 'Rascunho com alterações não publicadas' : 'Publicado'
}

function getPriceCell(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) {
    return { value: 'Não informado', fontStyle: 'italic', textColor: COLORS.muted }
  }
  return { value: amount, format: '"R$" #,##0.00', fontWeight: 'bold', textColor: COLORS.coffee }
}

function formatDayHeader(day, date) {
  return `${day.label}\n${formatShortDate(date)}`
}

function getCategoryRows(menu, foods, categories) {
  const foodsById = new Map(foods.map((food) => [food.id, food]))

  return sortCategories(categories)
    .map((category) => ({
      category,
      dayFoods: WEEK_DAYS.map(({ key }) => (menu?.days?.[key] || [])
        .map((entry) => foodsById.get(entry.foodId))
        .filter((food) => food?.categoryId === category.id)),
    }))
    .filter(({ dayFoods }) => dayFoods.some((foodsForDay) => foodsForDay.length > 0))
}

export function hasExportableMenuContent(menu) {
  if (!menu) return false
  const hasFoods = WEEK_DAYS.some(({ key }) => menu.days?.[key]?.length)
  const hasDailySpecial = WEEK_DAYS.some(({ key }) => String(menu.dailySpecials?.[key] || '').trim())
  const hasPrice = [menu.prices?.buffet, menu.prices?.dailySpecial]
    .some((value) => value !== null && value !== undefined && value !== '')
  return Boolean(hasFoods || hasDailySpecial || hasPrice)
}

export function buildMenuWorkbook({ menu, foods, categories, weekStart }) {
  const start = menu?.weekStart ? fromISODate(menu.weekStart) : getWeekStart(weekStart)
  const categoryRows = getCategoryRows(menu, foods, categories)
  const borderStyle = { borderColor: COLORS.border, borderStyle: 'thin' }
  const tableCellStyle = {
    ...borderStyle,
    alignVertical: 'top',
    wrap: true,
    height: 48,
  }
  const categoryCellStyle = {
    ...tableCellStyle,
    backgroundColor: COLORS.cream,
    fontWeight: 'bold',
    textColor: COLORS.coffee,
    alignVertical: 'center',
  }
  const dailySpecialCells = WEEK_DAYS.map(({ key }) => ({
    value: String(menu?.dailySpecials?.[key] || '').trim() || '—',
    ...tableCellStyle,
    backgroundColor: '#FFF5E8',
    textColor: COLORS.coffeeLight,
  }))

  const data = [
    mergedRow('ROMANI CAFÉ — CARDÁPIO SEMANAL', {
      backgroundColor: COLORS.coffee,
      textColor: COLORS.white,
      fontSize: 18,
      fontWeight: 'bold',
      align: 'center',
      alignVertical: 'center',
      height: 34,
    }),
    mergedRow(`${formatWeekRange(start)}  •  ${getStatusLabel(menu)}`, {
      backgroundColor: COLORS.coffeeLight,
      textColor: COLORS.white,
      fontSize: 11,
      align: 'center',
      alignVertical: 'center',
      height: 25,
    }),
    Array(8).fill(null),
    mergedRow('VALORES DA SEMANA', {
      backgroundColor: COLORS.orange,
      textColor: COLORS.white,
      fontWeight: 'bold',
      align: 'center',
      alignVertical: 'center',
      height: 23,
    }),
    [
      { value: 'Buffet', backgroundColor: COLORS.sand, textColor: COLORS.coffee, fontWeight: 'bold', ...borderStyle },
      { ...getPriceCell(menu?.prices?.buffet), columnSpan: 3, backgroundColor: COLORS.white, ...borderStyle },
      null,
      null,
      { value: 'Prato feito', backgroundColor: COLORS.sand, textColor: COLORS.coffee, fontWeight: 'bold', ...borderStyle },
      { ...getPriceCell(menu?.prices?.dailySpecial), columnSpan: 3, backgroundColor: COLORS.white, ...borderStyle },
      null,
      null,
    ],
    Array(8).fill(null),
    [
      { value: 'Categoria', backgroundColor: COLORS.green, textColor: COLORS.white, fontWeight: 'bold', align: 'center', alignVertical: 'center', height: 33, ...borderStyle },
      ...WEEK_DAYS.map((day, index) => ({
        value: formatDayHeader(day, addDays(start, index)),
        backgroundColor: COLORS.green,
        textColor: COLORS.white,
        fontWeight: 'bold',
        align: 'center',
        alignVertical: 'center',
        wrap: true,
        height: 33,
        ...borderStyle,
      })),
    ],
    [
      { value: 'Prato feito do dia', ...categoryCellStyle, textColor: COLORS.orange },
      ...dailySpecialCells,
    ],
    ...categoryRows.map(({ category, dayFoods }, rowIndex) => [
      {
        value: category.name,
        ...categoryCellStyle,
        backgroundColor: rowIndex % 2 === 0 ? COLORS.cream : COLORS.sand,
      },
      ...dayFoods.map((foodsForDay) => ({
        value: foodsForDay.length ? foodsForDay.map((food) => food.name).join('\n') : '—',
        ...tableCellStyle,
        backgroundColor: rowIndex % 2 === 0 ? COLORS.white : '#FFFCF8',
        textColor: foodsForDay.length ? COLORS.coffee : COLORS.muted,
      })),
    ]),
  ]

  return {
    data,
    filename: `cardapio-romani-${menu?.weekStart || toISODate(start)}.xlsx`,
    options: {
      sheet: 'Cardápio semanal',
      columns: [{ width: 26 }, ...WEEK_DAYS.map(() => ({ width: 24 }))],
      stickyRowsCount: 7,
      stickyColumnsCount: 1,
      orientation: 'landscape',
      showGridLines: false,
      zoomScale: 0.85,
    },
    globalOptions: {
      fontFamily: 'Arial',
      fontSize: 10,
    },
  }
}
