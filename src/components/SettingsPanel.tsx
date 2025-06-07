import React from 'react'
import styled from 'styled-components'
import { UserSettings } from '../types'
import { MedusaImport } from './MedusaImport'
import { useT, useTranslation, Language } from '../i18n'

const PanelContainer = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
`

const PanelTitle = styled.h3`
  color: ${(props) => props.theme.colors.text};
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
`

const SettingSection = styled.div`
  margin-bottom: 1.5rem;
`

const SettingLabel = styled.label`
  display: block;
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
`

const ToggleGroup = styled.div`
  display: flex;
  flex-direction: column;
`

const ToggleItem = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  color: ${(props) => props.theme.colors.text};
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.6rem 0;
  border-bottom: 1px solid ${(props) => props.theme.colors.borderLight};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${(props) => props.theme.colors.surfaceSecondary};
    border-radius: 4px;
  }
`

const ToggleContent = styled.div`
  flex: 1;
  margin-right: 1rem;
`

const ToggleLabel = styled.div`
  font-weight: 500;
  margin-bottom: 0.2rem;
`

const ToggleSwitch = styled.div<{ checked: boolean }>`
  position: relative;
  width: 48px;
  height: 26px;
  background-color: ${(props) => (props.checked ? props.theme.colors.success : props.theme.colors.secondary)};
  border-radius: 13px;
  transition: all 0.3s ease;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: inset 0 1px 3px ${(props) => props.theme.colors.shadow};

  &:hover {
    background-color: ${(props) => (props.checked ? props.theme.colors.success : props.theme.colors.secondary)};
    opacity: 0.8;
  }

  &:before {
    content: '';
    position: absolute;
    top: 2px;
    left: ${(props) => (props.checked ? '24px' : '2px')};
    width: 22px;
    height: 22px;
    background-color: white;
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: ${(props) => props.theme.shadows.small};
  }
`

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  display: none;
`

const SettingDescription = styled.div`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.textMuted};
  margin-top: 0.2rem;
  line-height: 1.3;
`

const ResetButton = styled.button`
  background: ${(props) => props.theme.colors.warning};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  margin-top: 1rem;
  width: 100%;

  &:hover {
    opacity: 0.9;
  }
`

const LanguageSelector = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  background-color: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.text};
  font-size: 0.85rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
  }
`

interface SettingsPanelProps {
  settings: UserSettings
  onSettingsChange: (settings: UserSettings) => void
  onImportMedusaCourses?: (courseCodes: string[]) => { imported: number; trackable: number; alreadyCompleted: number }
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange, onImportMedusaCourses }) => {
  const t = useT()
  const { setLanguage } = useTranslation()
  const handleToggle = (key: keyof UserSettings, value: boolean) => {
    onSettingsChange({
      ...settings,
      [key]: value
    })
  }

  const handleThemeToggle = () => {
    onSettingsChange({
      ...settings,
      theme: settings.theme === 'light' ? 'dark' : 'light'
    })
  }

  const handleLanguageChange = (language: Language) => {
    const newSettings = {
      ...settings,
      language
    }
    onSettingsChange(newSettings)
    setLanguage(language)
  }

  const handleReset = () => {
    onSettingsChange({
      theme: 'light',
      layout: 'tree',
      showCompleted: true,
      showUnavailable: true,
      autoSave: true,
      language: 'en'
    })
  }

  return (
    <PanelContainer>
      <PanelTitle>{t.settings.title}</PanelTitle>

      <SettingSection>
        <SettingLabel>{t.filters.status}</SettingLabel>
        <ToggleGroup>
          <ToggleItem onClick={() => handleToggle('showCompleted', !settings.showCompleted)}>
            <ToggleContent>
              <ToggleLabel>{t.filters.showCompleted}</ToggleLabel>
              <SettingDescription>Display courses you've already completed</SettingDescription>
            </ToggleContent>
            <HiddenCheckbox
              checked={settings.showCompleted}
              onChange={(e) => handleToggle('showCompleted', e.target.checked)}
            />
            <ToggleSwitch checked={settings.showCompleted} />
          </ToggleItem>

          <ToggleItem onClick={() => handleToggle('showUnavailable', !settings.showUnavailable)}>
            <ToggleContent>
              <ToggleLabel>{t.filters.showUnavailable}</ToggleLabel>
              <SettingDescription>Display courses that are locked due to unmet prerequisites</SettingDescription>
            </ToggleContent>
            <HiddenCheckbox
              checked={settings.showUnavailable}
              onChange={(e) => handleToggle('showUnavailable', e.target.checked)}
            />
            <ToggleSwitch checked={settings.showUnavailable} />
          </ToggleItem>
        </ToggleGroup>
      </SettingSection>

      <SettingSection>
        <SettingLabel>{t.settings.language}</SettingLabel>
        <LanguageSelector
          value={settings.language}
          onChange={(e) => handleLanguageChange(e.target.value as Language)}
          aria-label={t.settings.language}
          title={t.settings.language}
        >
          <option value="en">English</option>
          <option value="cs">Čeština</option>
        </LanguageSelector>
      </SettingSection>

      <SettingSection>
        <SettingLabel>{t.settings.theme}</SettingLabel>
        <ToggleGroup>
          <ToggleItem onClick={handleThemeToggle}>
            <ToggleContent>
              <ToggleLabel>{t.settings.dark}</ToggleLabel>
              <SettingDescription>Switch between light and dark theme</SettingDescription>
            </ToggleContent>
            <HiddenCheckbox checked={settings.theme === 'dark'} onChange={handleThemeToggle} />
            <ToggleSwitch checked={settings.theme === 'dark'} />
          </ToggleItem>

          <ToggleItem onClick={() => handleToggle('autoSave', !settings.autoSave)}>
            <ToggleContent>
              <ToggleLabel>{t.settings.autoSave}</ToggleLabel>
              <SettingDescription>Automatically save your course completion progress</SettingDescription>
            </ToggleContent>
            <HiddenCheckbox checked={settings.autoSave} onChange={(e) => handleToggle('autoSave', e.target.checked)} />
            <ToggleSwitch checked={settings.autoSave} />
          </ToggleItem>
        </ToggleGroup>
      </SettingSection>

      {onImportMedusaCourses && <MedusaImport onImportMedusaCourses={onImportMedusaCourses} />}

      <ResetButton onClick={handleReset}>{t.ui.reset} to Defaults</ResetButton>
    </PanelContainer>
  )
}
