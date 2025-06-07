import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'styled-components'
import { SettingsPanel } from './SettingsPanel'
import { UserSettings } from '../types'
import { lightTheme } from '../theme'
import { I18nProvider } from '../i18n'

describe('SettingsPanel', () => {
  const defaultSettings: UserSettings = {
    theme: 'light',
    layout: 'tree',
    showCompleted: true,
    showUnavailable: true,
    autoSave: true,
    language: 'en'
  }

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(
      <ThemeProvider theme={lightTheme}>
        <I18nProvider>{ui}</I18nProvider>
      </ThemeProvider>
    )
  }

  const mockOnSettingsChange = vi.fn()

  beforeEach(() => {
    mockOnSettingsChange.mockClear()
  })

  it('renders the settings panel with all sections', () => {
    renderWithTheme(<SettingsPanel settings={defaultSettings} onSettingsChange={mockOnSettingsChange} />)

    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Language')).toBeInTheDocument()
    expect(screen.getByText('Theme')).toBeInTheDocument()
    expect(screen.getByText('Reset to Defaults')).toBeInTheDocument()
  })

  describe('Course Visibility toggles', () => {
    it('displays toggle labels and descriptions', () => {
      renderWithTheme(<SettingsPanel settings={defaultSettings} onSettingsChange={mockOnSettingsChange} />)

      expect(screen.getByText('Show Completed')).toBeInTheDocument()
      expect(screen.getByText("Display courses you've already completed")).toBeInTheDocument()
      expect(screen.getByText('Show Unavailable')).toBeInTheDocument()
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
        autoSave: false,
        language: 'en'
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

      expect(screen.getByText('Dark')).toBeInTheDocument()
      expect(screen.getByText('Switch between light and dark theme')).toBeInTheDocument()
    })

    it('displays auto-save toggle', () => {
      renderWithTheme(<SettingsPanel settings={defaultSettings} onSettingsChange={mockOnSettingsChange} />)

      expect(screen.getByText('Auto Save')).toBeInTheDocument()
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
        autoSave: false,
        language: 'en'
      }

      renderWithTheme(<SettingsPanel settings={customSettings} onSettingsChange={mockOnSettingsChange} />)

      const resetButton = screen.getByRole('button', { name: 'Reset to Defaults' })
      await user.click(resetButton)

      expect(mockOnSettingsChange).toHaveBeenCalledWith({
        theme: 'light',
        layout: 'tree',
        showCompleted: true,
        showUnavailable: true,
        autoSave: true,
        language: 'en'
      })
    })

    it('calls onSettingsChange only once when reset button is clicked', async () => {
      const user = userEvent.setup()
      const customSettings: UserSettings = {
        theme: 'light',
        layout: 'tree',
        showCompleted: false,
        showUnavailable: false,
        autoSave: false,
        language: 'en'
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
      expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()

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
})
