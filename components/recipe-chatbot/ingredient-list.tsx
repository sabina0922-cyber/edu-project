'use client'

import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Ingredient } from '@/lib/storage'

function calcDaysLeft(expiresAt: string): number | null {
  const parts = expiresAt.split('.').map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return null
  const [year, month, day] = parts
  const expiry = new Date(year, month - 1, day)
  if (isNaN(expiry.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

interface Props {
  ingredients: Ingredient[]
  onRemove: (id: string) => void
}

function IngredientItem({ ingredient, onRemove }: { ingredient: Ingredient; onRemove: (id: string) => void }) {
  const daysLeft = ingredient.expiresAt ? calcDaysLeft(ingredient.expiresAt) : null

  return (
    <div className="flex items-center gap-3 border-b px-4 py-3 bg-white">
      <div className="flex-1">
        <div className="text-sm font-semibold">{ingredient.name}</div>
        <div className="text-xs text-muted-foreground">
          {ingredient.qty}{ingredient.unit}
          {ingredient.expiresAt ? ` · ${ingredient.expiresAt}` : ''}
        </div>
      </div>
      {daysLeft !== null && (
        <Badge variant="outline" className="text-xs shrink-0">
          D-{daysLeft}
        </Badge>
      )}
      <Button
        variant="ghost"
        size="icon"
        aria-label="삭제"
        className="size-7 shrink-0"
        onClick={() => onRemove(ingredient.id)}
      >
        <Trash2 className="size-3.5 text-muted-foreground" />
      </Button>
    </div>
  )
}

export function IngredientList({ ingredients, onRemove }: Props) {
  if (ingredients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground text-sm">
        <span>저장된 재료가 없어요</span>
        <span className="text-xs">재료를 추가해 채팅에서 활용해 보세요</span>
      </div>
    )
  }

  const urgentItems = ingredients.filter((i) => {
    if (!i.expiresAt) return false
    const d = calcDaysLeft(i.expiresAt)
    return d !== null && d <= 7
  })
  const normalItems = ingredients.filter((i) => {
    if (!i.expiresAt) return true
    const d = calcDaysLeft(i.expiresAt)
    return d === null || d > 7
  })

  return (
    <div>
      {urgentItems.length > 0 && (
        <section>
          <div className="px-4 pt-3 pb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            곧 만료
          </div>
          {urgentItems.map((i) => (
            <IngredientItem key={i.id} ingredient={i} onRemove={onRemove} />
          ))}
        </section>
      )}
      {normalItems.length > 0 && (
        <section>
          {urgentItems.length > 0 && (
            <div className="px-4 pt-3 pb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-2">
              보관 중
            </div>
          )}
          {normalItems.map((i) => (
            <IngredientItem key={i.id} ingredient={i} onRemove={onRemove} />
          ))}
        </section>
      )}
    </div>
  )
}
