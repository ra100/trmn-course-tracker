import React from 'react'
import { SettingToggleProps } from './types'
import {
  ToggleItem,
  ToggleContent,
  ToggleLabel,
  SettingDescription,
  HiddenCheckbox,
  ToggleSwitch
} from './SettingsPanel.styles'

export const SettingToggle: React.FC<SettingToggleProps> = React.memo(({ label, description, checked, onChange }) => {
  const handleClick = () => {
    onChange(!checked)
  }

  return (
    <ToggleItem onClick={handleClick}>
      <ToggleContent>
        <ToggleLabel>{label}</ToggleLabel>
        <SettingDescription>{description}</SettingDescription>
      </ToggleContent>
      <HiddenCheckbox checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <ToggleSwitch $checked={checked} />
    </ToggleItem>
  )
})

SettingToggle.displayName = 'SettingToggle'
