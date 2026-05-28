'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Ingredient } from '@/lib/storage'

const UNITS = ['개', 'g', 'ml', '단', '묶음', '개입', 'kg', 'L']
const DEFAULT_ROWS = 5

interface Row {
  id: string
  name: string
  qty: string
  unit: string
  expiresAt: string
}

function emptyRow(): Row {
  return { id: crypto.randomUUID(), name: '', qty: '', unit: '개', expiresAt: '' }
}

interface Props {
  onSave: (ingredients: Ingredient[]) => void
  onCancel: () => void
}

export function IngredientForm({ onSave, onCancel }: Props) {
  const [rows, setRows] = useState<Row[]>(() =>
    Array.from({ length: DEFAULT_ROWS }, emptyRow)
  )
  const [error, setError] = useState<string | null>(null)

  function updateRow(id: string, field: keyof Omit<Row, 'id'>, value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
    if (error) setError(null)
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()])
  }

  function handleSave() {
    const filled = rows.filter((r) => r.name.trim())
    if (filled.length === 0) {
      setError('재료명을 하나 이상 입력하세요')
      return
    }
    onSave(
      filled.map((r) => ({
        id: crypto.randomUUID(),
        name: r.name.trim(),
        qty: r.qty.trim() || '1',
        unit: r.unit,
        expiresAt: r.expiresAt.trim() || undefined,
      }))
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Column header */}
      <div className="grid grid-cols-[1fr_56px_56px_88px_28px] gap-1.5 px-4 pt-3 pb-1 text-xs font-semibold text-muted-foreground">
        <span>재료명 *</span>
        <span>수량</span>
        <span>단위</span>
        <span>유통기한</span>
        <span />
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto px-4 space-y-1.5">
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-[1fr_56px_56px_88px_28px] gap-1.5 items-center">
            <input
              aria-label="재료명"
              placeholder="예: 계란"
              value={row.name}
              onChange={(e) => updateRow(row.id, 'name', e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/60"
            />
            <input
              aria-label="수량"
              placeholder="1"
              value={row.qty}
              onChange={(e) => updateRow(row.id, 'qty', e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none focus:ring-1 focus:ring-ring text-center placeholder:text-muted-foreground/60"
            />
            <select
              aria-label="단위"
              value={row.unit}
              onChange={(e) => updateRow(row.id, 'unit', e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
            <input
              aria-label="유통기한"
              placeholder="YY.MM.DD"
              value={row.expiresAt}
              onChange={(e) => updateRow(row.id, 'expiresAt', e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/60"
            />
            <button
              onClick={() => removeRow(row.id)}
              aria-label="행 삭제"
              className="flex items-center justify-center size-7 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        {/* Add row button */}
        <button
          onClick={addRow}
          className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          <Plus className="size-3.5" />
          재료 추가
        </button>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 pt-3 border-t space-y-2">
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button className="flex-1" onClick={handleSave}>재료 저장</Button>
          <Button variant="outline" onClick={onCancel}>취소</Button>
        </div>
      </div>
    </div>
  )
}
