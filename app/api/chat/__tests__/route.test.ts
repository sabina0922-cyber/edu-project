import { describe, it, expect, vi } from 'vitest'
import { POST } from '../route'

// Mock Gemini SDK so tests don't make real API calls
vi.mock('@google/generative-ai', () => {
  const SchemaType = { OBJECT: 'OBJECT', STRING: 'STRING' }
  const mockStream = {
    stream: (async function* () {
      yield { text: () => '계란볶음밥에 필요한 재료예요' }
    })(),
    response: Promise.resolve({
      functionCalls: () => null,
    }),
  }

  return {
    SchemaType,
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return {
          startChat() {
            return {
              sendMessageStream: vi.fn().mockResolvedValue(mockStream),
            }
          },
        }
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
