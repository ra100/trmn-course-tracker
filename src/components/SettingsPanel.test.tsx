import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SettingsPanel } from './SettingsPanel'
import { UserSettings } from '../types'

describe('SettingsPanel', () => {
  const defaultSettings: UserSettings = {
    theme: 'light',
    layout: 'tree',
    showCompleted: true,
    showUnavailable: true,
    autoSave: true
  }

  const mockOnSettingsChange = vi.fn()

  beforeEach(() => {
    mockOnSettingsChange.mockClear()
  })

  it('renders the settings panel with all sections', () => {
    render(<SettingsPanel settings={defaultSettings} onSettingsChange={mockOnSettingsChange} />)

    expect(screen.getByText('Display Settings')).toBeInTheDocument()
    expect(screen.getByText('Course Visibility')).toBeInTheDocument()
    expect(screen.getByText('Application')).toBeInTheDocument()
    expect(screen.getByText('Reset to Defaults')).toBeInTheDocument()
  })

  describe('Course Visibility toggles', () => {
    it('displays toggle labels and descriptions', () => {
      render(<SettingsPanel settings={defaultSettings} onSettingsChange={mockOnSettingsChange} />)

      expect(screen.getByText('Show Completed Courses')).toBeInTheDocument()
      expect(screen.getByText("Display courses you've already completed")).toBeInTheDocument()
      expect(screen.getByText('Show Locked Courses')).toBeInTheDocument()
      expect(screen.getByText('Display courses that are locked due to unmet prerequisites')).toBeInTheDocument()
    })

    it('has correct number of checkboxes', () => {
      render(<SettingsPanel settings={defaultSettings} onSettingsChange={mockOnSettingsChange} />)

      const checkboxes = screen.getAllByRole('checkbox', { hidden: true })
      expect(checkboxes).toHaveLength(3) // showCompleted, showUnavailable, autoSave
    })

    it('toggles showCompleted when checkbox changes', async () => {
      const user = userEvent.setup()
      render(<SettingsPanel settings={defaultSettings} onSettingsChange={mockOnSettingsChange} />)

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
      render(<SettingsPanel settings={defaultSettings} onSettingsChange={mockOnSettingsChange} />)

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
      render(<SettingsPanel settings={defaultSettings} onSettingsChange={mockOnSettingsChange} />)

      const checkboxes = screen.getAllByRole('checkbox', { hidden: true })
      const autoSaveCheckbox = checkboxes[2] // Third checkbox should be autoSave

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
        autoSave: false
      }

      render(<SettingsPanel settings={settingsWithFalseValues} onSettingsChange={mockOnSettingsChange} />)

      const checkboxes = screen.getAllByRole('checkbox', { hidden: true })

      expect(checkboxes[0]).not.toBeChecked() // showCompleted
      expect(checkboxes[1]).not.toBeChecked() // showUnavailable
      expect(checkboxes[2]).not.toBeChecked() // autoSave
    })
  })

  describe('Application settings', () => {
    it('displays auto-save toggle', () => {
      render(<SettingsPanel settings={defaultSettings} onSettingsChange={mockOnSettingsChange} />)

      expect(screen.getByText('Auto-save Progress')).toBeInTheDocument()
      expect(screen.getByText('Automatically save your course completion progress')).toBeInTheDocument()
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

      render(<SettingsPanel settings={customSettings} onSettingsChange={mockOnSettingsChange} />)

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

      render(<SettingsPanel settings={customSettings} onSettingsChange={mockOnSettingsChange} />)

      const resetButton = screen.getByRole('button', { name: 'Reset to Defaults' })
      await user.click(resetButton)

      expect(mockOnSettingsChange).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('renders proper semantic structure', () => {
      render(<SettingsPanel settings={defaultSettings} onSettingsChange={mockOnSettingsChange} />)

      // Check for heading
      expect(screen.getByRole('heading', { name: 'Display Settings' })).toBeInTheDocument()

      // Check for button
      expect(screen.getByRole('button', { name: 'Reset to Defaults' })).toBeInTheDocument()

      // Check for checkboxes (even though they're hidden)
      const checkboxes = screen.getAllByRole('checkbox', { hidden: true })
      expect(checkboxes).toHaveLength(3)
    })

    it('has proper button accessibility', () => {
      render(<SettingsPanel settings={defaultSettings} onSettingsChange={mockOnSettingsChange} />)

      const resetButton = screen.getByRole('button', { name: 'Reset to Defaults' })
      expect(resetButton).toBeEnabled()
    })
  })
})
