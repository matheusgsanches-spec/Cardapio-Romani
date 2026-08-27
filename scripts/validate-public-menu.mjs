import assert from 'node:assert/strict'

const memory = new Map()
globalThis.localStorage = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => memory.set(key, String(value)),
  removeItem: (key) => memory.delete(key),
  clear: () => memory.clear(),
}

const {
  getDateInTimeZone,
  getDayKey,
  getWeekId,
  normalizeMenu,
} = await import('../src/domain/week.js')
const { groupDailyFoods } = await import('../src/domain/menuPresentation.js')
const { localRepository } = await import('../src/services/local/localRepository.js')

const monday = new Date('2026-08-24T12:00:00-03:00')
const sunday = new Date('2026-08-30T12:00:00-03:00')

assert.equal(getDayKey(monday), 'monday')
assert.equal(getDayKey(sunday), 'sunday')
assert.equal(getWeekId(monday), '2026-08-24')
assert.equal(getWeekId(sunday), '2026-08-24')
assert.equal(getWeekId(new Date('2027-01-01T12:00:00-03:00')), '2026-12-28')
assert.equal(getDateInTimeZone(new Date('2026-08-25T02:00:00Z'), 'America/Sao_Paulo').getDate(), 24)

const emptyMenu = normalizeMenu(null, monday)
assert.equal(emptyMenu.status, 'draft')
assert.equal(emptyMenu.days.monday.length, 0)

const draftMenu = {
  ...emptyMenu,
  days: {
    ...emptyMenu.days,
    monday: [
      { instanceId: 'one', foodId: 'food-1', order: 0 },
      { instanceId: 'two', foodId: 'food-2', order: 1 },
    ],
    tuesday: [{ instanceId: 'three', foodId: 'food-3', order: 0 }],
  },
}

await localRepository.saveMenu(draftMenu, { publish: false })
let publicResult = await localRepository.getPublicDailyMenu(monday)
assert.equal(publicResult.menu, null, 'Rascunhos novos não podem aparecer publicamente')

await localRepository.saveMenu(draftMenu, { publish: true })
publicResult = await localRepository.getPublicDailyMenu(monday)
assert.equal(publicResult.items.length, 2, 'Segunda publicada deve carregar seus dois itens')
assert.deepEqual(publicResult.items.map((item) => item.foodId), ['food-1', 'food-2'])

const groups = groupDailyFoods(publicResult.items, publicResult.foods, [
  { id: 'cat-feijao', name: 'Feijão', order: 2 },
  { id: 'cat-arroz', name: 'Arroz', order: 1 },
])
assert.equal(groups[0].category.name, 'Arroz')
assert.equal(groups[0].foods.length, 2, 'Vários alimentos da categoria devem permanecer agrupados')

const changedDraft = {
  ...draftMenu,
  status: 'published',
  days: { ...draftMenu.days, monday: [{ instanceId: 'three', foodId: 'food-3', order: 0 }] },
}
await localRepository.saveMenu(changedDraft, { publish: false })
publicResult = await localRepository.getPublicDailyMenu(monday)
assert.deepEqual(publicResult.items.map((item) => item.foodId), ['food-1', 'food-2'], 'Salvar rascunho deve preservar o snapshot publicado')

await localRepository.saveMenu(changedDraft, { publish: true })
publicResult = await localRepository.getPublicDailyMenu(monday)
assert.deepEqual(publicResult.items.map((item) => item.foodId), ['food-3'], 'Publicar deve substituir o snapshot por um único item')

const weekendResult = await localRepository.getPublicDailyMenu(sunday)
assert.equal(weekendResult.items.length, 0, 'Domingo sem itens deve retornar estado vazio, não fechamento presumido')

memory.clear()
const newWeekResult = await localRepository.getPublicDailyMenu(new Date('2026-08-31T12:00:00-03:00'))
assert.equal(newWeekResult.menu, null, 'Semana nova sem dados deve retornar indisponível')

console.log('10 cenários de domínio e publicação validados com sucesso.')
