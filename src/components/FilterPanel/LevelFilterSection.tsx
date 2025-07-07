import React from 'react'
import { CourseLevel, FilterOptions } from '~/types'
import { useT } from '~/i18n'
import { Switch } from '~/components/ui/switch'
import { filterSection, filterLabel } from './filterPanel.styles'
import { css } from 'styled-system/css'

interface LevelFilterSectionProps {
  filters: FilterOptions
  onLevelChange: (level: CourseLevel, checked: boolean) => void
}

/**
 * LevelFilterSection handles course level filtering
 */
export const LevelFilterSection: React.FC<LevelFilterSectionProps> = ({ filters, onLevelChange }) => {
  const t = useT()
  const levels: CourseLevel[] = ['A', 'C', 'D', 'W']

  const getLevelLabel = (level: CourseLevel): string => {
    return t.filters.levelLabels[level] || level
  }

  return (
    <div className={filterSection}>
      <label id="level-filter-label" className={filterLabel}>
        {t.filters.levels}
      </label>
      <div
        role="group"
        aria-labelledby="level-filter-label"
        className={css({ display: 'flex', flexDirection: 'column', gap: '0.3rem' })}
      >
        {levels.map((level) => (
          <Switch
            key={level}
            checked={filters.levels?.includes(level) || false}
            onCheckedChange={(details: { checked: boolean }) => onLevelChange(level, details.checked === true)}
          >
            {getLevelLabel(level)}
          </Switch>
        ))}
      </div>
    </div>
  )
}
