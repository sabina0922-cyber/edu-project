import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChatLayout } from './chat-layout'

vi.mock('@/hooks/use-ingredients', () => ({
  useIngredients: () => ({ ingredients: [], addIngredient: vi.fn(), removeIngredient: vi.fn() }),
}))

describe('ChatLayout', () => {
  it('shows "요리 어시스턴트" title on load', () => {
    render(<ChatLayout />)
    // header title is in a <span>; empty-state repeats it in a <div>
    // both are acceptable — at least one instance must exist
    expect(screen.getAllByText('요리 어시스턴트').length).toBeGreaterThanOrEqual(1)
  })

  it('shows assistant greeting message in message area on load', () => {
    render(<ChatLayout />)
    expect(screen.getByText(/안녕하세요/)).toBeInTheDocument()
  })

  it('shows 4 suggestion chips on load', () => {
    render(<ChatLayout />)
    const chips = screen.getAllByRole('button').filter((b) =>
      ['계란볶음밥', '냉장고 재료', '된장찌개', '한식'].some((t) => b.textContent?.includes(t))
    )
    expect(chips.length).toBe(4)
  })

  it('textarea is enabled on initial load', () => {
    render(<ChatLayout />)
    expect(screen.getByPlaceholderText(/입력/)).not.toBeDisabled()
  })

  it('switches to ingredient tab when "재료" tab is clicked', () => {
    render(<ChatLayout />)
    fireEvent.click(screen.getByRole('tab', { name: '재료' }))
    // ingredient tab shows the add button and empty state
    expect(screen.getByRole('button', { name: '재료 추가' })).toBeInTheDocument()
  })
})
