import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from './config'
import { getDayKey, normalizeMenu, serializeDailySpecials, serializeMenuDays, serializeMenuPrices } from '../../domain/week'

const mapSnapshot = (snapshot) => snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))

function subscribeToCollection(name, onData, onError) {
  return onSnapshot(query(collection(db, name), orderBy('name')), (snapshot) => onData(mapSnapshot(snapshot)), onError)
}

async function saveEntity(collectionName, entity) {
  const payload = {
    name: entity.name.trim(),
    active: entity.active ?? true,
    updatedAt: serverTimestamp(),
  }

  if (collectionName === 'foods') {
    payload.description = entity.description?.trim() || ''
  }

  if (collectionName === 'categories') {
    payload.order = Number.isFinite(Number(entity.order)) ? Number(entity.order) : 999
  }

  if (entity.id) {
    await updateDoc(doc(db, collectionName, entity.id), payload)
    return entity.id
  }

  const result = await addDoc(collection(db, collectionName), { ...payload, createdAt: serverTimestamp() })
  return result.id
}

export const firestoreRepository = {
  subscribeCategories: (onData, onError) => subscribeToCollection('categories', onData, onError),
  subscribeFoods: (onData, onError) => subscribeToCollection('foods', onData, onError),
  saveCategory: (category) => saveEntity('categories', category),
  saveFood: (food) => saveEntity('foods', food),

  async getMenu(weekStart) {
    const normalized = normalizeMenu(null, weekStart)
    const snapshot = await getDoc(doc(db, 'menus', normalized.id))
    return normalizeMenu(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null, weekStart)
  },

  async getPublicDailyMenu(date) {
    const normalized = normalizeMenu(null, date)
    const publicSnapshot = await getDoc(doc(db, 'publishedMenus', normalized.id))
    let publicMenu = publicSnapshot.exists() ? { id: publicSnapshot.id, ...publicSnapshot.data() } : null

    if (!publicMenu) {
      try {
        const legacySnapshot = await getDoc(doc(db, 'menus', normalized.id))
        const legacyData = legacySnapshot.exists() ? legacySnapshot.data() : null
        if (legacyData?.status === 'published' && legacyData.days && !legacyData.draftDays) {
          publicMenu = { id: legacySnapshot.id, ...legacyData }
        }
      } catch (error) {
        if (error?.code !== 'permission-denied') throw error
      }
    }

    if (!publicMenu) return { menu: null, items: [], foods: [], categories: [], dailySpecial: '', prices: serializeMenuPrices() }

    const dayKey = getDayKey(date)
    const items = [...(publicMenu.days?.[dayKey] || [])]
      .sort((first, second) => (first.order ?? 0) - (second.order ?? 0))
    const foodIds = [...new Set(items.map((item) => item.foodId))]
    const foodSnapshots = await Promise.all(foodIds.map((id) => getDoc(doc(db, 'foods', id))))
    const foods = foodSnapshots.filter((snapshot) => snapshot.exists()).map((snapshot) => ({ id: snapshot.id, ...snapshot.data() }))
    return {
      menu: publicMenu,
      items,
      foods,
      categories: [],
      dailySpecial: String(publicMenu.dailySpecials?.[dayKey] || ''),
      prices: serializeMenuPrices(publicMenu.prices),
    }
  },

  subscribeMenu(weekStart, onData, onError) {
    const normalized = normalizeMenu(null, weekStart)
    return onSnapshot(
      doc(db, 'menus', normalized.id),
      (snapshot) => onData(normalizeMenu(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null, weekStart)),
      onError,
    )
  },

  async saveMenu(menu, { publish = false } = {}) {
    const reference = doc(db, 'menus', menu.id)
    const snapshot = await getDoc(reference)
    const existingData = snapshot.exists() ? snapshot.data() : null
    const hadPublishedVersion = existingData?.status === 'published'
    const draftDays = serializeMenuDays(menu.days)
    const draftDailySpecials = serializeDailySpecials(menu.dailySpecials)
    const draftPrices = serializeMenuPrices(menu.prices)
    const nextStatus = publish || hadPublishedVersion ? 'published' : 'draft'
    const hasUnpublishedChanges = !publish && hadPublishedVersion
    const timestamp = serverTimestamp()
    const batch = writeBatch(db)

    batch.set(reference, {
      weekStart: menu.weekStart,
      weekEnd: menu.weekEnd,
      status: nextStatus,
      draftDays,
      draftDailySpecials,
      draftPrices,
      hasUnpublishedChanges,
      updatedAt: timestamp,
      ...(publish ? { publishedAt: timestamp } : {}),
      ...(!snapshot.exists() ? { createdAt: timestamp } : {}),
    }, { merge: true })

    const legacyPublishedDays = hadPublishedVersion && existingData?.days && !existingData?.draftDays
      ? existingData.days
      : null
    const publicDays = publish ? draftDays : legacyPublishedDays
    const legacyPublishedDailySpecials = hadPublishedVersion && existingData?.dailySpecials && !existingData?.draftDailySpecials
      ? existingData.dailySpecials
      : null
    const publicDailySpecials = publish ? draftDailySpecials : legacyPublishedDailySpecials
    const legacyPublishedPrices = hadPublishedVersion && existingData?.prices && !existingData?.draftPrices
      ? existingData.prices
      : null
    const publicPrices = publish ? draftPrices : legacyPublishedPrices
    if (publicDays) {
      batch.set(doc(db, 'publishedMenus', menu.id), {
        weekStart: menu.weekStart,
        weekEnd: menu.weekEnd,
        status: 'published',
        days: publicDays,
        ...(publicDailySpecials ? { dailySpecials: publicDailySpecials } : {}),
        ...(publicPrices ? { prices: publicPrices } : {}),
        publishedAt: publish ? timestamp : existingData?.updatedAt || timestamp,
        updatedAt: timestamp,
      }, { merge: true })
    }

    await batch.commit()
    return {
      ...menu,
      status: nextStatus,
      hasUnpublishedChanges,
      exists: true,
      days: draftDays,
      dailySpecials: draftDailySpecials,
      prices: draftPrices,
    }
  },
}
