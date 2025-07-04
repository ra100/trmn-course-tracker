import React from 'react'
import { StatusFilterSectionProps } from './types'
import { useT } from '~/i18n'
import { SettingToggle } from './SettingToggle'
import { settingSection, settingLabel, toggleGroup } from './SettingsPanel.styles'

export const StatusFilterSection: React.FC<StatusFilterSectionProps> = React.memo(
  ({ showCompleted, showUnavailable, onToggle }) => {
    const t = useT()

    return (
      <div className={settingSection}>
        <div className={settingLabel}>{t.filters.status}</div>
        <div className={toggleGroup}>
          <SettingToggle
            label={t.filters.showCompleted}
            description="Display courses you've already completed"
            checked={showCompleted}
            onChange={(checked) => onToggle('showCompleted', checked)}
          />

          <SettingToggle
            label={t.filters.showUnavailable}
            description="Display courses that are locked due to unmet prerequisites"
            checked={showUnavailable}
            onChange={(checked) => onToggle('showUnavailable', checked)}
          />
        </div>
      </div>
    )
  }
)

StatusFilterSection.displayName = 'StatusFilterSection'
