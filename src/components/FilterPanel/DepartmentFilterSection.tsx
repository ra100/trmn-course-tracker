import React, { useMemo } from 'react'
import { FilterOptions, ParsedCourseData } from '../../types'
import { getAllDepartments } from '../../utils/departmentUtils'
import { useT } from '../../i18n'
import { FilterSection, FilterLabel, CheckboxGroup, CheckboxItem, Checkbox } from './FilterPanel.styles'

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
    <FilterSection>
      <FilterLabel id="department-filter-label">{t.filters.departments}</FilterLabel>
      <CheckboxGroup role="group" aria-labelledby="department-filter-label">
        {departments.map((department) => (
          <CheckboxItem key={department}>
            <Checkbox
              checked={filters.departments?.includes(department) || false}
              onChange={(e) => onDepartmentChange(department, e.target.checked)}
              aria-describedby={`department-${department}-label`}
            />
            <span id={`department-${department}-label`}>{getDepartmentLabel(department)}</span>
          </CheckboxItem>
        ))}
      </CheckboxGroup>
    </FilterSection>
  )
}
