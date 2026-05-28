import { GoogleGenerativeAI, SchemaType, type FunctionDeclaration } from '@google/generative-ai'

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const recipeToolDeclarations: FunctionDeclaration[] = [
  {
    name: 'get_recipe',
    description: '요리명을 받아 필요한 재료와 기본 정보를 반환합니다.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        dish_name: {
          type: SchemaType.STRING,
          description: '요리명',
        },
      },
      required: ['dish_name'],
    },
  },
]

const RECIPES: Record<string, { ingredients: string[]; servings: string }> = {
  계란볶음밥: {
    ingredients: ['계란 2개', '밥 1공기', '대파 약간', '간장 1큰술', '참기름 약간', '소금·후춧가루'],
    servings: '1인분',
  },
  된장찌개: {
    ingredients: ['두부 150g', '감자 1개', '양파 1/2개', '대파 1/2대', '된장 2큰술', '고춧가루 1작은술', '멸치 육수 500ml'],
    servings: '2인분',
  },
  김치볶음밥: {
    ingredients: ['김치 150g', '밥 1공기', '계란 1개', '참기름 1큰술', '고추장 1작은술', '간장 1작은술'],
    servings: '1인분',
  },
  라면: {
    ingredients: ['라면 1봉지', '계란 1개', '대파 약간', '물 550ml'],
    servings: '1인분',
  },
}

export function getRecipeResult(dishName: string): Record<string, unknown> {
  const key = Object.keys(RECIPES).find((k) => dishName.includes(k))
  if (!key) {
    return { dish_name: dishName, ingredients: ['재료 정보 없음 — 일반적인 레시피를 안내합니다'] }
  }
  return { dish_name: key, ...RECIPES[key] }
}

export function buildSystemInstruction(ingredients?: { name: string; qty: string; unit: string }[]): string {
  const base = `당신은 친절한 요리 어시스턴트입니다. 요리 초보자도 이해할 수 있도록 쉽고 친근하게 안내하세요.

규칙:
- get_recipe 도구로 재료를 먼저 안내하고, 사용자가 준비됐다고 하면 단계별로 진행하세요.
- 없는 재료가 있으면 대체 재료나 생략 가능 여부를 안내하세요.
- 사용자가 다른 요리를 요청하면 이전 요리 맥락 없이 새로 시작하세요.
- 응답은 이모지를 적절히 사용해 친근하게 작성하세요.`

  if (ingredients && ingredients.length > 0) {
    const list = ingredients.map((i) => `${i.name} (${i.qty}${i.unit})`).join(', ')
    return `${base}\n\n현재 냉장고 재료: ${list}\n사용자가 "냉장고 재료로 만들어줘"라고 하면 이 재료들을 활용하세요.`
  }
  return base
}
