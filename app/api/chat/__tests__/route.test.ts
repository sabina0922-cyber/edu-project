import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../route'

// Mock Anthropic SDK so tests don't make real API calls
vi.mock('@anthropic-ai/sdk', () => {
  const mockStream = {
    [Symbol.asyncIterator]: async function* () {
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: '계란볶음밥에 필요한 재료예요' } }
      yield { type: 'message_delta', delta: { stop_reason: 'end_turn' } }
      yield { type: 'message_stop' }
    },
    finalMessage: async () => ({
      content: [{ type: 'text', text: '계란볶음밥에 필요한 재료예요' }],
      stop_reason: 'end_turn',
    }),
  }

  return {
    default: class Anthropic {
      messages = {
        create: vi.fn().mockResolvedValue(mockStream),
      }
    },
  }
})

describe('POST /api/chat', () => {
  it('returns text/event-stream for valid request', async () => {
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: '계란볶음밥 만들어줘' }] }),
    })
    const res = await POST(req)
    expect(res.headers.get('Content-Type')).toContain('text/event-stream')
  })

  it('returns 400 for missing messages', async () => {
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json).toHaveProperty('error')
  })

  it('returns 400 for invalid JSON', async () => {
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
