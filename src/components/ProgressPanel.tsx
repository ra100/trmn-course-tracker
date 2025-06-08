import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { ParsedCourseData, UserProgress } from '../types'
import { EligibilityEngine } from '../utils/eligibilityEngine'
import { findCoursesByDepartmentAndLevel } from '../utils/departmentUtils'
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

const AchievementItem = styled.div<{ $completed: boolean }>`
  padding: 0.7rem;
  background: ${(props) => (props.$completed ? props.theme.colors.success : props.theme.colors.surface)};
  border-radius: 4px;
  font-size: 0.85rem;
  color: ${(props) => (props.$completed ? 'white' : props.theme.colors.textSecondary)};
  border-left: 3px solid ${(props) => (props.$completed ? props.theme.colors.success : props.theme.colors.secondary)};
  border: 1px solid ${(props) => props.theme.colors.border};
`

const AchievementDescription = styled.div`
  font-size: 0.8rem;
  margin-top: 0.2rem;
`

const SpaceWarfareAchievement = styled.div<{ $earned: boolean }>`
  padding: 0.7rem;
  background: ${(props) => (props.$earned ? props.theme.colors.success : props.theme.colors.surface)};
  border-radius: 4px;
  font-size: 0.85rem;
  color: ${(props) => (props.$earned ? 'white' : props.theme.colors.textSecondary)};
  border-left: 3px solid ${(props) => (props.$earned ? props.theme.colors.success : props.theme.colors.secondary)};
  border: 1px solid ${(props) => props.theme.colors.border};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.$earned ? props.theme.colors.success : `${props.theme.colors.border}40`)};
  }
`

const SpaceWarfareHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  gap: 0.5rem;
`

const PinIcon = styled.div`
  width: 20px;
  height: 20px;
  background: gold;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: #000;
  font-weight: bold;
  flex-shrink: 0;
`

const ExpandIcon = styled.div<{ $expanded: boolean }>`
  margin-left: auto;
  font-size: 0.8rem;
  transform: rotate(${(props) => (props.$expanded ? '180deg' : '0deg')});
  transition: transform 0.3s ease;
`

const SpaceWarfareDetails = styled.div<{ $expanded: boolean }>`
  max-height: ${(props) => (props.$expanded ? '500px' : '0')};
  opacity: ${(props) => (props.$expanded ? '1' : '0')};
  overflow: hidden;
  transition: all 0.3s ease;
  margin-top: ${(props) => (props.$expanded ? '0.5rem' : '0')};
`

const PinSection = styled.div`
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  background: ${(props) => props.theme.colors.background};

  &:last-child {
    margin-bottom: 0;
  }
`

const PinTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const PinBadge = styled.div<{ $earned: boolean }>`
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: bold;
  background: ${(props) => (props.$earned ? props.theme.colors.success : props.theme.colors.secondary)};
  color: white;
  margin-left: auto;
`

const RequirementsList = styled.div`
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.textSecondary};
`

const RequirementItem = styled.div<{ $completed: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.3rem;
  margin-bottom: 0.2rem;
  padding: 0.2rem;
  border-radius: 2px;
  background: ${(props) => (props.$completed ? `${props.theme.colors.success}10` : 'transparent')};

  &:last-child {
    margin-bottom: 0;
  }
`

const StatusIcon = styled.div<{ $completed: boolean }>`
  width: 16px;
  height: 16px;
  min-width: 16px;
  border-radius: 50%;
  background: ${(props) => (props.$completed ? props.theme.colors.success : props.theme.colors.secondary)};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: bold;
`

const RequirementText = styled.span<{ $completed: boolean }>`
  color: ${(props) => (props.$completed ? props.theme.colors.success : props.theme.colors.textSecondary)};
  font-weight: ${(props) => (props.$completed ? '500' : 'normal')};
  line-height: 1.2;
`

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 4px;
  background: ${(props) => props.theme.colors.border};
  border-radius: 2px;
  overflow: hidden;
  margin-top: 0.3rem;
`

const ProgressBarFill = styled.div<{ progress: number }>`
  width: ${(props) => props.progress}%;
  height: 100%;
  background: linear-gradient(
    90deg,
    ${(props) => props.theme.colors.primary},
    ${(props) => props.theme.colors.success}
  );
  border-radius: 2px;
  transition: width 0.5s ease;
`

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-top: 0.2rem;
`

const FlexContainer = styled.div`
  flex: 1;
`

