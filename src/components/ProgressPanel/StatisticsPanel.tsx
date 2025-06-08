import React from 'react'
import styled from 'styled-components'
import { UserProgress } from '../../types'
import { useT } from '../../i18n'
import { ProgressBar, ProgressFill } from './ProgressPanel.styles'

// Statistics-specific styled components
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
`

const StatCard = styled.div`
  background: ${(props) => props.theme.colors.surface};
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
  border: 1px solid ${(props) => props.theme.colors.border};
`

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: 0.3rem;
`

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.textSecondary};
  font-weight: 500;
`

const QuickStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: ${(props) => props.theme.colors.surface};
  border-radius: 6px;
  margin-bottom: 1.5rem;
  border: 1px solid ${(props) => props.theme.colors.border};
`

const QuickStatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.2rem 0;

  &:not(:last-child) {
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    padding-bottom: 0.4rem;
    margin-bottom: 0.2rem;
  }
`

const QuickStatLabel = styled.span`
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 0.9rem;
`

const QuickStatValue = styled.span`
  color: ${(props) => props.theme.colors.text};
  font-weight: 500;
`

interface OverallStats {
  totalCourses: number
  completedCourses: number
  inProgressCourses: number
  waitingGradeCourses: number
  availableCourses: number
  completionPercentage: number
}

interface StatisticsPanelProps {
  stats: OverallStats
  userProgress: UserProgress
}

/**
 * StatisticsPanel displays overview statistics including completion counts,
 * progress percentage, and quick stats in a grid layout
 */
export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ stats, userProgress }) => {
  const t = useT()

  return (
    <>
      <StatsGrid>
        <StatCard>
          <StatValue>{stats.completedCourses}</StatValue>
          <StatLabel>{t.progress.completed}</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.inProgressCourses}</StatValue>
          <StatLabel>{t.progress.workingOn}</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.waitingGradeCourses}</StatValue>
          <StatLabel>{t.progress.waitingGrade}</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.availableCourses}</StatValue>
          <StatLabel>{t.progress.available}</StatLabel>
        </StatCard>
      </StatsGrid>

      <QuickStats>
        <QuickStatRow>
          <QuickStatLabel>{t.progress.totalProgress}</QuickStatLabel>
          <QuickStatValue>{stats.completionPercentage.toFixed(1)}%</QuickStatValue>
        </QuickStatRow>
        <ProgressBar>
          <ProgressFill percentage={stats.completionPercentage} color="#27ae60" />
        </ProgressBar>
        <QuickStatRow>
          <QuickStatLabel>{t.progress.totalCourses}</QuickStatLabel>
          <QuickStatValue>{stats.totalCourses}</QuickStatValue>
        </QuickStatRow>
        <QuickStatRow>
          <QuickStatLabel>{t.progress.activeCourses}</QuickStatLabel>
          <QuickStatValue>{stats.inProgressCourses + stats.waitingGradeCourses}</QuickStatValue>
        </QuickStatRow>
        <QuickStatRow>
          <QuickStatLabel>{t.progress.lastUpdated}</QuickStatLabel>
          <QuickStatValue>{userProgress.lastUpdated.toLocaleDateString()}</QuickStatValue>
        </QuickStatRow>
      </QuickStats>
    </>
  )
}
