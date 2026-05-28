'use client'

import { useState } from 'react'
import { ArrowUp } from 'lucide-react'

interface Props {
  onSend: (text: string) => void
  isStreaming: boolean
}

export function ChatInput({ onSend, isStreaming }: Props) {
  const [value, setValue] = useState('')

  function handleSend() {
    const text = value.trim()
    if (!text || isStreaming) return
    setValue('')
    onSend(text)
  }

  return (
    <div className={`flex items-end gap-1.5 border rounded-2xl px-4 py-2.5 ${isStreaming ? 'bg-muted' : 'bg-white'}`}>
      <textarea
        role="textbox"
        placeholder={isStreaming ? '응답을 기다리는 중...' : '요리명이나 재료를 입력하세요...'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={isStreaming}
        rows={1}
        className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground min-h-[22px] disabled:cursor-not-allowed"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
          }
        }}
      />
      <button
        aria-label="전송"
        onClick={handleSend}
        disabled={!value.trim() || isStreaming}
        className={`size-8 rounded-xl flex items-center justify-center shrink-0 transition-colors disabled:cursor-not-allowed ${
          !value.trim() || isStreaming
            ? 'bg-muted text-muted-foreground'
            : 'bg-foreground text-background'
        }`}
      >
        <ArrowUp className="size-4" />
      </button>
    </div>
  )
}
