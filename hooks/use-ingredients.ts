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
    const next = [...ingredients, ingredient]
    setIngredients(next)
    saveIngredients(next)
  }

  function removeIngredient(id: string) {
    const next = ingredients.filter((i) => i.id !== id)
    setIngredients(next)
    saveIngredients(next)
  }

  return { ingredients, addIngredient, removeIngredient }
}
