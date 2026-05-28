import { describe, it, expect, beforeEach } from 'vitest'
import { getIngredients, saveIngredients } from './storage'
import type { Ingredient } from './storage'

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns empty array when nothing is saved', () => {
    expect(getIngredients()).toEqual([])
  })

  it('saveIngredients + getIngredients roundtrip', () => {
    const ingredients: Ingredient[] = [
      { id: '1', name: '계란', qty: '6', unit: '개' },
    ]
    saveIngredients(ingredients)
    expect(getIngredients()).toEqual(ingredients)
  })

  it('overwrites previous data on save', () => {
    saveIngredients([{ id: '1', name: '계란', qty: '6', unit: '개' }])
    saveIngredients([{ id: '2', name: '두부', qty: '300', unit: 'g' }])
    expect(getIngredients()).toHaveLength(1)
    expect(getIngredients()[0].name).toBe('두부')
  })
})
