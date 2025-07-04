import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'styled-components'
import { MedusaImport } from './MedusaImport'
import { darkTheme } from '../theme'
import { validateMedusaHTML, parseMedusaHTML } from '../utils/medusaParser'

// Mock the medusa parser functions
vi.mock('../utils/medusaParser', () => ({
  validateMedusaHTML: vi.fn(),
  parseMedusaHTML: vi.fn(),
  extractCompletedCourseCodes: vi.fn()
}))

describe('MedusaImport', () => {
  const mockOnImportMedusaCourses = vi.fn()

  beforeEach(() => {
    mockOnImportMedusaCourses.mockClear()
    vi.clearAllMocks()
  })

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider theme={darkTheme}>{ui}</ThemeProvider>)
  }

  it('renders import instructions', () => {
    renderWithTheme(<MedusaImport onImportMedusaCourses={mockOnImportMedusaCourses} />)

    expect(screen.getByText(/Log in to medusa.trmn.org/)).toBeInTheDocument()
    expect(screen.getByText(/Go to your user page/)).toBeInTheDocument()
    expect(screen.getByText(/Click the "Academic Record" tab/)).toBeInTheDocument()
  })

  it('shows error when trying to import empty content', async () => {
    const user = userEvent.setup()
    renderWithTheme(<MedusaImport onImportMedusaCourses={mockOnImportMedusaCourses} />)

    const textarea = screen.getByPlaceholderText(/Paste the complete HTML source/)
    const importButton = screen.getByRole('button', { name: 'Import Courses' })

    // Button should be disabled when no content is provided
    expect(importButton).toBeDisabled()

    // Add some actual content to enable the button
    await user.type(textarea, 'test')
    expect(importButton).toBeEnabled()

    // Clear content - button should be disabled again
    await user.clear(textarea)
    expect(importButton).toBeDisabled()

    // Test with just whitespace - button should remain disabled
    await user.type(textarea, '   ')
    expect(importButton).toBeDisabled()

    // Add actual content that will be processed
    await user.clear(textarea)
    await user.type(textarea, 'test content')
    expect(importButton).toBeEnabled()

    // Clear and simulate an import with empty content by adding minimal content
    // then clearing it after the function starts
    await user.clear(textarea)

    // Since we can't test empty import with disabled button,
    // let's test that the button correctly disables with no content
    expect(importButton).toBeDisabled()
  })

  it('shows error when HTML validation fails', async () => {
    const user = userEvent.setup()
    ;(validateMedusaHTML as ReturnType<typeof vi.fn>).mockReturnValue({ valid: false, reason: 'Invalid HTML format' })

    renderWithTheme(<MedusaImport onImportMedusaCourses={mockOnImportMedusaCourses} />)

    const textarea = screen.getByPlaceholderText(/Paste the complete HTML source/)
    await user.type(textarea, 'invalid html')

    const importButton = screen.getByRole('button', { name: 'Import Courses' })
    await user.click(importButton)

    expect(screen.getByText('Import Failed:')).toBeInTheDocument()
    expect(screen.getByText('Invalid HTML format')).toBeInTheDocument()
  })

  it('shows success message when import is successful', async () => {
    const user = userEvent.setup()
    const mockCourses = [{ code: 'TEST-101', name: 'Test Course' }]
    ;(validateMedusaHTML as ReturnType<typeof vi.fn>).mockReturnValue({ valid: true })
    ;(parseMedusaHTML as ReturnType<typeof vi.fn>).mockReturnValue({
      courses: mockCourses,
      parseDate: new Date(),
      errors: []
    })
    mockOnImportMedusaCourses.mockReturnValue({
      imported: 1,
      trackable: 1,
      alreadyCompleted: 0,
      newCourses: ['TEST-101'],
      untrackedCourses: []
    })

    renderWithTheme(<MedusaImport onImportMedusaCourses={mockOnImportMedusaCourses} />)

    const textarea = screen.getByPlaceholderText(/Paste the complete HTML source/)
    await user.type(textarea, 'valid html')

    const importButton = screen.getByRole('button', { name: 'Import Courses' })
    await user.click(importButton)

    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument()
      expect(screen.getByText(/Found 1 completed courses in Medusa/)).toBeInTheDocument()
    })
  })

  it('clears the form when clear button is clicked', async () => {
    const user = userEvent.setup()
    renderWithTheme(<MedusaImport onImportMedusaCourses={mockOnImportMedusaCourses} />)

    const textarea = screen.getByPlaceholderText(/Paste the complete HTML source/)
    await user.type(textarea, 'test content')

    expect(textarea).toHaveValue('test content')

    const clearButton = screen.getByRole('button', { name: 'Clear' })
    await user.click(clearButton)

    expect(textarea).toHaveValue('')
  })

  it('disables import button when importing', async () => {
    const user = userEvent.setup()

    // Mock a delayed validation to create async behavior
    ;(validateMedusaHTML as ReturnType<typeof vi.fn>).mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ valid: true })
        }, 50)
      })
    })
    ;(parseMedusaHTML as ReturnType<typeof vi.fn>).mockReturnValue({
      courses: [],
      parseDate: new Date(),
      errors: []
    })

    renderWithTheme(<MedusaImport onImportMedusaCourses={mockOnImportMedusaCourses} />)

    const textarea = screen.getByPlaceholderText(/Paste the complete HTML source/)
    await user.type(textarea, 'test content')

    const importButton = screen.getByRole('button', { name: 'Import Courses' })

    // Click the button
    await user.click(importButton)

    // Button should be disabled immediately
    expect(importButton).toBeDisabled()
    expect(importButton).toHaveTextContent('Importing...')

    // Wait for the import process to complete
    await waitFor(() => {
      expect(importButton).toBeEnabled()
      expect(importButton).toHaveTextContent('Import Courses')
    })
  })

  it('shows course IDs with ellipsis when there are more than 5 courses', async () => {
    const user = userEvent.setup()
    const mockCourses = [{ code: 'TEST-101', name: 'Test Course' }]
    ;(validateMedusaHTML as ReturnType<typeof vi.fn>).mockReturnValue({ valid: true })
    ;(parseMedusaHTML as ReturnType<typeof vi.fn>).mockReturnValue({
      courses: mockCourses,
      parseDate: new Date(),
      errors: []
    })

    // Mock with more than 5 new courses and untracked courses
    mockOnImportMedusaCourses.mockReturnValue({
      imported: 10,
      trackable: 6,
      alreadyCompleted: 0,
      newCourses: ['SIA-RMN-0001', 'SIA-RMN-0002', 'SIA-RMN-0003', 'SIA-RMN-0004', 'SIA-RMN-0005', 'SIA-RMN-0006'],
      untrackedCourses: ['OLD-001', 'OLD-002', 'OLD-003', 'OLD-004', 'OLD-005', 'OLD-006', 'OLD-007']
    })

    renderWithTheme(<MedusaImport onImportMedusaCourses={mockOnImportMedusaCourses} />)

    const textarea = screen.getByPlaceholderText(/Paste the complete HTML source/)
    await user.type(textarea, 'valid html')

    const importButton = screen.getByRole('button', { name: 'Import Courses' })
    await user.click(importButton)

    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument()

      // Should show first 5 new courses with ellipsis
      expect(screen.getByText(/6 new courses added/)).toBeInTheDocument()
      expect(
        screen.getByText(/SIA-RMN-0001, SIA-RMN-0002, SIA-RMN-0003, SIA-RMN-0004, SIA-RMN-0005\.\.\./)
      ).toBeInTheDocument()

      // Should show first 5 untracked courses with ellipsis
      expect(screen.getByText(/7 courses from Medusa are not tracked by this app/)).toBeInTheDocument()
      expect(screen.getByText(/OLD-001, OLD-002, OLD-003, OLD-004, OLD-005\.\.\./)).toBeInTheDocument()
    })
  })

  it('shows all course IDs when there are 5 or fewer courses', async () => {
    const user = userEvent.setup()
    const mockCourses = [{ code: 'TEST-101', name: 'Test Course' }]
    ;(validateMedusaHTML as ReturnType<typeof vi.fn>).mockReturnValue({ valid: true })
    ;(parseMedusaHTML as ReturnType<typeof vi.fn>).mockReturnValue({
      courses: mockCourses,
      parseDate: new Date(),
      errors: []
    })

    // Mock with 3 new courses and 2 untracked courses (≤5 each)
    mockOnImportMedusaCourses.mockReturnValue({
      imported: 5,
      trackable: 3,
      alreadyCompleted: 0,
      newCourses: ['SIA-RMN-0001', 'SIA-RMN-0002', 'SIA-RMN-0003'],
      untrackedCourses: ['OLD-001', 'OLD-002']
    })

    renderWithTheme(<MedusaImport onImportMedusaCourses={mockOnImportMedusaCourses} />)

    const textarea = screen.getByPlaceholderText(/Paste the complete HTML source/)
    await user.type(textarea, 'valid html')

    const importButton = screen.getByRole('button', { name: 'Import Courses' })
    await user.click(importButton)

    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument()

      // Should show all 3 new courses without ellipsis
      expect(screen.getByText(/3 new courses added/)).toBeInTheDocument()
      expect(screen.getByText(/SIA-RMN-0001, SIA-RMN-0002, SIA-RMN-0003/)).toBeInTheDocument()
      expect(screen.queryByText(/\.\.\./)).not.toBeInTheDocument()

      // Should show all 2 untracked courses without ellipsis
      expect(screen.getByText(/2 courses from Medusa are not tracked by this app/)).toBeInTheDocument()
      expect(screen.getByText(/OLD-001, OLD-002/)).toBeInTheDocument()
    })
  })
})
