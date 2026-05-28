import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { IngredientList } from './ingredient-list'
import type { Ingredient } from '@/lib/storage'

const TODAY = new Date('2026-05-28')

vi.setSystemTime(TODAY)

const base: Ingredient = { id: '1', name: '계란', qty: '6', unit: '개' }
const urgent: Ingredient = { id: '2', name: '두부', qty: '300', unit: 'g', expiresAt: '2026.06.03' } // D-6
const later: Ingredient = { id: '3', name: '간장', qty: '500', unit: 'ml', expiresAt: '2026.12.01' }

describe('IngredientList', () => {
  it('shows item name and qty', () => {
    render(<IngredientList ingredients={[base]} onRemove={() => {}} />)
    expect(screen.getByText('계란')).toBeInTheDocument()
    expect(screen.getByText(/6/)).toBeInTheDocument()
  })

  it('shows D-N badge for item with expiry date', () => {
    render(<IngredientList ingredients={[urgent]} onRemove={() => {}} />)
    expect(screen.getByText('D-6')).toBeInTheDocument()
  })

  it('shows "곧 만료" section for items expiring within 7 days', () => {
    render(<IngredientList ingredients={[urgent, later]} onRemove={() => {}} />)
    expect(screen.getByText('곧 만료')).toBeInTheDocument()
    expect(screen.getByText('보관 중')).toBeInTheDocument()
  })

  it('shows empty state when no ingredients', () => {
    render(<IngredientList ingredients={[]} onRemove={() => {}} />)
    expect(screen.getByText(/저장된 재료가 없어요/)).toBeInTheDocument()
  })

  it('calls onRemove with the ingredient id when delete button clicked', () => {
    const onRemove = vi.fn()
    render(<IngredientList ingredients={[base]} onRemove={onRemove} />)
    fireEvent.click(screen.getByRole('button', { name: /삭제/ }))
    expect(onRemove).toHaveBeenCalledWith('1')
  })
})
