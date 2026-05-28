'use client'

import { useState } from 'react'
import type { ChatMessage } from '@/components/recipe-chatbot/chat-message'
import { getIngredients } from '@/lib/storage'

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)

  function clearMessages() {
    setMessages([])
  }

  async function sendMessage(text: string) {
    if (isStreaming) return

    // Build the new user message
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setIsStreaming(true)

    // Placeholder assistant message
    const assistantId = crypto.randomUUID()
    const assistantMsg: ChatMessage = { id: assistantId, role: 'assistant', content: '' }
    setMessages((prev) => [...prev, assistantMsg])

    try {
      const ingredients = getIngredients()
      const apiMessages = nextMessages.map((m) => ({ role: m.role === 'error' ? 'user' : m.role, content: m.content }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, ingredients }),
      })

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6)
          if (payload === '[DONE]') continue

          const event = JSON.parse(payload) as {
            type?: string
            text?: string
            name?: string
            message?: string
          }

          if (event.type === 'text') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + (event.text ?? '') } : m
              )
            )
          } else if (event.type === 'tool_start') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, toolCall: { name: event.name ?? 'get_recipe', status: 'pending' } }
                  : m
              )
            )
          } else if (event.type === 'tool_end') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId && m.toolCall
                  ? { ...m, toolCall: { ...m.toolCall, status: 'done' } }
                  : m
              )
            )
          } else if (event.type === 'error') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, role: 'error', content: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
                  : m
              )
            )
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, role: 'error', content: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
            : m
        )
      )
    } finally {
      setIsStreaming(false)
    }
  }

  return { messages, isStreaming, sendMessage, clearMessages }
}
