import React from 'react'
import { useT } from '../../i18n'
import { FilterCount, CountValue, CountLabel } from './FilterPanel.styles'

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
    <FilterCount>
      <CountValue>{count}</CountValue>
      <CountLabel>{count === 1 ? t.filters.activeFilter : t.filters.activeFilters}</CountLabel>
    </FilterCount>
  )
}
