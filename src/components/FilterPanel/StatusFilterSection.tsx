import React from 'react'
import { NodeStatus, FilterOptions } from '~/types'
import { useT } from '~/i18n'
import { Checkbox } from '~/components/ui/checkbox'
import { filterSection, filterLabel } from './filterPanel.styles'
import { css } from 'styled-system/css'

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
    <div className={filterSection}>
      <label id="status-filter-label" className={filterLabel}>
        {t.filters.status}
      </label>
      <div
        role="group"
        aria-labelledby="status-filter-label"
        className={css({ display: 'flex', flexDirection: 'column', gap: '0.3rem' })}
      >
        {statuses.map((status) => (
          <Checkbox
            key={status}
            checked={filters.status?.includes(status) || false}
            onCheckedChange={(details: { checked: boolean }) => onStatusChange(status, details.checked === true)}
          >
            {getStatusLabel(status)}
          </Checkbox>
        ))}
      </div>
    </div>
  )
}
