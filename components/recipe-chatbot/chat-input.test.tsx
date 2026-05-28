import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatInput } from './chat-input'

describe('ChatInput', () => {
  it('send button is disabled when input is empty', () => {
    render(<ChatInput onSend={() => {}} isStreaming={false} />)
    expect(screen.getByRole('button', { name: /전송/ })).toBeDisabled()
  })

  it('send button is disabled while streaming', () => {
    render(<ChatInput onSend={() => {}} isStreaming={true} />)
    const btn = screen.getByRole('button', { name: /전송/ })
    expect(btn).toBeDisabled()
  })

  it('textarea is disabled while streaming', () => {
    render(<ChatInput onSend={() => {}} isStreaming={true} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
  })

  it('calls onSend with input text when send button clicked', async () => {
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} isStreaming={false} />)
    await userEvent.type(screen.getByRole('textbox'), '계란볶음밥 만들어줘')
    fireEvent.click(screen.getByRole('button', { name: /전송/ }))
    expect(onSend).toHaveBeenCalledWith('계란볶음밥 만들어줘')
  })

  it('clears input after sending', async () => {
    render(<ChatInput onSend={() => {}} isStreaming={false} />)
    const textarea = screen.getByRole('textbox')
    await userEvent.type(textarea, '계란볶음밥 만들어줘')
    fireEvent.click(screen.getByRole('button', { name: /전송/ }))
    expect(textarea).toHaveValue('')
  })
})
