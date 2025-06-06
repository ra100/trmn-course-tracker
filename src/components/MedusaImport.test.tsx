import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'styled-components'
import { MedusaImport } from './MedusaImport'
import { lightTheme } from '../theme'
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
    return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>)
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

    const importButton = screen.getByRole('button', { name: 'Import Courses' })
    await user.click(importButton)

    expect(screen.getByText('Import Failed:')).toBeInTheDocument()
    expect(screen.getByText('Please paste the HTML content from your medusa.trmn.org user page.')).toBeInTheDocument()
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
      alreadyCompleted: 0
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
    ;(validateMedusaHTML as ReturnType<typeof vi.fn>).mockReturnValue({ valid: true })
    ;(parseMedusaHTML as ReturnType<typeof vi.fn>).mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            courses: [],
            parseDate: new Date(),
            errors: []
          })
        }, 100)
      })
    })

    renderWithTheme(<MedusaImport onImportMedusaCourses={mockOnImportMedusaCourses} />)

    const textarea = screen.getByPlaceholderText(/Paste the complete HTML source/)
    await user.type(textarea, 'test content')

    const importButton = screen.getByRole('button', { name: 'Import Courses' })
    await user.click(importButton)

    expect(importButton).toBeDisabled()
    expect(importButton).toHaveTextContent('Importing...')

    await waitFor(() => {
      expect(importButton).toBeEnabled()
      expect(importButton).toHaveTextContent('Import Courses')
    })
  })
})
