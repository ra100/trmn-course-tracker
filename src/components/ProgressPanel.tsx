import React from 'react'
import styled from 'styled-components'
import { ParsedCourseData, UserProgress } from '../types'
import { EligibilityEngine } from '../utils/eligibilityEngine'
import { useT } from '../i18n'

const PanelContainer = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};

  @media (max-width: 768px) {
    padding: 1rem;
  }
`

const PanelTitle = styled.h3`
  color: ${(props) => props.theme.colors.text};
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
`

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

const ProgressBar = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 10px;
  height: 8px;
  margin: 0.5rem 0;
  overflow: hidden;
  border: 1px solid ${(props) => props.theme.colors.border};
`

const ProgressFill = styled.div<{ percentage: number; color?: string }>`
  height: 100%;
  background: ${(props) => props.color || props.theme.colors.primary};
  width: ${(props) => props.percentage}%;
  transition: width 0.3s ease;
`

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-bottom: 0.2rem;
`

const SectionProgress = styled.div`
  margin-bottom: 1rem;
`

const SectionTitle = styled.div`
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.text};
  font-weight: 500;
  margin-bottom: 0.5rem;
`

const AchievementsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const AchievementItem = styled.div<{ completed: boolean }>`
  padding: 0.7rem;
  background: ${(props) => (props.completed ? props.theme.colors.success : props.theme.colors.surface)};
  border-radius: 4px;
  font-size: 0.85rem;
  color: ${(props) => (props.completed ? 'white' : props.theme.colors.textSecondary)};
  border-left: 3px solid ${(props) => (props.completed ? props.theme.colors.success : props.theme.colors.secondary)};
  border: 1px solid ${(props) => props.theme.colors.border};
`

const AchievementDescription = styled.div`
  font-size: 0.8rem;
  margin-top: 0.2rem;
`

const QuickStats = styled.div`
  background: ${(props) => props.theme.colors.surface};
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  border: 1px solid ${(props) => props.theme.colors.border};
`

const QuickStatRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;

  &:last-child {
    margin-bottom: 0;
  }
`

const QuickStatLabel = styled.span`
  color: ${(props) => props.theme.colors.textSecondary};
`

const QuickStatValue = styled.span`
  color: ${(props) => props.theme.colors.text};
  font-weight: 500;
`

interface ProgressPanelProps {
  userProgress: UserProgress
  courseData: ParsedCourseData
  eligibilityEngine: EligibilityEngine
}

