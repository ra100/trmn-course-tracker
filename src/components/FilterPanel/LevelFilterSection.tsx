import React from 'react'
import { CourseLevel, FilterOptions } from '../../types'
import { useT } from '../../i18n'
import { FilterSection, FilterLabel, CheckboxGroup, CheckboxItem, Checkbox } from './FilterPanel.styles'

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
    <FilterSection>
      <FilterLabel id="level-filter-label">{t.filters.levels}</FilterLabel>
      <CheckboxGroup role="group" aria-labelledby="level-filter-label">
        {levels.map((level) => (
          <CheckboxItem key={level}>
            <Checkbox
              checked={filters.levels?.includes(level) || false}
              onChange={(e) => onLevelChange(level, e.target.checked)}
              aria-describedby={`level-${level}-label`}
            />
            <span id={`level-${level}-label`}>{getLevelLabel(level)}</span>
          </CheckboxItem>
        ))}
      </CheckboxGroup>
    </FilterSection>
  )
}
