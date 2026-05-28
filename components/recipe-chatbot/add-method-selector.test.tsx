import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AddMethodSelector } from './add-method-selector'

describe('AddMethodSelector', () => {
  it('renders scan and manual entry options', () => {
    render(<AddMethodSelector onSelectScan={() => {}} onSelectManual={() => {}} onBack={() => {}} />)
    expect(screen.getAllByText(/영수증 스캔/)[0]).toBeInTheDocument()
    expect(screen.getAllByText(/직접 입력/)[0]).toBeInTheDocument()
  })

  it('calls onSelectScan when scan card is clicked', () => {
    const onSelectScan = vi.fn()
    render(<AddMethodSelector onSelectScan={onSelectScan} onSelectManual={() => {}} onBack={() => {}} />)
    fireEvent.click(screen.getAllByText(/영수증 스캔/)[0])
    expect(onSelectScan).toHaveBeenCalled()
  })

  it('calls onSelectManual when manual card is clicked', () => {
    const onSelectManual = vi.fn()
    render(<AddMethodSelector onSelectScan={() => {}} onSelectManual={onSelectManual} onBack={() => {}} />)
    // click the title element (first match) which is inside the button
    fireEvent.click(screen.getAllByText(/직접 입력/)[0])
    expect(onSelectManual).toHaveBeenCalled()
  })

  it('calls onBack when back button is clicked', () => {
    const onBack = vi.fn()
    render(<AddMethodSelector onSelectScan={() => {}} onSelectManual={() => {}} onBack={onBack} />)
    fireEvent.click(screen.getByRole('button', { name: /뒤로/ }))
    expect(onBack).toHaveBeenCalled()
  })
})
