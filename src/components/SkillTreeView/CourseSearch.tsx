import React from 'react'
import { CourseSearchProps } from './types'
import { useT } from '~/i18n'
import { Input } from '~/components/ui/input'
import { searchContainer } from './SkillTreeView.styles'

export const CourseSearch: React.FC<CourseSearchProps> = React.memo(({ searchTerm, onSearchChange }) => {
  const t = useT()

  return (
    <div className={searchContainer}>
      <Input
        type="text"
        placeholder={t.filters.search}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label={t.filters.search}
        role="searchbox"
      />
    </div>
  )
})

CourseSearch.displayName = 'CourseSearch'
