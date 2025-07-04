import React from 'react'
import { useT } from '~/i18n'
import { filterCount, countValue, countLabel } from './filterPanel.styles'

interface FilterCountDisplayProps {
  count: number
}

/**
 * FilterCountDisplay shows the number of active filters
 */
export const FilterCountDisplay: React.FC<FilterCountDisplayProps> = ({ count }) => {
  const t = useT()

  if (count === 0) {
    return null
  }

  return (
    <div className={filterCount}>
      <div className={countValue}>{count}</div>
      <div className={countLabel}>{count === 1 ? t.filters.activeFilter : t.filters.activeFilters}</div>
    </div>
  )
}
