export const WEEK_DAYS = [
  { key: 'monday', label: 'Segunda-feira', short: 'Seg' },
  { key: 'tuesday', label: 'Terça-feira', short: 'Ter' },
  { key: 'wednesday', label: 'Quarta-feira', short: 'Qua' },
  { key: 'thursday', label: 'Quinta-feira', short: 'Qui' },
  { key: 'friday', label: 'Sexta-feira', short: 'Sex' },
  { key: 'saturday', label: 'Sábado', short: 'Sáb' },
  { key: 'sunday', label: 'Domingo', short: 'Dom' },
]

const pad = (value) => String(value).padStart(2, '0')

export function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function fromISODate(value) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day, 12)
}

export function getWeekStart(input = new Date()) {
  const date = new Date(input)
  date.setHours(12, 0, 0, 0)
  const offset = date.getDay() === 0 ? -6 : 1 - date.getDay()
  date.setDate(date.getDate() + offset)
  return date
}

export function addDays(input, amount) {
  const date = new Date(input)
  date.setDate(date.getDate() + amount)
  return date
}

export function addWeeks(input, amount) {
  return addDays(input, amount * 7)
}

export function getWeekId(input = new Date()) {
  return toISODate(getWeekStart(input))
}

export function getWeekEnd(input) {
  return addDays(getWeekStart(input), 6)
}

export function getDayKey(input = new Date()) {
  const index = input.getDay() === 0 ? 6 : input.getDay() - 1
  return WEEK_DAYS[index].key
}

export function getDateInTimeZone(input = new Date(), timeZone) {
  if (!timeZone) {
    const localDate = new Date(input)
    localDate.setHours(12, 0, 0, 0)
    return localDate
  }
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(input)
  const getPart = (type) => Number(parts.find((part) => part.type === type)?.value)
  return new Date(getPart('year'), getPart('month') - 1, getPart('day'), 12)
}

export function emptyDays() {
  return Object.fromEntries(WEEK_DAYS.map(({ key }) => [key, []]))
}

export function formatShortDate(date) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
    .format(date)
    .replace('.', '')
    .replace(/\sDE\s/i, ' ')
    .toUpperCase()
}

export function formatLongDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatPublicDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
  }).format(date)
}

export function formatWeekRange(weekStart) {
  const start = getWeekStart(weekStart)
  return `${formatShortDate(start)} — ${formatShortDate(getWeekEnd(start))}`
}

export function normalizeMenu(menu, weekStart) {
  const start = getWeekStart(weekStart)
  const status = menu?.status || (menu ? 'published' : 'draft')
  const sourceDays = menu?.draftDays || menu?.days || emptyDays()
  const days = Object.fromEntries(WEEK_DAYS.map(({ key }) => [
    key,
    [...(sourceDays[key] || [])]
      .sort((first, second) => (first.order ?? 0) - (second.order ?? 0))
      .map((item, order) => ({ ...item, order })),
  ]))
  return {
    id: getWeekId(start),
    weekStart: toISODate(start),
    weekEnd: toISODate(getWeekEnd(start)),
    status,
    days,
    publishedDays: menu?.publishedDays || (status === 'published' ? menu?.days : undefined),
    hasUnpublishedChanges: Boolean(menu?.hasUnpublishedChanges),
    exists: Boolean(menu),
  }
}

export function serializeMenuDays(days) {
  return Object.fromEntries(WEEK_DAYS.map(({ key }) => [
    key,
    (days[key] || []).map((item, order) => ({
      instanceId: item.instanceId,
      foodId: item.foodId,
      order,
    })),
  ]))
}
