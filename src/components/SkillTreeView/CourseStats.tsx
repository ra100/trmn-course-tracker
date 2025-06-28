import React from 'react'
import { CourseStatsProps } from './types'
import { statsContainer, statItem, statValue, statLabel } from './SkillTreeView.styles'

export const CourseStats: React.FC<CourseStatsProps> = React.memo(({ stats }) => {
  return (
    <div className={statsContainer}>
      <div className={statItem}>
        <div className={statValue}>{stats.completed}</div>
        <div className={statLabel}>Completed</div>
      </div>
      <div className={statItem}>
        <div className={statValue}>{stats.available}</div>
        <div className={statLabel}>Available</div>
      </div>
      <div className={statItem}>
        <div className={statValue}>{stats.total}</div>
        <div className={statLabel}>Total Courses</div>
      </div>
    </div>
  )
})

CourseStats.displayName = 'CourseStats'
