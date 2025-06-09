import React from 'react'
import { NodeStatus, FilterOptions } from '../../types'
import { useT } from '../../i18n'
import { FilterSection, FilterLabel, CheckboxGroup, CheckboxItem, Checkbox } from './FilterPanel.styles'

interface StatusFilterSectionProps {
  filters: FilterOptions
  onStatusChange: (status: NodeStatus, checked: boolean) => void
}

/**
 * StatusFilterSection handles course status filtering
 */
export const StatusFilterSection: React.FC<StatusFilterSectionProps> = ({ filters, onStatusChange }) => {
  const t = useT()
  const statuses: NodeStatus[] = ['completed', 'in_progress', 'waiting_grade', 'available', 'locked']

  const getStatusLabel = (status: NodeStatus): string => {
    switch (status) {
      case 'completed':
        return t.filters.statusLabels.completed
      case 'in_progress':
        return t.filters.statusLabels.inProgress
      case 'waiting_grade':
        return t.filters.statusLabels.waitingGrade
      case 'available':
        return t.filters.statusLabels.available
      case 'locked':
        return t.filters.statusLabels.locked
      default:
        return status
    }
  }

  return (
    <FilterSection>
      <FilterLabel id="status-filter-label">{t.filters.status}</FilterLabel>
      <CheckboxGroup role="group" aria-labelledby="status-filter-label">
        {statuses.map((status) => (
          <CheckboxItem key={status}>
            <Checkbox
              checked={filters.status?.includes(status) || false}
              onChange={(e) => onStatusChange(status, e.target.checked)}
              aria-describedby={`status-${status}-label`}
            />
            <span id={`status-${status}-label`}>{getStatusLabel(status)}</span>
          </CheckboxItem>
        ))}
      </CheckboxGroup>
    </FilterSection>
  )
}
