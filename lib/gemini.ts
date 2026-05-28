import { GoogleGenerativeAI, SchemaType, type FunctionDeclaration } from '@google/generative-ai'
import { fetchRecipeByName } from './recipe-api'

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const recipeToolDeclarations: FunctionDeclaration[] = [
  {
    name: 'get_recipe',
    description: '요리명을 받아 레시피 데이터베이스에서 재료와 조리법을 검색합니다. 한국 요리는 영어 이름(예: "kimchi fried rice")으로 제공하면 더 잘 찾습니다. 데이터베이스에 없으면 AI 자체 지식으로 대체합니다.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        dish_name: {
          type: SchemaType.STRING,
          description: '요리명 (한국어 또는 영어)',
        },
      },
      required: ['dish_name'],
    },
  },
]

export async function getRecipeResult(dishName: string): Promise<Record<string, unknown>> {
  // 1. Try RecipeAPI.io first
  const apiRecipe = await fetchRecipeByName(dishName)

  if (apiRecipe) {
    const ingredients = Array.isArray(apiRecipe.ingredients)
      ? apiRecipe.ingredients.map((i) =>
          [i.amount, i.unit, i.name].filter(Boolean).join(' ').trim()
        )
      : []

    return {
      source: 'recipeapi',
      dish_name: apiRecipe.name,
      description: apiRecipe.description ?? null,
      ingredients: ingredients.length > 0 ? ingredients : null,
      instructions: apiRecipe.instructions ?? null,
      servings: apiRecipe.servings ?? null,
      prep_time: apiRecipe.prep_time ?? null,
      cook_time: apiRecipe.cook_time ?? null,
    }
  }

  // 2. Fallback: tell Gemini to use its own knowledge
  return {
    source: 'ai_knowledge',
    dish_name: dishName,
    message:
      '레시피 데이터베이스에서 해당 요리를 찾지 못했습니다. AI가 알고 있는 일반적인 레시피 지식을 바탕으로 재료와 조리법을 안내해 주세요.',
  }
}

export function buildSystemInstruction(ingredients?: { name: string; qty: string; unit: string }[]): string {
  const base = `당신은 친절한 요리 어시스턴트입니다. 요리 초보자도 이해할 수 있도록 쉽고 친근하게 안내하세요.

규칙:
- get_recipe 도구로 재료를 먼저 안내하고, 사용자가 준비됐다고 하면 단계별로 진행하세요.
- get_recipe 결과의 source가 "recipeapi"이면 그 데이터를 활용하세요.
- get_recipe 결과의 source가 "ai_knowledge"이면 당신이 알고 있는 레시피로 재료와 조리법을 안내하세요.
- 없는 재료가 있으면 대체 재료나 생략 가능 여부를 안내하세요.
- 사용자가 다른 요리를 요청하면 이전 요리 맥락 없이 새로 시작하세요.
- 응답은 이모지를 적절히 사용해 친근하게 작성하세요.`

  if (ingredients && ingredients.length > 0) {
    const list = ingredients.map((i) => `${i.name} (${i.qty}${i.unit})`).join(', ')
    return `${base}\n\n현재 냉장고 재료: ${list}\n사용자가 "냉장고 재료로 만들어줘"라고 하면 이 재료들을 활용하세요.`
  }
  return base
}
