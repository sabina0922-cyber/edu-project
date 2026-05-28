export interface Ingredient {
  id: string
  name: string
  qty: string
  unit: string
  expiresAt?: string
  memo?: string
}

const KEY = 'recipe-chatbot:ingredients:v1'

function isValidIngredient(val: unknown): val is Ingredient {
  return (
    typeof val === 'object' &&
    val !== null &&
    typeof (val as Record<string, unknown>).id === 'string' &&
    typeof (val as Record<string, unknown>).name === 'string'
  )
}

export function getIngredients(): Ingredient[] {
  try {
    const data = localStorage.getItem(KEY)
    if (!data) return []
    const parsed: unknown = JSON.parse(data)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidIngredient)
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
