import type Anthropic from '@anthropic-ai/sdk'
import { anthropic, recipeTools, getRecipeResult, buildSystemPrompt } from '@/lib/claude'
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

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: 'messages is required' }, { status: 400 })
  }

  const systemPrompt = buildSystemPrompt(ingredients)

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      function send(data: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        let currentMessages: Anthropic.MessageParam[] = messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))

        let continueLoop = true

        while (continueLoop) {
          continueLoop = false

          const apiStream = anthropic.messages.stream({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1024,
            system: systemPrompt,
            tools: recipeTools,
            messages: currentMessages,
          })

          let toolName: string | null = null
          let toolId: string | null = null

          for await (const event of apiStream) {
            if (event.type === 'content_block_start' && event.content_block.type === 'tool_use') {
              toolName = event.content_block.name
              toolId = event.content_block.id
              send({ type: 'tool_start', name: toolName })
            } else if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              send({ type: 'text', text: event.delta.text })
            } else if (
              event.type === 'message_delta' &&
              event.delta.stop_reason === 'tool_use'
            ) {
              continueLoop = true
            }
          }

          const finalMessage = await apiStream.finalMessage()

          if (continueLoop && toolId && toolName) {
            send({ type: 'tool_end', name: toolName })

            const toolUseBlock = finalMessage.content.find(
              (b): b is Extract<typeof b, { type: 'tool_use' }> =>
                b.type === 'tool_use' && b.id === toolId
            )
            const dishName = toolUseBlock
              ? (toolUseBlock.input as { dish_name: string }).dish_name
              : ''
            const result = getRecipeResult(dishName)

            currentMessages = [
              ...currentMessages,
              { role: 'assistant', content: finalMessage.content },
              {
                role: 'user',
                content: [
                  {
                    type: 'tool_result',
                    tool_use_id: toolId,
                    content: result,
                  },
                ],
              },
            ]
          }
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
