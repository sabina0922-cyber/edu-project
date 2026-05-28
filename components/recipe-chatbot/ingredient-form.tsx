'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field'
import { Select } from '@/components/ui/select'
import type { Ingredient } from '@/lib/storage'

const UNITS = ['개', 'g', 'ml', '단', '묶음', '개입']

interface Props {
  onSave: (ingredient: Ingredient) => void
  onCancel: () => void
}

export function IngredientForm({ onSave, onCancel }: Props) {
  const [name, setName] = useState('')
  const [qty, setQty] = useState('')
  const [unit, setUnit] = useState('개')
  const [expiresAt, setExpiresAt] = useState('')
  const [memo, setMemo] = useState('')
  const [errors, setErrors] = useState<{ name?: string; qty?: string }>({})

  function handleSave() {
    const newErrors: typeof errors = {}
    if (!name.trim()) newErrors.name = '재료명을 입력하세요'
    if (!qty.trim()) newErrors.qty = '수량을 입력하세요'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave({
      id: crypto.randomUUID(),
      name: name.trim(),
      qty: qty.trim(),
      unit,
      expiresAt: expiresAt.trim() || undefined,
      memo: memo.trim() || undefined,
    })
  }

  return (
    <div className="p-4 space-y-1">
      <FieldGroup>
        <Field data-invalid={!!errors.name || undefined}>
          <FieldLabel htmlFor="ingr-name">재료명 *</FieldLabel>
          <Input
            id="ingr-name"
            aria-invalid={!!errors.name}
            placeholder="예: 계란, 대파, 간장..."
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
            }}
          />
          {errors.name && <FieldError>{errors.name}</FieldError>}
        </Field>

        <div className="flex gap-3">
          <Field className="flex-1" data-invalid={!!errors.qty || undefined}>
            <FieldLabel htmlFor="ingr-qty">수량 *</FieldLabel>
            <Input
              id="ingr-qty"
              aria-invalid={!!errors.qty}
              placeholder="예: 6"
              value={qty}
              onChange={(e) => {
                setQty(e.target.value)
                if (errors.qty) setErrors((prev) => ({ ...prev, qty: undefined }))
              }}
            />
            {errors.qty && <FieldError>{errors.qty}</FieldError>}
          </Field>

          <Field className="flex-1">
            <FieldLabel htmlFor="ingr-unit">단위</FieldLabel>
            <select
              id="ingr-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="ingr-expires">유통기한</FieldLabel>
          <Input
            id="ingr-expires"
            placeholder="YYYY.MM.DD (선택)"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="ingr-memo">메모 <span className="font-normal">(선택)</span></FieldLabel>
          <Input
            id="ingr-memo"
            placeholder="예: 냉동 보관, 개봉 후 빨리 사용"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </Field>
      </FieldGroup>

      <div className="flex gap-2 pt-2">
        <Button className="flex-1" onClick={handleSave}>재료 저장</Button>
        <Button variant="outline" onClick={onCancel}>취소</Button>
      </div>
    </div>
  )
}
