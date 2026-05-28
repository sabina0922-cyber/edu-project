const BASE_URL = 'https://recipeapi.io/api/v1'

export interface ApiRecipe {
  id: number
  name: string
  description?: string
  instructions?: string[]
  ingredients?: { name: string; quantity?: number; amount?: string | number; unit?: string }[]
  prep_time?: number
  cook_time?: number
  servings?: number | string
  cuisine?: string
  difficulty?: string
}

// Common Korean dish → English translation for API search
const KO_TO_EN: Record<string, string> = {
  계란볶음밥: 'egg fried rice',
  김치볶음밥: 'kimchi fried rice',
  볶음밥: 'fried rice',
  된장찌개: 'doenjang jjigae',
  김치찌개: 'kimchi jjigae',
  부대찌개: 'budae jjigae',
  순두부찌개: 'sundubu jjigae',
  삼겹살: 'samgyeopsal',
  불고기: 'bulgogi',
  비빔밥: 'bibimbap',
  잡채: 'japchae',
  떡볶이: 'tteokbokki',
  라면: 'ramen',
  냉면: 'naengmyeon',
  삼계탕: 'samgyetang',
  갈비찜: 'galbi jjim',
  제육볶음: 'jeyuk bokkeum',
  닭갈비: 'dakgalbi',
  순대: 'sundae',
  김밥: 'kimbap',
  파스타: 'pasta',
  피자: 'pizza',
  스테이크: 'steak',
  샐러드: 'salad',
  샌드위치: 'sandwich',
  오믈렛: 'omelette',
}

function toEnglish(dishName: string): string {
  // Direct match
  const exact = Object.entries(KO_TO_EN).find(([k]) => dishName.includes(k))
  if (exact) return exact[1]
  // If already looks like English, return as-is
  if (/^[a-zA-Z\s]+$/.test(dishName)) return dishName
  return dishName
}

async function searchOne(query: string, apiKey: string): Promise<ApiRecipe | null> {
  const res = await fetch(
    `${BASE_URL}/recipes?search=${encodeURIComponent(query)}&per_page=1`,
    { headers: { Authorization: `Bearer ${apiKey}` } }
  )
  if (!res.ok) return null
  const data = (await res.json()) as { data?: ApiRecipe[] }
  if (!data.data || data.data.length === 0) return null
  return data.data[0]
}

async function getDetail(id: number, apiKey: string): Promise<ApiRecipe | null> {
  const res = await fetch(`${BASE_URL}/recipes/${id}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) return null
  const data = (await res.json()) as { data?: ApiRecipe }
  return data.data ?? null
}

export async function fetchRecipeByName(dishName: string): Promise<ApiRecipe | null> {
  const apiKey = process.env.RECIPE_API_KEY
  if (!apiKey) return null

  try {
    const englishName = toEnglish(dishName)
    // Try English name first, then original if different
    const queries = [englishName]
    if (englishName !== dishName) queries.push(dishName)

    for (const q of queries) {
      const hit = await searchOne(q, apiKey)
      if (hit) {
        const detail = await getDetail(hit.id, apiKey)
        return detail ?? hit
      }
    }
    return null
  } catch {
    return null
  }
}
