import { toISODate } from '../domain/week'

const CACHE_PREFIX = 'romani:public-menu:'
const MAX_CACHED_DAYS = 8

function getCacheKey(date) {
  return `${CACHE_PREFIX}${toISODate(date)}`
}

function createSnapshot(data) {
  return {
    cachedAt: new Date().toISOString(),
    items: (data?.items || []).map(({ id, foodId, order }) => ({ id, foodId, order })),
    foods: (data?.foods || []).map(({ id, name, description, categoryId }) => ({
      id,
      name,
      description,
      categoryId,
    })),
    categories: (data?.categories || []).map(({ id, name, order }) => ({ id, name, order })),
    dailySpecial: String(data?.dailySpecial || ''),
    prices: {
      buffet: data?.prices?.buffet ?? null,
      dailySpecial: data?.prices?.dailySpecial ?? null,
    },
  }
}

export function cachePublicMenu(date, data) {
  try {
    localStorage.setItem(getCacheKey(date), JSON.stringify(createSnapshot(data)))
    Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
      .filter(Boolean)
      .filter((key) => key.startsWith(CACHE_PREFIX))
      .sort()
      .slice(0, -MAX_CACHED_DAYS)
      .forEach((key) => localStorage.removeItem(key))
  } catch {
    // O cache é um recurso complementar; o cardápio online continua funcionando sem ele.
  }
}

export function getCachedPublicMenu(date) {
  try {
    const cached = JSON.parse(localStorage.getItem(getCacheKey(date)))
    if (!cached || !Array.isArray(cached.items) || !Array.isArray(cached.foods) || !Array.isArray(cached.categories)) {
      return null
    }
    return cached
  } catch {
    return null
  }
}
