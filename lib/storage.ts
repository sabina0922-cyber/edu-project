export interface Ingredient {
  id: string
  name: string
  qty: string
  unit: string
  expiresAt?: string
  memo?: string
}

const KEY = 'recipe-chatbot:ingredients:v1'

export function getIngredients(): Ingredient[] {
  try {
    const data = localStorage.getItem(KEY)
    return data ? (JSON.parse(data) as Ingredient[]) : []
  } catch {
    return []
  }
}

export function saveIngredients(ingredients: Ingredient[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(ingredients))
  } catch {
    // incognito / quota exceeded — silently ignore
  }
}
