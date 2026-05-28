'use client'

import { ChatLayout } from '@/components/recipe-chatbot/chat-layout'

export default function Page() {
  return (
    <main className="min-h-screen flex items-start justify-center bg-muted/30 p-4 pt-8">
      <div className="w-full max-w-lg" style={{ height: '680px' }}>
        <ChatLayout />
      </div>
    </main>
  )
}
