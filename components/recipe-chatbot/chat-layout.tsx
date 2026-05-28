'use client'

import { useState } from 'react'
import { ChefHat, Pencil, Egg, Package, Soup, Utensils } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useIngredients } from '@/hooks/use-ingredients'
import { IngredientList } from './ingredient-list'
import { IngredientForm } from './ingredient-form'
import { AddMethodSelector } from './add-method-selector'
import { ReceiptScanner } from './receipt-scanner'
import type { MockReceiptItem } from '@/lib/mock-receipt'
import type { Ingredient } from '@/lib/storage'

type Tab = 'chat' | 'ingredients'
type IngrView = 'list' | 'add-method' | 'manual' | 'scan'

const CHIPS = [
  { icon: Egg, label: '계란볶음밥\n만들어줘' },
  { icon: Package, label: '냉장고 재료로\n뭐 만들지?' },
  { icon: Soup, label: '된장찌개\n레시피 알려줘' },
  { icon: Utensils, label: '초보도 쉬운\n한식 추천해줘' },
]

interface Props {
  onSendMessage?: (text: string) => void
  messages?: React.ReactNode
  isStreaming?: boolean
  inputRef?: React.RefObject<HTMLTextAreaElement>
}

export function ChatLayout({ onSendMessage, messages, isStreaming, inputRef }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('chat')
  const [ingrView, setIngrView] = useState<IngrView>('list')
  const [inputText, setInputText] = useState('')
  const { ingredients, addIngredient, removeIngredient } = useIngredients()

  function handleSend() {
    const text = inputText.trim()
    if (!text || isStreaming) return
    setInputText('')
    onSendMessage?.(text)
  }

  function handleChipClick(label: string) {
    const text = label.replace('\n', ' ')
    onSendMessage?.(text)
  }

  function handleScanSave(items: MockReceiptItem[]) {
    items.forEach((item) => addIngredient(item as Ingredient))
    setIngrView('list')
  }

  function handleManualSave(ingredient: Ingredient) {
    addIngredient(ingredient)
    setIngrView('list')
  }

  const hasMessages = !!messages

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto bg-white border rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="size-5 rounded-md border bg-muted flex items-center justify-center text-xs">🍳</div>
          <span className="font-bold text-sm">요리 어시스턴트</span>
        </div>
        {activeTab === 'chat' && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="새 대화"
            onClick={() => onSendMessage?.('__clear__')}
          >
            <Pencil />
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {(['chat', 'ingredients'] as Tab[]).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => { setActiveTab(tab); setIngrView('list') }}
            className={`flex-1 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-foreground text-foreground font-bold'
                : 'border-transparent text-muted-foreground hover:bg-muted/30'
            }`}
          >
            {tab === 'chat' ? '채팅' : '재료'}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'chat' ? (
        <>
          <div className="flex-1 overflow-y-auto">
            {hasMessages ? (
              <div className="flex flex-col gap-4 p-4">{messages}</div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 h-full p-6 text-center">
                <div className="size-14 rounded-2xl border bg-muted flex items-center justify-center">
                  <ChefHat className="size-7 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-bold text-sm mb-1">요리 어시스턴트</div>
                  <div className="text-xs text-muted-foreground">
                    안녕하세요! 요리명을 말씀해 주시거나<br />재료를 알려주시면 도와드릴게요.
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                  {CHIPS.map((chip) => (
                    <button
                      key={chip.label}
                      onClick={() => handleChipClick(chip.label)}
                      className="flex flex-col items-start gap-1 p-3 rounded-xl border text-xs text-left bg-white hover:bg-muted/50 transition-colors"
                    >
                      <chip.icon className="size-3.5" />
                      <span className="whitespace-pre-line leading-snug">{chip.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chat input */}
          <div className="px-3 pb-3 pt-2">
            <div className={`flex items-end gap-1.5 border rounded-2xl px-4 py-2.5 ${isStreaming ? 'bg-muted' : 'bg-white'}`}>
              <textarea
                ref={inputRef}
                placeholder={isStreaming ? '응답을 기다리는 중...' : '요리명이나 재료를 입력하세요...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isStreaming}
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground min-h-[22px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isStreaming}
                className={`size-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  !inputText.trim() || isStreaming
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-foreground text-background'
                }`}
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Ingredient tab */
        <div className="flex flex-col flex-1 overflow-hidden">
          {ingrView === 'list' && (
            <>
              <div className="flex items-center justify-between px-4 py-2.5 border-b">
                <span className="font-semibold text-sm">내 재료</span>
                <span className="text-xs text-muted-foreground">{ingredients.length}개</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <IngredientList ingredients={ingredients} onRemove={removeIngredient} />
              </div>
              <div className="px-4 pb-4 pt-2 border-t">
                <Button className="w-full" onClick={() => setIngrView('add-method')}>
                  재료 추가
                </Button>
              </div>
            </>
          )}
          {ingrView === 'add-method' && (
            <AddMethodSelector
              onSelectScan={() => setIngrView('scan')}
              onSelectManual={() => setIngrView('manual')}
              onBack={() => setIngrView('list')}
            />
          )}
          {ingrView === 'manual' && (
            <IngredientForm
              onSave={handleManualSave}
              onCancel={() => setIngrView('list')}
            />
          )}
          {ingrView === 'scan' && (
            <ReceiptScanner
              onSave={handleScanSave}
              onBack={() => setIngrView('add-method')}
            />
          )}
        </div>
      )}
    </div>
  )
}