export const ProgressPanel: React.FC<ProgressPanelProps> = ({ userProgress, courseData, eligibilityEngine }) => {
  const t = useT()
  const getOverallStats = () => {
    const totalCourses = courseData.courses.length
    const completedCourses = userProgress.completedCourses.size
    const inProgressCourses = userProgress.inProgressCourses.size
    const waitingGradeCourses = userProgress.waitingGradeCourses.size
    const availableCourses = eligibilityEngine.getAvailableCourses(userProgress).length
    const completionPercentage = totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0

    return {
      totalCourses,
      completedCourses,
      inProgressCourses,
      waitingGradeCourses,
      availableCourses,
      completionPercentage
    }
  }

  const getSectionProgress = () => {
    const sectionStats = new Map<string, { total: number; completed: number }>()

    courseData.courses.forEach((course) => {
      const section = course.section
      if (!sectionStats.has(section)) {
        sectionStats.set(section, { total: 0, completed: 0 })
      }

      const stats = sectionStats.get(section)!
      stats.total++

      if (userProgress.completedCourses.has(course.code)) {
        stats.completed++
      }
    })

    return Array.from(sectionStats.entries()).map(([section, stats]) => ({
      section,
      completed: stats.completed,
      total: stats.total,
      percentage: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
    }))
  }

  const getLevelProgress = () => {
    const levelStats = new Map<string, { total: number; completed: number }>()

    courseData.courses.forEach((course) => {
      if (!course.level) return

      const level = course.level
      if (!levelStats.has(level)) {
        levelStats.set(level, { total: 0, completed: 0 })
      }

      const stats = levelStats.get(level)!
      stats.total++

      if (userProgress.completedCourses.has(course.code)) {
        stats.completed++
      }
    })

    return Array.from(levelStats.entries()).map(([level, stats]) => ({
      level,
      completed: stats.completed,
      total: stats.total,
      percentage: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
    }))
  }

  const getAchievements = () => {
    const achievements: Array<{ title: string; description: string; completed: boolean }> = []
    const completed = userProgress.completedCourses.size
    const totalCourses = courseData.courses.length

    // Basic milestones
    achievements.push({
      title: t.achievements.firstCourse.title,
      description: t.achievements.firstCourse.description,
      completed: completed >= 1
    })

    achievements.push({
      title: t.achievements.gettingStarted.title,
      description: t.achievements.gettingStarted.description,
      completed: completed >= 5
    })

    achievements.push({
      title: t.achievements.makingProgress.title,
      description: t.achievements.makingProgress.description,
      completed: completed >= 10
    })

    achievements.push({
      title: t.achievements.dedicatedStudent.title,
      description: t.achievements.dedicatedStudent.description,
      completed: completed >= 25
    })

    achievements.push({
      title: t.achievements.expertLevel.title,
      description: t.achievements.expertLevel.description,
      completed: completed >= 50
    })

    // Completion percentage milestones
    const percentage = totalCourses > 0 ? (completed / totalCourses) * 100 : 0

    achievements.push({
      title: t.achievements.quarterComplete.title,
      description: t.achievements.quarterComplete.description,
      completed: percentage >= 25
    })

    achievements.push({
      title: t.achievements.halfwayThere.title,
      description: t.achievements.halfwayThere.description,
      completed: percentage >= 50
    })

    achievements.push({
      title: t.achievements.almostDone.title,
      description: t.achievements.almostDone.description,
      completed: percentage >= 75
    })

    achievements.push({
      title: t.achievements.courseMaster.title,
      description: t.achievements.courseMaster.description,
      completed: percentage >= 100
    })

    return achievements
  }

  const overallStats = getOverallStats()
  const sectionProgress = getSectionProgress()
  const levelProgress = getLevelProgress()
  const achievements = getAchievements()

  return (
    <PanelContainer>
      <PanelTitle>{t.progress.title}</PanelTitle>

      <StatsGrid>
        <StatCard>
          <StatValue>{overallStats.completedCourses}</StatValue>
          <StatLabel>{t.progress.completed}</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{overallStats.inProgressCourses}</StatValue>
          <StatLabel>{t.progress.workingOn}</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{overallStats.waitingGradeCourses}</StatValue>
          <StatLabel>{t.progress.waitingGrade}</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{overallStats.availableCourses}</StatValue>
          <StatLabel>{t.progress.available}</StatLabel>
        </StatCard>
      </StatsGrid>

      <QuickStats>
        <QuickStatRow>
          <QuickStatLabel>{t.progress.totalProgress}</QuickStatLabel>
          <QuickStatValue>{overallStats.completionPercentage.toFixed(1)}%</QuickStatValue>
        </QuickStatRow>
        <ProgressBar>
          <ProgressFill percentage={overallStats.completionPercentage} color="#27ae60" />
        </ProgressBar>
        <QuickStatRow>
          <QuickStatLabel>{t.progress.totalCourses}</QuickStatLabel>
          <QuickStatValue>{overallStats.totalCourses}</QuickStatValue>
        </QuickStatRow>
        <QuickStatRow>
          <QuickStatLabel>{t.progress.activeCourses}</QuickStatLabel>
          <QuickStatValue>{overallStats.inProgressCourses + overallStats.waitingGradeCourses}</QuickStatValue>
        </QuickStatRow>
        <QuickStatRow>
          <QuickStatLabel>{t.progress.lastUpdated}</QuickStatLabel>
          <QuickStatValue>{userProgress.lastUpdated.toLocaleDateString()}</QuickStatValue>
        </QuickStatRow>
      </QuickStats>

      <PanelTitle>{t.progress.sectionProgress}</PanelTitle>
      {sectionProgress.slice(0, 5).map((section) => (
        <SectionProgress key={section.section}>
          <ProgressLabel>
            <SectionTitle>{section.section}</SectionTitle>
            <span>
              {section.completed}/{section.total}
            </span>
          </ProgressLabel>
          <ProgressBar>
            <ProgressFill percentage={section.percentage} />
          </ProgressBar>
        </SectionProgress>
      ))}

      <PanelTitle>{t.progress.levelProgress}</PanelTitle>
      {levelProgress.map((level) => (
        <SectionProgress key={level.level}>
          <ProgressLabel>
            <SectionTitle>
              {t.progress.level} {level.level}
            </SectionTitle>
            <span>
              {level.completed}/{level.total}
            </span>
          </ProgressLabel>
          <ProgressBar>
            <ProgressFill
              percentage={level.percentage}
              color={level.level === 'A' ? '#e74c3c' : level.level === 'C' ? '#f39c12' : '#9b59b6'}
            />
          </ProgressBar>
        </SectionProgress>
      ))}

      <PanelTitle>{t.progress.achievements}</PanelTitle>
      <AchievementsList>
        {achievements.slice(0, 6).map((achievement, index) => (
          <AchievementItem key={index} completed={achievement.completed}>
            <strong>{achievement.title}</strong>
            <AchievementDescription>{achievement.description}</AchievementDescription>
          </AchievementItem>
        ))}
      </AchievementsList>
    </PanelContainer>
  )
}
