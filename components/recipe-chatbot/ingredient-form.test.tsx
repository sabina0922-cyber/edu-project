import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IngredientForm } from './ingredient-form'

describe('IngredientForm', () => {
  it('renders 5 rows by default', () => {
    render(<IngredientForm onSave={() => {}} onCancel={() => {}} />)
    const nameInputs = screen.getAllByRole('textbox', { name: '재료명' })
    expect(nameInputs).toHaveLength(5)
  })

  it('adds a new row when "재료 추가" button is clicked', () => {
    render(<IngredientForm onSave={() => {}} onCancel={() => {}} />)
    fireEvent.click(screen.getByText(/재료 추가/))
    const nameInputs = screen.getAllByRole('textbox', { name: '재료명' })
    expect(nameInputs).toHaveLength(6)
  })

  it('removes a row when delete button is clicked', () => {
    render(<IngredientForm onSave={() => {}} onCancel={() => {}} />)
    const deleteBtns = screen.getAllByRole('button', { name: '행 삭제' })
    fireEvent.click(deleteBtns[0])
    const nameInputs = screen.getAllByRole('textbox', { name: '재료명' })
    expect(nameInputs).toHaveLength(4)
  })

  it('shows validation error when no name is filled', () => {
    render(<IngredientForm onSave={() => {}} onCancel={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /저장/ }))
    expect(screen.getByText(/재료명을 하나 이상 입력하세요/)).toBeInTheDocument()
  })

  it('stays on the form when validation fails', () => {
    render(<IngredientForm onSave={() => {}} onCancel={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /저장/ }))
    expect(screen.getAllByRole('textbox', { name: '재료명' })).toHaveLength(5)
  })

  it('calls onSave with only filled rows', async () => {
    const onSave = vi.fn()
    render(<IngredientForm onSave={onSave} onCancel={() => {}} />)
    const nameInputs = screen.getAllByRole('textbox', { name: '재료명' })
    await userEvent.type(nameInputs[0], '계란')
    await userEvent.type(nameInputs[1], '대파')
    fireEvent.click(screen.getByRole('button', { name: /저장/ }))
    expect(onSave).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: '계란' }),
        expect.objectContaining({ name: '대파' }),
      ])
    )
    expect(onSave.mock.calls[0][0]).toHaveLength(2)
  })
})
