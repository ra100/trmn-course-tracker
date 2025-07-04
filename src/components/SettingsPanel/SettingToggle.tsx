import React from 'react'
import { SettingToggleProps } from './types'
import { Switch } from '~/components/ui/switch'
import { toggleItem, toggleContent, toggleLabel, settingDescription } from './SettingsPanel.styles'

export const SettingToggle: React.FC<SettingToggleProps> = React.memo(({ label, description, checked, onChange }) => {
  return (
    <div className={toggleItem}>
      <div className={toggleContent}>
        <label className={toggleLabel}>{label}</label>
        <div className={settingDescription}>{description}</div>
      </div>
      <Switch checked={checked} onCheckedChange={(details: { checked: boolean }) => onChange(details.checked)} />
    </div>
  )
})

SettingToggle.displayName = 'SettingToggle'
