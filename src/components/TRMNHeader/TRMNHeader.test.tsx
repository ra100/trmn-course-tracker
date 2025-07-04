import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ThemeProvider } from 'styled-components'
import { darkTheme } from '../../theme'
import { I18nProvider } from '../../i18n'
import { TRMNHeader } from './TRMNHeader'

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={darkTheme}>
      <I18nProvider>{component}</I18nProvider>
    </ThemeProvider>
  )
}

describe('TRMNHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the dual-line TRMN logotype correctly', () => {
    renderWithTheme(<TRMNHeader />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('THE ROYALMANTICORAN NAVY')
    expect(heading.innerHTML).toContain('<br>')
  })

  it('displays the default subtitle when none is provided', () => {
    renderWithTheme(<TRMNHeader />)

    const subtitle = screen.getByText('Course Tracker - Bureau of Communications')
    expect(subtitle).toBeInTheDocument()
  })

  it('displays custom subtitle when provided', () => {
    const customSubtitle = 'Custom Bureau Message'
    renderWithTheme(<TRMNHeader subtitle={customSubtitle} />)

    const subtitle = screen.getByText(customSubtitle)
    expect(subtitle).toBeInTheDocument()
  })

  it('hides subtitle when empty string is provided', () => {
    renderWithTheme(<TRMNHeader subtitle="" />)

    const subtitle = screen.queryByText('Course Tracker - Bureau of Communications')
    expect(subtitle).not.toBeInTheDocument()
  })

  it('shows mobile menu button when showMobileMenu is true', () => {
    const mockToggle = vi.fn()
    renderWithTheme(<TRMNHeader showMobileMenu onMobileMenuToggle={mockToggle} />)

    const menuButton = screen.getByRole('button', { name: /toggle navigation menu/i })
    expect(menuButton).toBeInTheDocument()
  })

  it('hides mobile menu button when showMobileMenu is false', () => {
    renderWithTheme(<TRMNHeader showMobileMenu={false} />)

    const menuButton = screen.queryByRole('button', { name: /toggle navigation menu/i })
    expect(menuButton).not.toBeInTheDocument()
  })

  it('calls onMobileMenuToggle when menu button is clicked', () => {
    const mockToggle = vi.fn()
    renderWithTheme(<TRMNHeader showMobileMenu onMobileMenuToggle={mockToggle} />)

    const menuButton = screen.getByRole('button', { name: /toggle navigation menu/i })
    fireEvent.click(menuButton)

    expect(mockToggle).toHaveBeenCalledTimes(1)
  })

  it('uses custom menu toggle label when provided', () => {
    const customLabel = 'Open navigation'
    const mockToggle = vi.fn()
    renderWithTheme(<TRMNHeader showMobileMenu onMobileMenuToggle={mockToggle} menuToggleLabel={customLabel} />)

    const menuButton = screen.getByRole('button', { name: customLabel })
    expect(menuButton).toBeInTheDocument()
  })

  it('renders as a header element with proper semantic structure', () => {
    renderWithTheme(<TRMNHeader />)

    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
  })

  it('applies proper TRMN organizational structure', () => {
    renderWithTheme(<TRMNHeader />)

    const heading = screen.getByRole('heading', { level: 1 })

    expect(heading.innerHTML).toContain('<br>')
    expect(heading.innerHTML).toContain('THE ROYAL')
    expect(heading.innerHTML).toContain('MANTICORAN NAVY')
    expect(heading).toHaveTextContent('THE ROYALMANTICORAN NAVY')
  })
})
