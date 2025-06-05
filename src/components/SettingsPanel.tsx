import React from 'react'
import styled from 'styled-components'
import { UserSettings } from '../types'

const PanelContainer = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #34495e;
`

const PanelTitle = styled.h3`
  color: #ecf0f1;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
`

const SettingSection = styled.div`
  margin-bottom: 1.5rem;
`

const SettingLabel = styled.label`
  display: block;
  color: #bdc3c7;
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
  color: #ecf0f1;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.6rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
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
  background-color: ${(props) => (props.checked ? '#27ae60' : '#525862')};
  border-radius: 13px;
  transition: all 0.3s ease;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);

  &:hover {
    background-color: ${(props) => (props.checked ? '#2ecc71' : '#5a6270')};
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
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  display: none;
`

const SettingDescription = styled.div`
  font-size: 0.75rem;
  color: #95a5a6;
  margin-top: 0.2rem;
  line-height: 1.3;
`

const ResetButton = styled.button`
  background: #e67e22;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  margin-top: 1rem;
  width: 100%;

  &:hover {
    background: #d35400;
  }
`

interface SettingsPanelProps {
  settings: UserSettings
  onSettingsChange: (settings: UserSettings) => void
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange }) => {
  const handleToggle = (key: keyof UserSettings, value: boolean) => {
    onSettingsChange({
      ...settings,
      [key]: value
    })
  }

  const handleReset = () => {
    onSettingsChange({
      theme: 'light',
      layout: 'tree',
      showCompleted: true,
      showUnavailable: true,
      autoSave: true
    })
  }

  return (
    <PanelContainer>
      <PanelTitle>Display Settings</PanelTitle>

      <SettingSection>
        <SettingLabel>Course Visibility</SettingLabel>
        <ToggleGroup>
          <ToggleItem onClick={() => handleToggle('showCompleted', !settings.showCompleted)}>
            <ToggleContent>
              <ToggleLabel>Show Completed Courses</ToggleLabel>
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
              <ToggleLabel>Show Locked Courses</ToggleLabel>
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
        <SettingLabel>Application</SettingLabel>
        <ToggleGroup>
          <ToggleItem onClick={() => handleToggle('autoSave', !settings.autoSave)}>
            <ToggleContent>
              <ToggleLabel>Auto-save Progress</ToggleLabel>
              <SettingDescription>Automatically save your course completion progress</SettingDescription>
            </ToggleContent>
            <HiddenCheckbox checked={settings.autoSave} onChange={(e) => handleToggle('autoSave', e.target.checked)} />
            <ToggleSwitch checked={settings.autoSave} />
          </ToggleItem>
        </ToggleGroup>
      </SettingSection>

      <ResetButton onClick={handleReset}>Reset to Defaults</ResetButton>
    </PanelContainer>
  )
}
