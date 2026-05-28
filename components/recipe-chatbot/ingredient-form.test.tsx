import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IngredientForm } from './ingredient-form'

describe('IngredientForm', () => {
  it('shows validation error when name is empty', async () => {
    render(<IngredientForm onSave={() => {}} onCancel={() => {}} />)
    // fill qty but not name
    await userEvent.type(screen.getByLabelText(/수량/), '3')
    fireEvent.click(screen.getByRole('button', { name: /저장/ }))
    expect(screen.getByText(/재료명을 입력하세요/)).toBeInTheDocument()
  })

  it('shows validation error when qty is empty', async () => {
    render(<IngredientForm onSave={() => {}} onCancel={() => {}} />)
    await userEvent.type(screen.getByLabelText(/재료명/), '계란')
    fireEvent.click(screen.getByRole('button', { name: /저장/ }))
    expect(screen.getByText(/수량을 입력하세요/)).toBeInTheDocument()
  })

  it('stays on the form when validation fails', async () => {
    render(<IngredientForm onSave={() => {}} onCancel={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /저장/ }))
    expect(screen.getByLabelText(/재료명/)).toBeInTheDocument()
  })

  it('calls onSave with correct ingredient when form is valid', async () => {
    const onSave = vi.fn()
    render(<IngredientForm onSave={onSave} onCancel={() => {}} />)
    await userEvent.type(screen.getByLabelText(/재료명/), '계란')
    await userEvent.type(screen.getByLabelText(/수량/), '6')
    fireEvent.click(screen.getByRole('button', { name: /저장/ }))
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ name: '계란', qty: '6' })
    )
  })
})
