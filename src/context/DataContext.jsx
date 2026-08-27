import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { dataRepository, isFirebaseEnabled } from '../services/dataRepository'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [categories, setCategories] = useState([])
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let categoriesReady = false
    let foodsReady = false
    const finish = () => categoriesReady && foodsReady && setLoading(false)
    const handleError = (reason) => {
      setError(reason?.message || 'Não foi possível carregar os dados.')
      setLoading(false)
    }
    const unsubscribeCategories = dataRepository.subscribeCategories((data) => {
      setCategories(data)
      categoriesReady = true
      finish()
    }, handleError)
    const unsubscribeFoods = dataRepository.subscribeFoods((data) => {
      setFoods(data)
      foodsReady = true
      finish()
    }, handleError)
    return () => {
      unsubscribeCategories?.()
      unsubscribeFoods?.()
    }
  }, [])

  const value = useMemo(
    () => ({
      categories,
      foods,
      loading,
      error,
      isFirebaseEnabled,
      saveCategory: dataRepository.saveCategory,
      saveFood: dataRepository.saveFood,
      getMenu: dataRepository.getMenu,
      saveMenu: dataRepository.saveMenu,
      subscribeMenu: dataRepository.subscribeMenu,
      getCategory: (id) => categories.find((category) => category.id === id),
      getFood: (id) => foods.find((food) => food.id === id),
    }),
    [categories, foods, loading, error],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  return useContext(DataContext)
}
