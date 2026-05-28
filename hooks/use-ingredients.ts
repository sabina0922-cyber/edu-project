'use client'

import { useState, useEffect } from 'react'
import { getIngredients, saveIngredients, type Ingredient } from '@/lib/storage'

export { type Ingredient }

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])

  useEffect(() => {
    setIngredients(getIngredients())
  }, [])

  function addIngredient(ingredient: Ingredient) {
    setIngredients((prev) => {
      const next = [...prev, ingredient]
      saveIngredients(next)
      return next
    })
  }

  function addIngredients(newItems: Ingredient[]) {
    setIngredients((prev) => {
      const next = [...prev, ...newItems]
      saveIngredients(next)
      return next
    })
  }

  function removeIngredient(id: string) {
    setIngredients((prev) => {
      const next = prev.filter((i) => i.id !== id)
      saveIngredients(next)
      return next
    })
  }

  return { ingredients, addIngredient, addIngredients, removeIngredient }
}
