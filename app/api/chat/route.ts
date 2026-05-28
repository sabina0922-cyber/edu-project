import { genAI, recipeToolDeclarations, getRecipeResult, buildSystemInstruction } from '@/lib/gemini'
import type { Ingredient } from '@/lib/storage'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { messages, ingredients } = body as {
    messages?: { role: string; content: string }[]
    ingredients?: Ingredient[]
  }

  const MAX_MESSAGES = 40
  const MAX_CONTENT_LENGTH = 4000

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: 'messages is required' }, { status: 400 })
  }
  if (messages.length > MAX_MESSAGES) {
    return Response.json({ error: 'Too many messages' }, { status: 400 })
  }
  for (const m of messages) {
    if (typeof m.content === 'string' && m.content.length > MAX_CONTENT_LENGTH) {
      return Response.json({ error: 'Message content too long' }, { status: 400 })
    }
  }

  const systemInstruction = buildSystemInstruction(ingredients)

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      function send(data: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction,
          tools: [{ functionDeclarations: recipeToolDeclarations }],
        })

        // Convert message history: all but the last message go into history
        // The last message is sent via sendMessageStream
        const history = messages.slice(0, -1).map((m) => ({
          role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
          parts: [{ text: m.content }],
        }))

        const lastMessage = messages[messages.length - 1]
        const chat = model.startChat({ history })

        // Send the new user message
        const firstResult = await chat.sendMessageStream(lastMessage.content)

        // Stream any text from the first response
        for await (const chunk of firstResult.stream) {
          const text = chunk.text()
          if (text) send({ type: 'text', text })
        }

        const firstResponse = await firstResult.response
        const functionCalls = firstResponse.functionCalls()

        if (functionCalls && functionCalls.length > 0) {
          const fc = functionCalls[0]
          send({ type: 'tool_start', name: fc.name })

          const recipeData = await getRecipeResult((fc.args as { dish_name: string }).dish_name)

          // Send function result and stream the follow-up response
          const secondResult = await chat.sendMessageStream([
            {
              functionResponse: {
                name: fc.name,
                response: recipeData,
              },
            },
          ])

          for await (const chunk of secondResult.stream) {
            const text = chunk.text()
            if (text) send({ type: 'text', text })
          }

          send({ type: 'tool_end', name: fc.name })
        }

        send({ type: 'done' })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        send({ type: 'error', message })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
