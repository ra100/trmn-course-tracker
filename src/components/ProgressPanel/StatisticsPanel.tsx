import React from 'react'
import { css } from 'styled-system/css'
import { UserProgress } from '../../types'
import { useT } from '../../i18n'
import { progressBar, progressFill } from './ProgressPanel.styles'

// Statistics-specific styles
const statsGrid = css({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '0.5rem',
  marginBottom: '1rem',
  border: '1px solid',
  borderColor: 'border.default',
  borderRadius: '8px',
  background: 'none',
  padding: '0.5rem'
})

const completedCard = css({
  background: 'none',
  padding: '0.5rem',
  borderRadius: '4px',
  textAlign: 'center',
  border: '2px solid',
  borderColor: 'green.6',
  fontWeight: 'bold',
  color: 'green.9',
  fontSize: '1.1rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
})

const inProgressCard = css({
  background: 'none',
  padding: '0.5rem',
  borderRadius: '4px',
  textAlign: 'center',
  border: '2px solid',
  borderColor: 'cyan.6',
  fontWeight: 'bold',
  color: 'cyan.9',
  fontSize: '1.1rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
})

const waitingGradeCard = css({
  background: 'none',
  padding: '0.5rem',
  borderRadius: '4px',
  textAlign: 'center',
  border: '2px solid',
  borderColor: 'amber.6',
  fontWeight: 'bold',
  color: 'amber.9',
  fontSize: '1.1rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
})

const availableCard = css({
  background: 'none',
  padding: '0.5rem',
  borderRadius: '4px',
  textAlign: 'center',
  border: '2px solid',
  borderColor: 'accent.600',
  fontWeight: 'bold',
  color: 'accent.default',
  fontSize: '1.1rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
})

const completedValue = css({
  color: 'inherit',
  fontSize: '1.3rem',
  fontWeight: 'bold',
  marginBottom: '0.2rem'
})

const inProgressValue = completedValue
const waitingGradeValue = completedValue
const availableValue = completedValue

const statLabel = css({
  fontSize: '0.85rem',
  color: 'fg.muted',
  fontWeight: 'normal'
})

const quickStats = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
  padding: '0.5rem 0.75rem',
  background: 'none',
  borderRadius: '6px',
  marginBottom: '1rem',
  border: '1px solid',
  borderColor: 'border.default',
  boxShadow: 'none'
})

const quickStatRow = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.2rem 0',
  fontSize: '0.95rem',
  '&:not(:last-child)': {
    borderBottom: '1px solid',
    borderColor: 'border.default',
    paddingBottom: '0.2rem',
    marginBottom: '0.2rem'
  }
})

const quickStatLabel = css({
  color: 'fg.muted',
  fontSize: '0.95rem'
})

const quickStatValue = css({
  color: 'fg.default',
  fontWeight: 'bold',
  fontSize: '0.95rem'
})

const progressPercentage = css({
  color: 'green.9',
  fontWeight: 'bold',
  fontSize: '1rem'
})

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
      <div className={statsGrid}>
        <div className={completedCard}>
          <div className={completedValue}>{stats.completedCourses}</div>
          <div className={statLabel}>{t.progress.completed}</div>
        </div>
        <div className={inProgressCard}>
          <div className={inProgressValue}>{stats.inProgressCourses}</div>
          <div className={statLabel}>{t.progress.workingOn}</div>
        </div>
        <div className={waitingGradeCard}>
          <div className={waitingGradeValue}>{stats.waitingGradeCourses}</div>
          <div className={statLabel}>{t.progress.waitingGrade}</div>
        </div>
        <div className={availableCard}>
          <div className={availableValue}>{stats.availableCourses}</div>
          <div className={statLabel}>{t.progress.available}</div>
        </div>
      </div>

      <div className={quickStats}>
        <div className={quickStatRow}>
          <span className={quickStatLabel}>{t.progress.totalProgress}</span>
          <span className={progressPercentage}>{stats.completionPercentage.toFixed(1)}%</span>
        </div>
        <div className={progressBar}>
          <div className={progressFill({ color: 'success' })} style={{ width: `${stats.completionPercentage}%` }} />
        </div>
        <div className={quickStatRow}>
          <span className={quickStatLabel}>{t.progress.totalCourses}</span>
          <span className={quickStatValue}>{stats.totalCourses}</span>
        </div>
        <div className={quickStatRow}>
          <span className={quickStatLabel}>{t.progress.activeCourses}</span>
          <span className={quickStatValue}>{stats.inProgressCourses + stats.waitingGradeCourses}</span>
        </div>
        <div className={quickStatRow}>
          <span className={quickStatLabel}>{t.progress.lastUpdated}</span>
          <span className={quickStatValue}>{userProgress.lastUpdated.toLocaleDateString()}</span>
        </div>
      </div>
    </>
  )
}
