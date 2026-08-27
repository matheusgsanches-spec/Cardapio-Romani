const DEFAULT_ORDER = Number.MAX_SAFE_INTEGER

function getCategoryOrder(category) {
  const value = Number(category.order)
  return Number.isFinite(value) ? value : DEFAULT_ORDER
}

export function sortCategories(categories) {
  return [...categories].sort((first, second) => {
    const orderDifference = getCategoryOrder(first) - getCategoryOrder(second)
    if (orderDifference !== 0) return orderDifference
    return first.name.localeCompare(second.name, 'pt-BR')
  })
}

export function groupDailyFoods(items, foods, categories) {
  const foodsById = new Map(foods.map((food) => [food.id, food]))
  const orderedFoods = items.map((item) => foodsById.get(item.foodId)).filter(Boolean)

  return sortCategories(categories)
    .map((category) => ({
      category,
      foods: orderedFoods.filter((food) => food.categoryId === category.id),
    }))
    .filter((group) => group.foods.length > 0)
}
