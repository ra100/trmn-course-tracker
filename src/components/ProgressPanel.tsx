import React from 'react'
import styled from 'styled-components'
import { ParsedCourseData, UserProgress } from '../types'
import { EligibilityEngine } from '../utils/eligibilityEngine'

const PanelContainer = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #34495e;
`

const PanelTitle = styled.h3`
  color: #ecf0f1;
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
  background: #34495e;
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
`

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 0.3rem;
`

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: #bdc3c7;
  font-weight: 500;
`

const ProgressBar = styled.div`
  background: #34495e;
  border-radius: 10px;
  height: 8px;
  margin: 0.5rem 0;
  overflow: hidden;
`

const ProgressFill = styled.div<{ percentage: number; color?: string }>`
  height: 100%;
  background: ${(props) => props.color || '#3498db'};
  width: ${(props) => props.percentage}%;
  transition: width 0.3s ease;
`

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #bdc3c7;
  margin-bottom: 0.2rem;
`

const SectionProgress = styled.div`
  margin-bottom: 1rem;
`

const SectionTitle = styled.div`
  font-size: 0.9rem;
  color: #ecf0f1;
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
  background: ${(props) => (props.completed ? '#27ae60' : '#34495e')};
  border-radius: 4px;
  font-size: 0.85rem;
  color: ${(props) => (props.completed ? 'white' : '#bdc3c7')};
  border-left: 3px solid ${(props) => (props.completed ? '#2ecc71' : '#7f8c8d')};
`

const QuickStats = styled.div`
  background: #34495e;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
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
  color: #bdc3c7;
`

const QuickStatValue = styled.span`
  color: #ecf0f1;
  font-weight: 500;
`

interface ProgressPanelProps {
  userProgress: UserProgress
  courseData: ParsedCourseData
  eligibilityEngine: EligibilityEngine
}

export const ProgressPanel: React.FC<ProgressPanelProps> = ({ userProgress, courseData, eligibilityEngine }) => {
  const getOverallStats = () => {
    const totalCourses = courseData.courses.length
    const completedCourses = userProgress.completedCourses.size
    const availableCourses = eligibilityEngine.getAvailableCourses(userProgress).length
    const completionPercentage = totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0

    return {
      totalCourses,
      completedCourses,
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
      title: 'First Course',
      description: 'Complete your first course',
      completed: completed >= 1
    })

    achievements.push({
      title: 'Getting Started',
      description: 'Complete 5 courses',
      completed: completed >= 5
    })

    achievements.push({
      title: 'Making Progress',
      description: 'Complete 10 courses',
      completed: completed >= 10
    })

    achievements.push({
      title: 'Dedicated Student',
      description: 'Complete 25 courses',
      completed: completed >= 25
    })

    achievements.push({
      title: 'Expert Level',
      description: 'Complete 50 courses',
      completed: completed >= 50
    })

    // Completion percentage milestones
    const percentage = totalCourses > 0 ? (completed / totalCourses) * 100 : 0

    achievements.push({
      title: 'Quarter Complete',
      description: 'Complete 25% of all courses',
      completed: percentage >= 25
    })

    achievements.push({
      title: 'Halfway There',
      description: 'Complete 50% of all courses',
      completed: percentage >= 50
    })

    achievements.push({
      title: 'Almost Done',
      description: 'Complete 75% of all courses',
      completed: percentage >= 75
    })

    achievements.push({
      title: 'Course Master',
      description: 'Complete all available courses',
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
      <PanelTitle>Progress Overview</PanelTitle>

      <StatsGrid>
        <StatCard>
          <StatValue>{overallStats.completedCourses}</StatValue>
          <StatLabel>Completed</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{overallStats.availableCourses}</StatValue>
          <StatLabel>Available</StatLabel>
        </StatCard>
      </StatsGrid>

      <QuickStats>
        <QuickStatRow>
          <QuickStatLabel>Total Progress:</QuickStatLabel>
          <QuickStatValue>{overallStats.completionPercentage.toFixed(1)}%</QuickStatValue>
        </QuickStatRow>
        <ProgressBar>
          <ProgressFill percentage={overallStats.completionPercentage} color="#27ae60" />
        </ProgressBar>
        <QuickStatRow>
          <QuickStatLabel>Total Courses:</QuickStatLabel>
          <QuickStatValue>{overallStats.totalCourses}</QuickStatValue>
        </QuickStatRow>
        <QuickStatRow>
          <QuickStatLabel>Last Updated:</QuickStatLabel>
          <QuickStatValue>{userProgress.lastUpdated.toLocaleDateString()}</QuickStatValue>
        </QuickStatRow>
      </QuickStats>

      <PanelTitle>Section Progress</PanelTitle>
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

      <PanelTitle>Level Progress</PanelTitle>
      {levelProgress.map((level) => (
        <SectionProgress key={level.level}>
          <ProgressLabel>
            <SectionTitle>Level {level.level}</SectionTitle>
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

      <PanelTitle>Achievements</PanelTitle>
      <AchievementsList>
        {achievements.slice(0, 6).map((achievement, index) => (
          <AchievementItem key={index} completed={achievement.completed}>
            <strong>{achievement.title}</strong>
            <div style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>{achievement.description}</div>
          </AchievementItem>
        ))}
      </AchievementsList>
    </PanelContainer>
  )
}
