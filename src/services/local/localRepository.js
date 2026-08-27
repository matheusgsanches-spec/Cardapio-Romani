import { getDayKey, normalizeMenu, serializeMenuDays } from '../../domain/week.js'

const KEYS = {
  categories: 'romani_dev_categories',
  foods: 'romani_dev_foods',
  menus: 'romani_dev_menus',
  publishedMenus: 'romani_dev_published_menus',
}

const seedCategories = [
  ['cat-arroz', 'Arroz'],
  ['cat-feijao', 'Feijão'],
  ['cat-proteinas', 'Proteínas'],
  ['cat-massas', 'Massas'],
  ['cat-saladas', 'Saladas'],
  ['cat-acompanhamentos', 'Acompanhamentos'],
  ['cat-sobremesas', 'Sobremesas'],
].map(([id, name], index) => ({ id, name, active: true, order: index + 1 }))

const seedFoods = [
  ['Arroz branco', 'cat-arroz', 'Arroz soltinho preparado diariamente'],
  ['Arroz integral', 'cat-arroz', ''],
  ['Feijão preto', 'cat-feijao', ''],
  ['Feijão carioca', 'cat-feijao', ''],
  ['Carne suína assada', 'cat-proteinas', 'Assada lentamente com ervas'],
  ['Frango grelhado', 'cat-proteinas', ''],
  ['Peixe ao forno', 'cat-proteinas', ''],
  ['Lasanha à bolonhesa', 'cat-massas', ''],
  ['Batata rústica', 'cat-acompanhamentos', ''],
  ['Farofa da casa', 'cat-acompanhamentos', ''],
  ['Salada verde', 'cat-saladas', 'Folhas frescas selecionadas'],
  ['Salada mista', 'cat-saladas', ''],
  ['Pudim de leite', 'cat-sobremesas', ''],
  ['Mousse de maracujá', 'cat-sobremesas', ''],
].map(([name, categoryId, description], index) => ({
  id: `food-${index + 1}`,
  name,
  categoryId,
  description,
  active: true,
}))

const listeners = { categories: new Set(), foods: new Set(), menus: new Set(), publishedMenus: new Set() }

function read(key, fallback) {
  try {
    const value = localStorage.getItem(KEYS[key])
    if (value) return JSON.parse(value)
  } catch {
    // The fallback keeps development mode usable when storage is unavailable.
  }
  return fallback
}

function write(key, value) {
  localStorage.setItem(KEYS[key], JSON.stringify(value))
  listeners[key].forEach((listener) => listener(value))
}

function subscribe(key, fallback, onData) {
  const listener = (value) => onData(value)
  listeners[key].add(listener)
  queueMicrotask(() => onData(read(key, fallback)))
  return () => listeners[key].delete(listener)
}

function saveEntity(key, entity, fallback) {
  const values = read(key, fallback)
  const id = entity.id || `${key.slice(0, -1)}-${crypto.randomUUID()}`
  const payload = { ...entity, id, name: entity.name.trim(), updatedAt: new Date().toISOString() }
  const index = values.findIndex((item) => item.id === id)
  if (index >= 0) values[index] = payload
  else values.push({ ...payload, createdAt: new Date().toISOString() })
  write(key, [...values].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')))
  return Promise.resolve(id)
}

export const localRepository = {
  subscribeCategories: (onData) => subscribe('categories', seedCategories, onData),
  subscribeFoods: (onData) => subscribe('foods', seedFoods, onData),
  saveCategory: (category) => saveEntity('categories', category, seedCategories),
  saveFood: (food) => saveEntity('foods', food, seedFoods),

  async getMenu(weekStart) {
    const empty = normalizeMenu(null, weekStart)
    return normalizeMenu(read('menus', {})[empty.id], weekStart)
  },

  async getPublicDailyMenu(date) {
    const normalized = normalizeMenu(null, date)
    const menus = read('menus', {})
    const publishedMenus = read('publishedMenus', {})
    const legacyMenu = menus[normalized.id]
    const publicMenu = publishedMenus[normalized.id]
      || (legacyMenu?.status === 'published' && legacyMenu.days && !legacyMenu.draftDays ? legacyMenu : null)
    if (!publicMenu) return { menu: null, items: [], foods: [], categories: [] }

    const items = [...(publicMenu.days?.[getDayKey(date)] || [])]
      .sort((first, second) => (first.order ?? 0) - (second.order ?? 0))
    const foodIds = new Set(items.map((item) => item.foodId))
    const foods = read('foods', seedFoods).filter((food) => foodIds.has(food.id))
    const categoryIds = new Set(foods.map((food) => food.categoryId))
    const categories = read('categories', seedCategories).filter((category) => categoryIds.has(category.id))
    return { menu: publicMenu, items, foods, categories }
  },

  subscribeMenu(weekStart, onData) {
    const empty = normalizeMenu(null, weekStart)
    const emit = (menus) => onData(normalizeMenu(menus[empty.id], weekStart))
    return subscribe('menus', {}, emit)
  },

  async saveMenu(menu, { publish = false } = {}) {
    const menus = read('menus', {})
    const existing = menus[menu.id]
    const hadPublishedVersion = existing?.status === 'published'
    const draftDays = serializeMenuDays(menu.days)
    const nextStatus = publish || hadPublishedVersion ? 'published' : 'draft'
    const hasUnpublishedChanges = !publish && hadPublishedVersion
    const now = new Date().toISOString()
    menus[menu.id] = {
      ...existing,
      id: menu.id,
      weekStart: menu.weekStart,
      weekEnd: menu.weekEnd,
      status: nextStatus,
      draftDays,
      hasUnpublishedChanges,
      updatedAt: now,
      ...(publish ? { publishedAt: now } : {}),
      ...(!existing ? { createdAt: now } : {}),
    }
    write('menus', menus)

    const legacyPublishedDays = hadPublishedVersion && existing?.days && !existing?.draftDays
      ? existing.days
      : null
    const publicDays = publish ? draftDays : legacyPublishedDays
    if (publicDays) {
      const publishedMenus = read('publishedMenus', {})
      publishedMenus[menu.id] = {
        id: menu.id,
        weekStart: menu.weekStart,
        weekEnd: menu.weekEnd,
        status: 'published',
        days: publicDays,
        publishedAt: publish ? now : existing?.updatedAt || now,
        updatedAt: now,
      }
      write('publishedMenus', publishedMenus)
    }

    return { ...menu, status: nextStatus, hasUnpublishedChanges, exists: true, days: draftDays }
  },
}
