import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useChat } from './use-chat'

const mockIngredients = [
  { id: '1', name: '계란', qty: '6', unit: '개' },
  { id: '2', name: '대파', qty: '1', unit: '단' },
]
const mockGetIngredients = () => [] as typeof mockIngredients

// Mock getIngredients so localStorage is not needed
vi.mock('@/lib/storage', () => ({
  getIngredients: () => mockGetIngredients(),
}))

function makeSseStream(events: string[]): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      for (const event of events) {
        controller.enqueue(encoder.encode(`data: ${event}\n\n`))
      }
      controller.close()
    },
  })
  return new Response(stream, { status: 200 })
}

describe('useChat', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('adds user message and assistant message when sendMessage is called', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      makeSseStream([
        JSON.stringify({ type: 'text', text: '안녕하세요' }),
        JSON.stringify({ type: 'done' }),
      ])
    )
    const { result } = renderHook(() => useChat())
    await act(async () => {
      await result.current.sendMessage('계란볶음밥 만들어줘')
    })
    expect(result.current.messages).toHaveLength(2)
    expect(result.current.messages[0].role).toBe('user')
    expect(result.current.messages[1].role).toBe('assistant')
    expect(result.current.messages[1].content).toContain('안녕하세요')
  })

  it('sets isStreaming to false after completion', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      makeSseStream([JSON.stringify({ type: 'done' })])
    )
    const { result } = renderHook(() => useChat())
    await act(async () => {
      await result.current.sendMessage('test')
    })
    expect(result.current.isStreaming).toBe(false)
  })

  it('shows error message and re-enables input on API error', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'Service unavailable' }), { status: 500 })
    )
    const { result } = renderHook(() => useChat())
    await act(async () => {
      await result.current.sendMessage('계란볶음밥 만들어줘')
    })
    const errorMsg = result.current.messages.find((m) => m.role === 'error')
    expect(errorMsg).toBeDefined()
    expect(errorMsg?.content).toMatch(/오류가 발생/)
    // input re-enabled (isStreaming false)
    expect(result.current.isStreaming).toBe(false)
  })

  it('shows error message on network failure', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useChat())
    await act(async () => {
      await result.current.sendMessage('test')
    })
    expect(result.current.messages.some((m) => m.role === 'error')).toBe(true)
    expect(result.current.isStreaming).toBe(false)
  })

  it('clears messages when clearMessages is called', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      makeSseStream([JSON.stringify({ type: 'done' })])
    )
    const { result } = renderHook(() => useChat())
    await act(async () => {
      await result.current.sendMessage('test')
    })
    act(() => {
      result.current.clearMessages()
    })
    expect(result.current.messages).toHaveLength(0)
  })

  it('sends ingredients to API in request body', async () => {
    // Override the mock for this test using a spy on the module
    const storage = await import('@/lib/storage')
    vi.spyOn(storage, 'getIngredients').mockReturnValue(mockIngredients)

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      makeSseStream([JSON.stringify({ type: 'done' })])
    )
    const { result } = renderHook(() => useChat())
    await act(async () => {
      await result.current.sendMessage('냉장고 재료로 만들어줘')
    })
    const body = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string)
    expect(body.ingredients).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: '계란' }),
    ]))
  })
})
