import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from 'styled-components'
import { SkipLinks } from './SkipLinks'
import { lightTheme } from '../theme'
import { I18nProvider } from '../i18n/context'

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <I18nProvider>
      <ThemeProvider theme={lightTheme}>{component}</ThemeProvider>
    </I18nProvider>
  )
}

describe('SkipLinks', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  it('should render all skip links', () => {
    renderWithProviders(<SkipLinks />)

    expect(screen.getByText('Skip to main content')).toBeInTheDocument()
    expect(screen.getByText('Skip to skill tree')).toBeInTheDocument()
    expect(screen.getByText('Skip to sidebar')).toBeInTheDocument()
    expect(screen.getByText('Skip to course details')).toBeInTheDocument()
  })

  it('should have proper href attributes', () => {
    renderWithProviders(<SkipLinks />)

    const mainContentLink = screen.getByText('Skip to main content')
    const skillTreeLink = screen.getByText('Skip to skill tree')
    const sidebarLink = screen.getByText('Skip to sidebar')
    const courseDetailsLink = screen.getByText('Skip to course details')

    expect(mainContentLink).toHaveAttribute('href', '#main-content')
    expect(skillTreeLink).toHaveAttribute('href', '#skill-tree')
    expect(sidebarLink).toHaveAttribute('href', '#sidebar')
    expect(courseDetailsLink).toHaveAttribute('href', '#course-details')
  })

  it('should handle click events and navigate to targets', () => {
    // Create target elements
    const mainContent = document.createElement('div')
    mainContent.id = 'main-content'
    mainContent.tabIndex = -1
    const mockFocus = vi.fn()
    const mockScrollIntoView = vi.fn()
    mainContent.focus = mockFocus
    mainContent.scrollIntoView = mockScrollIntoView
    document.body.appendChild(mainContent)

    renderWithProviders(<SkipLinks />)

    const mainContentLink = screen.getByText('Skip to main content')
    fireEvent.click(mainContentLink)

    expect(mockFocus).toHaveBeenCalled()
    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    })
  })

  it('should handle missing target elements gracefully', () => {
    renderWithProviders(<SkipLinks />)

    const mainContentLink = screen.getByText('Skip to main content')

    // Should not throw when target doesn't exist
    expect(() => {
      fireEvent.click(mainContentLink)
    }).not.toThrow()
  })

  it('should prevent default link behavior on click', () => {
    renderWithProviders(<SkipLinks />)

    const mainContentLink = screen.getByText('Skip to main content')
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true })
    const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault')

    fireEvent(mainContentLink, clickEvent)

    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('should navigate to skill tree when clicked', () => {
    const skillTree = document.createElement('div')
    skillTree.id = 'skill-tree'
    skillTree.tabIndex = -1
    const mockFocus = vi.fn()
    const mockScrollIntoView = vi.fn()
    skillTree.focus = mockFocus
    skillTree.scrollIntoView = mockScrollIntoView
    document.body.appendChild(skillTree)

    renderWithProviders(<SkipLinks />)

    const skillTreeLink = screen.getByText('Skip to skill tree')
    fireEvent.click(skillTreeLink)

    expect(mockFocus).toHaveBeenCalled()
    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    })
  })

  it('should navigate to sidebar when clicked', () => {
    const sidebar = document.createElement('div')
    sidebar.id = 'sidebar'
    sidebar.tabIndex = -1
    const mockFocus = vi.fn()
    const mockScrollIntoView = vi.fn()
    sidebar.focus = mockFocus
    sidebar.scrollIntoView = mockScrollIntoView
    document.body.appendChild(sidebar)

    renderWithProviders(<SkipLinks />)

    const sidebarLink = screen.getByText('Skip to sidebar')
    fireEvent.click(sidebarLink)

    expect(mockFocus).toHaveBeenCalled()
    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    })
  })

  it('should navigate to course details when clicked', () => {
    const courseDetails = document.createElement('div')
    courseDetails.id = 'course-details'
    courseDetails.tabIndex = -1
    const mockFocus = vi.fn()
    const mockScrollIntoView = vi.fn()
    courseDetails.focus = mockFocus
    courseDetails.scrollIntoView = mockScrollIntoView
    document.body.appendChild(courseDetails)

    renderWithProviders(<SkipLinks />)

    const courseDetailsLink = screen.getByText('Skip to course details')
    fireEvent.click(courseDetailsLink)

    expect(mockFocus).toHaveBeenCalled()
    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    })
  })

  it('should be keyboard accessible', () => {
    renderWithProviders(<SkipLinks />)

    const mainContentLink = screen.getByText('Skip to main content')

    // Skip links should be focusable with keyboard
    mainContentLink.focus()
    expect(mainContentLink).toHaveFocus()
  })
})
