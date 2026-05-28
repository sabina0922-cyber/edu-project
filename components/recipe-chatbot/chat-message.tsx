'use client'

import { AlertTriangle, Wrench } from 'lucide-react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'error'
  content: string
  toolCall?: { name: string; status: 'pending' | 'done' }
}

interface Props {
  message: ChatMessage
}

export function ChatMessageItem({ message }: Props) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[76%] bg-muted border rounded-[18px_18px_4px_18px] px-4 py-2.5 text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    )
  }

  if (message.role === 'error') {
    return (
      <div className="flex gap-2.5 items-start">
        <div className="size-6 rounded-md border border-dashed bg-muted flex items-center justify-center shrink-0 mt-0.5">
          <AlertTriangle className="size-3 text-muted-foreground" />
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground italic pt-0.5">{message.content}</p>
      </div>
    )
  }

  // assistant
  return (
    <div className="flex gap-2.5 items-start">
      <div className="size-6 rounded-md border bg-muted flex items-center justify-center shrink-0 mt-0.5 text-xs">🍳</div>
      <div className="flex-1 pt-0.5">
        {message.toolCall && (
          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground border border-dashed rounded-md px-2 py-1 mb-2">
            <Wrench className="size-2.5" />
            {message.toolCall.name}({message.toolCall.status === 'pending' ? '호출 중...' : '완료'})
          </div>
        )}
        {message.content && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        )}
        {!message.content && message.toolCall?.status === 'pending' && (
          <div className="flex gap-1 items-center py-1">
            <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
            <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
            <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
          </div>
        )}
      </div>
    </div>
  )
}
