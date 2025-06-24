import React from 'react'
import { ImportStats } from './MedusaImport.styles'
import { ImportStatsDisplayProps } from './types'

const formatCourseList = (courses: string[]): string => {
  if (courses.length === 0) {
    return ''
  }
  if (courses.length <= 5) {
    return courses.join(', ')
  }
  return `${courses.slice(0, 5).join(', ')}...`
}

export const ImportStatsDisplay: React.FC<ImportStatsDisplayProps> = React.memo(({ stats }) => (
  <ImportStats>
    • {stats.trackable} courses are trackable in TRMN system
    <br />• {stats.newCourses.length} new courses added
    {stats.newCourses.length > 0 && `: ${formatCourseList(stats.newCourses)}`}
    <br />• {stats.alreadyCompleted} courses were already completed
    <br />• {stats.untrackedCourses.length} courses from Medusa are not tracked by this app
    {stats.untrackedCourses.length > 0 && `: ${formatCourseList(stats.untrackedCourses)}`}
  </ImportStats>
))

ImportStatsDisplay.displayName = 'ImportStatsDisplay'
