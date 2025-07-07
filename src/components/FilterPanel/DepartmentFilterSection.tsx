import React, { useMemo } from 'react'
import { FilterOptions, ParsedCourseData } from '~/types'
import { getAllDepartments } from '~/utils/departmentUtils'
import { useT } from '~/i18n'
import { Switch } from '~/components/ui/switch'
import { filterSection, filterLabel } from './filterPanel.styles'
import { css } from 'styled-system/css'

interface DepartmentFilterSectionProps {
  filters: FilterOptions
  courseData: ParsedCourseData
  onDepartmentChange: (department: string, checked: boolean) => void
}

/**
 * DepartmentFilterSection handles department filtering
 */
export const DepartmentFilterSection: React.FC<DepartmentFilterSectionProps> = ({
  filters,
  courseData,
  onDepartmentChange
}) => {
  const t = useT()
  const departments = useMemo(() => getAllDepartments(courseData), [courseData])

  const getDepartmentLabel = (department: string): string => {
    return t.filters.departmentLabels[department as keyof typeof t.filters.departmentLabels] || department
  }

  return (
    <div className={filterSection}>
      <label id="department-filter-label" className={filterLabel}>
        {t.filters.departments}
      </label>
      <div
        role="group"
        aria-labelledby="department-filter-label"
        className={css({ display: 'flex', flexDirection: 'column', gap: '0.3rem' })}
      >
        {departments.map((department) => (
          <Switch
            key={department}
            checked={filters.departments?.includes(department) || false}
            onCheckedChange={(details: { checked: boolean }) =>
              onDepartmentChange(department, details.checked === true)
            }
          >
            {getDepartmentLabel(department)}
          </Switch>
        ))}
      </div>
    </div>
  )
}
