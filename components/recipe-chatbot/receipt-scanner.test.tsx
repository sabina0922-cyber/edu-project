import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ReceiptScanner } from './receipt-scanner'
import { mockReceiptItems } from '@/lib/mock-receipt'

describe('ReceiptScanner', () => {
  it('shows mock parsed results (3+) with checkboxes after image selection', () => {
    render(<ReceiptScanner onSave={() => {}} onBack={() => {}} />)
    // simulate file selection
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File([''], 'receipt.jpg', { type: 'image/jpeg' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    // should show at least 3 food items
    const foodItems = mockReceiptItems.filter(i => i.isFood)
    expect(foodItems.length).toBeGreaterThanOrEqual(3)
    // all food item names should be visible
    foodItems.forEach(item => {
      expect(screen.getByText(item.name)).toBeInTheDocument()
    })
  })

  it('shows non-food items as unchecked by default', () => {
    render(<ReceiptScanner onSave={() => {}} onBack={() => {}} />)
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [new File([''], 'r.jpg', { type: 'image/jpeg' })] } })
    const nonFoodItems = mockReceiptItems.filter(i => !i.isFood)
    nonFoodItems.forEach(item => {
      const checkbox = screen.getByRole('checkbox', { name: new RegExp(item.name) })
      expect(checkbox).not.toBeChecked()
    })
  })

  it('calls onSave with checked items when save button clicked', () => {
    const onSave = vi.fn()
    render(<ReceiptScanner onSave={onSave} onBack={() => {}} />)
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [new File([''], 'r.jpg', { type: 'image/jpeg' })] } })
    fireEvent.click(screen.getByRole('button', { name: /저장/ }))
    expect(onSave).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ isFood: true })])
    )
  })
})
