import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'styled-components'
import { SettingsPanel } from './SettingsPanel'
import { UserSettings } from '../types'
import { lightTheme } from '../theme'

describe('SettingsPanel', () => {
  const defaultSettings: UserSettings = {
    theme: 'light',
    layout: 'tree',
    showCompleted: true,
    showUnavailable: true,
    autoSave: true
  }

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>)
  }

  const mockOnSettingsChange = vi.fn()

  beforeEach(() => {
    mockOnSettingsChange.mockClear()
  })

  it('renders the settings panel with all sections', () => {
    renderWithTheme(<SettingsPanel settings={defaultSettings} onSettingsChange={mockOnSettingsChange} />)

    expect(screen.getByText('Display Settings')).toBeInTheDocument()
    expect(screen.getByText('Course Visibility')).toBeInTheDocument()
    expect(screen.getByText('Application')).toBeInTheDocument()
    expect(screen.getByText('Reset to Defaults')).toBeInTheDocument()
  })

  describe('Course Visibility toggles', () => {
    it('displays toggle labels and descriptions', () => {
      renderWithTheme(<SettingsPanel settings={defaultSettings} onSettingsChange={mockOnSettingsChange} />)

      expect(screen.getByText('Show Completed Courses')).toBeInTheDocument()
      expect(screen.getByText("Display courses you've already completed")).toBeInTheDocument()
      expect(screen.getByText('Show Locked Courses')).toBeInTheDocument()
      expect(screen.getByText('Display courses that are locked due to unmet prerequisites')).toBeInTheDocument()
    })

    it('has correct number of checkboxes', () => {
      renderWithTheme(<SettingsPanel settings={defaultSettings} onSettingsChange={mockOnSettingsChange} />)

      const checkboxes = screen.getAllByRole('checkbox', { hidden: true })
      expect(checkboxes).toHaveLength(4) // showCompleted, showUnavailable, darkMode, autoSave
    })

    it('toggles showCompleted when checkbox changes', async () => {
      const user = userEvent.setup()
      renderWithTheme(<SettingsPanel settings={defaultSettings} onSettingsChange={mockOnSettingsChange} />)

      const checkboxes = screen.getAllByRole('checkbox', { hidden: true })
      const showCompletedCheckbox = checkboxes[0] // First checkbox should be showCompleted

      expect(showCompletedCheckbox).toBeChecked()

      await user.click(showCompletedCheckbox)

      expect(mockOnSettingsChange).toHaveBeenCalledWith({
        ...defaultSettings,
        showCompleted: false
      })
    })

    it('toggles showUnavailable when checkbox changes', async () => {
      const user = userEvent.setup()
      renderWithTheme(<SettingsPanel settings={defaultSettings} onSettingsChange={mockOnSettingsChange} />)

      const checkboxes = screen.getAllByRole('checkbox', { hidden: true })
      const showUnavailableCheckbox = checkboxes[1] // Second checkbox should be showUnavailable

      expect(showUnavailableCheckbox).toBeChecked()

      await user.click(showUnavailableCheckbox)

      expect(mockOnSettingsChange).toHaveBeenCalledWith({
        ...defaultSettings,
        showUnavailable: false
      })
    })

    it('toggles autoSave when checkbox changes', async () => {
      const user = userEvent.setup()
      renderWithTheme(<SettingsPanel settings={defaultSettings} onSettingsChange={mockOnSettingsChange} />)

      const checkboxes = screen.getAllByRole('checkbox', { hidden: true })
      const autoSaveCheckbox = checkboxes[3] // Fourth checkbox should be autoSave (after dark mode)

      expect(autoSaveCheckbox).toBeChecked()

      await user.click(autoSaveCheckbox)

      expect(mockOnSettingsChange).toHaveBeenCalledWith({
        ...defaultSettings,
        autoSave: false
      })
    })

    it('reflects false initial states correctly', () => {
      const settingsWithFalseValues: UserSettings = {
        ...defaultSettings,
        showCompleted: false,
        showUnavailable: false,
        theme: 'light', // dark mode off
        autoSave: false
      }

      renderWithTheme(<SettingsPanel settings={settingsWithFalseValues} onSettingsChange={mockOnSettingsChange} />)

      const checkboxes = screen.getAllByRole('checkbox', { hidden: true })

      expect(checkboxes[0]).not.toBeChecked() // showCompleted
      expect(checkboxes[1]).not.toBeChecked() // showUnavailable
      expect(checkboxes[2]).not.toBeChecked() // dark mode
      expect(checkboxes[3]).not.toBeChecked() // autoSave
    })
  })

  describe('Application settings', () => {
    it('displays dark mode toggle', () => {
      renderWithTheme(<SettingsPanel settings={defaultSettings} onSettingsChange={mockOnSettingsChange} />)

      expect(screen.getByText('Dark Mode')).toBeInTheDocument()
      expect(screen.getByText('Switch between light and dark theme')).toBeInTheDocument()
    })

    it('displays auto-save toggle', () => {
      renderWithTheme(<SettingsPanel settings={defaultSettings} onSettingsChange={mockOnSettingsChange} />)

      expect(screen.getByText('Auto-save Progress')).toBeInTheDocument()
      expect(screen.getByText('Automatically save your course completion progress')).toBeInTheDocument()
    })

    it('toggles dark mode when clicked', async () => {
      const user = userEvent.setup()
      renderWithTheme(<SettingsPanel settings={defaultSettings} onSettingsChange={mockOnSettingsChange} />)

      const checkboxes = screen.getAllByRole('checkbox', { hidden: true })
      const darkModeCheckbox = checkboxes[2] // Third checkbox should be dark mode

      expect(darkModeCheckbox).not.toBeChecked() // light mode by default

      await user.click(darkModeCheckbox)

      expect(mockOnSettingsChange).toHaveBeenCalledWith({
        ...defaultSettings,
        theme: 'dark'
      })
    })

    it('shows dark mode as checked when theme is dark', () => {
      const darkSettings: UserSettings = {
        ...defaultSettings,
        theme: 'dark'
      }

      renderWithTheme(<SettingsPanel settings={darkSettings} onSettingsChange={mockOnSettingsChange} />)

      const checkboxes = screen.getAllByRole('checkbox', { hidden: true })
      const darkModeCheckbox = checkboxes[2] // Third checkbox should be dark mode

      expect(darkModeCheckbox).toBeChecked()
    })
  })

  describe('Reset functionality', () => {
    it('resets all settings to defaults when reset button is clicked', async () => {
      const user = userEvent.setup()
      const customSettings: UserSettings = {
        theme: 'light',
        layout: 'tree',
        showCompleted: false,
        showUnavailable: false,
        autoSave: false
      }

      renderWithTheme(<SettingsPanel settings={customSettings} onSettingsChange={mockOnSettingsChange} />)

      const resetButton = screen.getByRole('button', { name: 'Reset to Defaults' })
      await user.click(resetButton)

      expect(mockOnSettingsChange).toHaveBeenCalledWith({
        theme: 'light',
        layout: 'tree',
        showCompleted: true,
        showUnavailable: true,
        autoSave: true
      })
    })

    it('calls onSettingsChange only once when reset button is clicked', async () => {
      const user = userEvent.setup()
      const customSettings: UserSettings = {
        theme: 'light',
        layout: 'tree',
        showCompleted: false,
        showUnavailable: false,
        autoSave: false
      }

      renderWithTheme(<SettingsPanel settings={customSettings} onSettingsChange={mockOnSettingsChange} />)

      const resetButton = screen.getByRole('button', { name: 'Reset to Defaults' })
      await user.click(resetButton)

      expect(mockOnSettingsChange).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('renders proper semantic structure', () => {
      renderWithTheme(<SettingsPanel settings={defaultSettings} onSettingsChange={mockOnSettingsChange} />)

      // Check for heading
      expect(screen.getByRole('heading', { name: 'Display Settings' })).toBeInTheDocument()

      // Check for button
      expect(screen.getByRole('button', { name: 'Reset to Defaults' })).toBeInTheDocument()

      // Check for checkboxes (even though they're hidden)
      const checkboxes = screen.getAllByRole('checkbox', { hidden: true })
      expect(checkboxes).toHaveLength(4)
    })

    it('has proper button accessibility', () => {
      renderWithTheme(<SettingsPanel settings={defaultSettings} onSettingsChange={mockOnSettingsChange} />)

      const resetButton = screen.getByRole('button', { name: 'Reset to Defaults' })
      expect(resetButton).toBeEnabled()
    })
  })

  describe('Medusa Import', () => {
    const mockOnImportMedusaCourses = vi.fn()

    beforeEach(() => {
      mockOnImportMedusaCourses.mockClear()
    })

    it('shows import section when onImportMedusaCourses prop is provided', () => {
      renderWithTheme(
        <SettingsPanel
          settings={defaultSettings}
          onSettingsChange={mockOnSettingsChange}
          onImportMedusaCourses={mockOnImportMedusaCourses}
        />
      )

      expect(screen.getByText('Import from Medusa')).toBeInTheDocument()
      expect(screen.getByText('Import your completed courses from medusa.trmn.org')).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Import Courses' })).toBeInTheDocument()
    })

    it('hides import section when onImportMedusaCourses prop is not provided', () => {
      renderWithTheme(<SettingsPanel settings={defaultSettings} onSettingsChange={mockOnSettingsChange} />)

      expect(screen.queryByText('Import from Medusa')).not.toBeInTheDocument()
    })

    it('disables import button when no HTML is provided', () => {
      renderWithTheme(
        <SettingsPanel
          settings={defaultSettings}
          onSettingsChange={mockOnSettingsChange}
          onImportMedusaCourses={mockOnImportMedusaCourses}
        />
      )

      const importButton = screen.getByRole('button', { name: 'Import Courses' })
      expect(importButton).toBeDisabled()
    })

    it('enables import button when HTML is provided', async () => {
      const user = userEvent.setup()
      renderWithTheme(
        <SettingsPanel
          settings={defaultSettings}
          onSettingsChange={mockOnSettingsChange}
          onImportMedusaCourses={mockOnImportMedusaCourses}
        />
      )

      const textArea = screen.getByRole('textbox')
      const importButton = screen.getByRole('button', { name: 'Import Courses' })

      await user.type(textArea, '<html><body>some content</body></html>')

      expect(importButton).toBeEnabled()
    })

    it('shows clear button when HTML is entered', async () => {
      const user = userEvent.setup()
      renderWithTheme(
        <SettingsPanel
          settings={defaultSettings}
          onSettingsChange={mockOnSettingsChange}
          onImportMedusaCourses={mockOnImportMedusaCourses}
        />
      )

      const textArea = screen.getByRole('textbox')
      await user.type(textArea, '<html><body>some content</body></html>')

      expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument()
    })

    it('clears textarea when clear button is clicked', async () => {
      const user = userEvent.setup()
      renderWithTheme(
        <SettingsPanel
          settings={defaultSettings}
          onSettingsChange={mockOnSettingsChange}
          onImportMedusaCourses={mockOnImportMedusaCourses}
        />
      )

      const textArea = screen.getByRole('textbox') as HTMLTextAreaElement
      await user.type(textArea, '<html><body>some content</body></html>')

      const clearButton = screen.getByRole('button', { name: 'Clear' })
      await user.click(clearButton)

      expect(textArea.value).toBe('')
    })

    it('shows import instructions', () => {
      renderWithTheme(
        <SettingsPanel
          settings={defaultSettings}
          onSettingsChange={mockOnSettingsChange}
          onImportMedusaCourses={mockOnImportMedusaCourses}
        />
      )

      expect(screen.getByText('Log in to medusa.trmn.org')).toBeInTheDocument()
      expect(screen.getByText('Go to your user page (/user)')).toBeInTheDocument()
      expect(screen.getByText('Click the "Academic Record" tab')).toBeInTheDocument()
      expect(screen.getByText('Right-click → "View Page Source" or press Ctrl+U')).toBeInTheDocument()
      expect(screen.getByText('Copy all the HTML and paste it below')).toBeInTheDocument()
    })

    it('displays detailed import statistics in success message', async () => {
      const user = userEvent.setup()

      // Mock the import function to return statistics
      mockOnImportMedusaCourses.mockReturnValue({
        imported: 10,
        trackable: 6,
        alreadyCompleted: 2
      })

      renderWithTheme(
        <SettingsPanel
          settings={defaultSettings}
          onSettingsChange={mockOnSettingsChange}
          onImportMedusaCourses={mockOnImportMedusaCourses}
        />
      )

      const validHtml = `
        <html>
          <head><title>medusa.trmn.org - User Page</title></head>
          <body>
            <div class="container">
              <div class="Academic Record">
                <div role="tabpanel" id="RMN">
                  <div class="row zebra-odd">
                    <div class="col-sm-6">SIA-RMN-0001 Test Course</div>
                    <div class="col-sm-1">Pass</div>
                    <div class="col-sm-3">2023-01-01</div>
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `

      const textArea = screen.getByRole('textbox')
      await user.type(textArea, validHtml)

      const importButton = screen.getByRole('button', { name: 'Import Courses' })
      await user.click(importButton)

      // Wait for the success message to appear
      await waitFor(() => {
        expect(screen.getByText('Success!')).toBeInTheDocument()
      })

      // Check that detailed statistics are displayed
      expect(screen.getByText(/Found 1 completed courses in Medusa/)).toBeInTheDocument()
      expect(screen.getByText(/6 courses are trackable in TRMN system/)).toBeInTheDocument()
      expect(screen.getByText(/4 new courses added/)).toBeInTheDocument()
      expect(screen.getByText(/2 courses were already completed/)).toBeInTheDocument()
      expect(screen.getByText(/4 courses from Medusa are not tracked by this app/)).toBeInTheDocument()
    })
  })
})
