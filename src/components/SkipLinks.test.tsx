import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SkipLinks } from './SkipLinks'

const mockTargets = [
  { id: 'main-content', label: 'Skip to main content' },
  { id: 'skill-tree', label: 'Skip to skill tree' },
  { id: 'sidebar', label: 'Skip to sidebar' },
  { id: 'course-details', label: 'Skip to course details' }
]

describe('SkipLinks', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  it('should render all skip links', () => {
    render(<SkipLinks targets={mockTargets} />)

    expect(screen.getByText('Skip to main content')).toBeInTheDocument()
    expect(screen.getByText('Skip to skill tree')).toBeInTheDocument()
    expect(screen.getByText('Skip to sidebar')).toBeInTheDocument()
    expect(screen.getByText('Skip to course details')).toBeInTheDocument()
  })

  it('should have proper href attributes', () => {
    render(<SkipLinks targets={mockTargets} />)

    const mainContentLink = screen.getByText('Skip to main content')
    const skillTreeLink = screen.getByText('Skip to skill tree')
    const sidebarLink = screen.getByText('Skip to sidebar')
    const courseDetailsLink = screen.getByText('Skip to course details')

    expect(mainContentLink.getAttribute('href')).toBe('#main-content')
    expect(skillTreeLink.getAttribute('href')).toBe('#skill-tree')
    expect(sidebarLink.getAttribute('href')).toBe('#sidebar')
    expect(courseDetailsLink.getAttribute('href')).toBe('#course-details')
  })

  it('should handle click events and navigate to targets', () => {
    // Create mock elements
    const mainContent = document.createElement('div')
    mainContent.id = 'main-content'
    mainContent.focus = vi.fn()
    mainContent.scrollIntoView = vi.fn()
    document.body.appendChild(mainContent)

    render(<SkipLinks targets={mockTargets} />)

    const mainContentLink = screen.getByText('Skip to main content')
    fireEvent.click(mainContentLink)

    expect(mainContent.focus).toHaveBeenCalled()
    expect(mainContent.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    })

    // Cleanup
    document.body.removeChild(mainContent)
  })

  it('should handle missing target elements gracefully', () => {
    render(<SkipLinks targets={mockTargets} />)

    // Click on a link with no corresponding element
    const mainContentLink = screen.getByText('Skip to main content')

    // Should not throw an error
    expect(() => fireEvent.click(mainContentLink)).not.toThrow()
  })

  it('should prevent default link behavior on click', () => {
    render(<SkipLinks targets={mockTargets} />)

    const mainContentLink = screen.getByText('Skip to main content')
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true })
    const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault')

    fireEvent(mainContentLink, clickEvent)

    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('should navigate to skill tree when clicked', () => {
    const skillTree = document.createElement('div')
    skillTree.id = 'skill-tree'
    skillTree.focus = vi.fn()
    skillTree.scrollIntoView = vi.fn()
    document.body.appendChild(skillTree)

    render(<SkipLinks targets={mockTargets} />)

    const skillTreeLink = screen.getByText('Skip to skill tree')
    fireEvent.click(skillTreeLink)

    expect(skillTree.focus).toHaveBeenCalled()
    expect(skillTree.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    })

    document.body.removeChild(skillTree)
  })

  it('should navigate to sidebar when clicked', () => {
    const sidebar = document.createElement('div')
    sidebar.id = 'sidebar'
    sidebar.focus = vi.fn()
    sidebar.scrollIntoView = vi.fn()
    document.body.appendChild(sidebar)

    render(<SkipLinks targets={mockTargets} />)

    const sidebarLink = screen.getByText('Skip to sidebar')
    fireEvent.click(sidebarLink)

    expect(sidebar.focus).toHaveBeenCalled()
    expect(sidebar.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    })

    document.body.removeChild(sidebar)
  })

  it('should navigate to course details when clicked', () => {
    const courseDetails = document.createElement('div')
    courseDetails.id = 'course-details'
    courseDetails.focus = vi.fn()
    courseDetails.scrollIntoView = vi.fn()
    document.body.appendChild(courseDetails)

    render(<SkipLinks targets={mockTargets} />)

    const courseDetailsLink = screen.getByText('Skip to course details')
    fireEvent.click(courseDetailsLink)

    expect(courseDetails.focus).toHaveBeenCalled()
    expect(courseDetails.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    })

    document.body.removeChild(courseDetails)
  })

  it('should be keyboard accessible', () => {
    render(<SkipLinks targets={mockTargets} />)

    const links = screen.getAllByRole('link')
    links.forEach((link) => {
      expect(link).toHaveAttribute('href')
      expect(link.tabIndex).not.toBe(-1)
    })
  })
})