const DepartmentInfo = styled.div`
  font-size: 0.7rem;
  opacity: 0.8;
  margin-top: 0.1rem;
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

interface PinRequirement {
  id: string
  name: string
  courseCode?: string
  type: 'course' | 'department_choice'
  completed: boolean
  level?: string
  departments?: string[]
  minimum?: number
  satisfied?: number
  description?: string
}

interface PinProgress {
  name: string
  type: 'OSWP' | 'ESWP'
  earned: boolean
  requirements: PinRequirement[]
  overallProgress: number
}

const ProgressPanelComponent: React.FC<ProgressPanelProps> = ({ userProgress, courseData, eligibilityEngine }) => {
  const t = useT()
  const [spaceWarfareExpanded, setSpaceWarfareExpanded] = useState(false)

  // Space Warfare Pin calculation logic now uses dynamic department mappings

  const calculateDepartmentProgress = useCallback(
    (
      courseData: ParsedCourseData,
      userProgress: UserProgress,
      requirement: PinRequirement
    ): { satisfied: number; completed: boolean } => {
      if (!requirement.departments || !requirement.level) {
        return { satisfied: 0, completed: false }
      }

      const departmentCourses = findCoursesByDepartmentAndLevel(courseData, requirement.departments, requirement.level)
      const departmentGroups: { [dept: string]: string[] } = {}

      requirement.departments.forEach((dept: string) => {
        departmentGroups[dept] = departmentCourses
          .filter(
            (course) =>
              course.section.toLowerCase().includes(dept.toLowerCase()) ||
              course.subsection.toLowerCase().includes(dept.toLowerCase())
          )
          .map((course) => course.code)
      })

      let satisfiedDepartments = 0
      Object.entries(departmentGroups).forEach(([, courses]) => {
        const hasAnyCourse = courses.some((course) => userProgress.completedCourses.has(course))
        if (hasAnyCourse) {
          satisfiedDepartments++
        }
      })

      return {
        satisfied: satisfiedDepartments,
        completed: satisfiedDepartments >= (requirement.minimum || 0)
      }
    },
    []
  )

  const calculatePinProgress = useCallback(
    (
      courseData: ParsedCourseData,
      userProgress: UserProgress,
      pinType: 'OSWP' | 'ESWP',
      pinNames: { OSWP: string; ESWP: string }
    ): PinProgress => {
      const pinRule = courseData.specialRules.find((rule) => rule.type === pinType && rule.branch === 'RMN')

      if (!pinRule) {
        return {
          name: pinNames[pinType],
          type: pinType,
          earned: false,
          requirements: [
            {
              id: 'fallback-info',
              name: `No ${pinType} requirements found in course data.`,
              type: 'course' as const,
              completed: false
            }
          ],
          overallProgress: 0
        }
      }

      const requirements: PinRequirement[] = []

      pinRule.requirements.forEach((req, index) => {
        if (req.type === 'course' && req.code) {
          const courseName = courseData.courseMap.get(req.code)?.name || `Course ${req.code}`
          requirements.push({
            id: `course-${index}`,
            name: courseName,
            courseCode: req.code,
            type: 'course',
            completed: userProgress.completedCourses.has(req.code)
          })
        } else if (req.type === 'department_choice') {
          const baseRequirement: PinRequirement = {
            id: `dept-choice-${index}`,
            name: req.description || `Department Choice (${req.minimum} of ${req.totalOptions} departments)`,
            type: 'department_choice',
            departments: req.departments,
            minimum: req.minimum,
            level: req.level,
            completed: false,
            satisfied: 0,
            description: req.description
          }

          const progress = calculateDepartmentProgress(courseData, userProgress, baseRequirement)
          baseRequirement.satisfied = progress.satisfied
          baseRequirement.completed = progress.completed

          requirements.push(baseRequirement)
        }
      })

      const completedRequirements = requirements.filter((r) => r.completed).length
      const overallProgress = requirements.length > 0 ? (completedRequirements / requirements.length) * 100 : 0

      return {
        name: pinNames[pinType],
        type: pinType,
        earned: requirements.length > 0 && requirements.every((r) => r.completed),
        requirements,
        overallProgress
      }
    },
    [calculateDepartmentProgress]
  )

  const getSpaceWarfarePins = useCallback(() => {
    const pinNames = {
      OSWP: t.spaceWarfare.oswp,
      ESWP: t.spaceWarfare.eswp
    }

    const oswpProgress = calculatePinProgress(courseData, userProgress, 'OSWP', pinNames)
    const eswpProgress = calculatePinProgress(courseData, userProgress, 'ESWP', pinNames)

    return { oswpProgress, eswpProgress }
  }, [courseData, userProgress, calculatePinProgress, t.spaceWarfare.oswp, t.spaceWarfare.eswp])

  const getOverallStats = useCallback(() => {
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
  }, [courseData.courses.length, userProgress, eligibilityEngine])

  const getSectionProgress = useCallback(() => {
    const sectionStats = new Map<string, { total: number; completed: number }>()

    courseData.courses.forEach((course) => {
      const section = course.section
      if (!sectionStats.has(section)) {
        sectionStats.set(section, { total: 0, completed: 0 })
      }

      const stats = sectionStats.get(section)
      if (stats) {
        stats.total++

        if (userProgress.completedCourses.has(course.code)) {
          stats.completed++
        }
      }
    })

    return Array.from(sectionStats.entries()).map(([section, stats]) => ({
      section,
      completed: stats.completed,
      total: stats.total,
      percentage: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
    }))
  }, [courseData.courses, userProgress.completedCourses])

  const getLevelProgress = useCallback(() => {
    const levelStats = new Map<string, { total: number; completed: number }>()

    courseData.courses.forEach((course) => {
      if (!course.level) {
        return
      }

      const level = course.level
      if (!levelStats.has(level)) {
        levelStats.set(level, { total: 0, completed: 0 })
      }

      const stats = levelStats.get(level)
      if (stats) {
        stats.total++

        if (userProgress.completedCourses.has(course.code)) {
          stats.completed++
        }
      }
    })

    return Array.from(levelStats.entries()).map(([level, stats]) => ({
      level,
      completed: stats.completed,
      total: stats.total,
      percentage: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
    }))
  }, [courseData.courses, userProgress.completedCourses])

  const getAchievements = useCallback(() => {
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
  }, [userProgress.completedCourses.size, courseData.courses.length, t.achievements])

  const overallStats = useMemo(() => getOverallStats(), [getOverallStats])
  const sectionProgress = useMemo(() => getSectionProgress(), [getSectionProgress])
  const levelProgress = useMemo(() => getLevelProgress(), [getLevelProgress])
  const achievements = useMemo(() => getAchievements(), [getAchievements])
  const { oswpProgress, eswpProgress } = useMemo(() => getSpaceWarfarePins(), [getSpaceWarfarePins])

  const toggleSpaceWarfareExpanded = useCallback(() => {
    setSpaceWarfareExpanded((prev) => !prev)
  }, [])

  const renderSpaceWarfareRequirement = useCallback((req: PinRequirement) => {
    if (req.type === 'course') {
      return (
        <RequirementItem key={req.id} $completed={req.completed}>
          <StatusIcon $completed={req.completed}>{req.completed ? '✓' : '○'}</StatusIcon>
          <RequirementText $completed={req.completed}>
            {req.name} ({req.courseCode})
          </RequirementText>
        </RequirementItem>
      )
    } else if (req.type === 'department_choice') {
      const displayText = req.name.startsWith('Department Choice')
        ? req.name
        : `Department Choice - ${req.description || req.name}`

      return (
        <RequirementItem key={req.id} $completed={req.completed}>
          <StatusIcon $completed={req.completed}>{req.completed ? '✓' : `${req.satisfied}/${req.minimum}`}</StatusIcon>
          <FlexContainer>
            <RequirementText $completed={req.completed}>
              {displayText} - Progress: {req.satisfied}/{req.minimum} departments
            </RequirementText>
            {req.departments && req.departments.length > 0 && (
              <DepartmentInfo>Available: {req.departments.join(', ')}</DepartmentInfo>
            )}
          </FlexContainer>
        </RequirementItem>
      )
    }
    return null
  }, [])

  const renderPinSection = useCallback(
    (progress: PinProgress) => (
      <PinSection key={progress.type}>
        <PinTitle>
          <PinIcon>★</PinIcon>
          {progress.name}
          <PinBadge $earned={progress.earned}>
            {progress.earned ? t.spaceWarfare.eligible : t.spaceWarfare.progress}
          </PinBadge>
        </PinTitle>
        <RequirementsList>{progress.requirements.map(renderSpaceWarfareRequirement)}</RequirementsList>
        <ProgressBarContainer>
          <ProgressBarFill progress={progress.overallProgress} />
        </ProgressBarContainer>
        <ProgressText>
          <span>{t.spaceWarfare.progress}</span>
          <span>{Math.round(progress.overallProgress)}%</span>
        </ProgressText>
      </PinSection>
    ),
    [t, renderSpaceWarfareRequirement]
  )

  // Calculate combined Space Warfare eligibility for the main achievement
  const combinedSpaceWarfareEarned = oswpProgress.earned || eswpProgress.earned

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
        {/* Space Warfare Pin Achievement */}
        <SpaceWarfareAchievement $earned={combinedSpaceWarfareEarned} onClick={toggleSpaceWarfareExpanded}>
          <SpaceWarfareHeader>
            <PinIcon>★</PinIcon>
            <FlexContainer>
              <strong>{t.achievements.spaceWarfarePins.title}</strong>
              <AchievementDescription>{t.achievements.spaceWarfarePins.description}</AchievementDescription>
            </FlexContainer>
            <ExpandIcon $expanded={spaceWarfareExpanded}>▼</ExpandIcon>
          </SpaceWarfareHeader>
          <SpaceWarfareDetails $expanded={spaceWarfareExpanded}>
            {renderPinSection(oswpProgress)}
            {renderPinSection(eswpProgress)}
          </SpaceWarfareDetails>
        </SpaceWarfareAchievement>

        {/* Regular Achievements */}
        {achievements.slice(0, 5).map((achievement) => (
          <AchievementItem key={achievement.title} $completed={achievement.completed}>
            <strong>{achievement.title}</strong>
            <AchievementDescription>{achievement.description}</AchievementDescription>
          </AchievementItem>
        ))}
      </AchievementsList>
    </PanelContainer>
  )
}

export const ProgressPanel = React.memo(ProgressPanelComponent)
