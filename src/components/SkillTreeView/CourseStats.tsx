import React from 'react'
import { CourseStatsProps } from './types'
import { StatsContainer, StatItem, StatValue, StatLabel } from './SkillTreeView.styles'

export const CourseStats: React.FC<CourseStatsProps> = React.memo(({ stats }) => {
  return (
    <StatsContainer>
      <StatItem>
        <StatValue>{stats.completed}</StatValue>
        <StatLabel>Completed</StatLabel>
      </StatItem>
      <StatItem>
        <StatValue>{stats.available}</StatValue>
        <StatLabel>Available</StatLabel>
      </StatItem>
      <StatItem>
        <StatValue>{stats.total}</StatValue>
        <StatLabel>Total Courses</StatLabel>
      </StatItem>
    </StatsContainer>
  )
})

CourseStats.displayName = 'CourseStats'
