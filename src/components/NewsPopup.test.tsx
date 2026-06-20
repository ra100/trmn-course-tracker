import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { NewsPopup } from './NewsPopup'

describe('NewsPopup', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows current news once and remembers dismissal', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<NewsPopup />)

    expect(await screen.findByText('New MLTC courses added')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Got it' }))
    expect(screen.queryByText('New MLTC courses added')).not.toBeInTheDocument()

    unmount()
    render(<NewsPopup />)

    expect(screen.queryByText('New MLTC courses added')).not.toBeInTheDocument()
  })
})
