import { useMemo, useCallback } from 'react'
import { ParsedCourseData, UserProgress, CalculatedAchievement } from '../types'
import { EligibilityEngine } from '../utils/eligibilityEngine'
import { findCoursesByDepartmentAndLevel } from '../utils/departmentUtils'
import { calculateAchievements } from '../utils/achievementLoader'
import {
  OverallStats,
  SectionProgressData,
  LevelProgressData,
  PinRequirement,
  PinProgress
} from '../components/ProgressPanel/types'
import { TranslationStrings } from '../i18n/types'

interface UseProgressPanelDataArgs {
  userProgress: UserProgress
  courseData: ParsedCourseData
  eligibilityEngine: EligibilityEngine
  t: TranslationStrings
}

export const useProgressPanelData = ({ userProgress, courseData, eligibilityEngine, t }: UseProgressPanelDataArgs) => {
  const calculateDepartmentProgress = useCallback(
    (
      courseData: ParsedCourseData,
      userProgress: UserProgress,
      requirement: PinRequirement
    ): { satisfied: number; completed: boolean } => {
      if (!requirement.departments || !requirement.level) {
        return { satisfied: 0, completed: false }
      }
      let satisfiedDepartments = 0
      requirement.departments.forEach((dept: string) => {
        const coursesInDept = findCoursesByDepartmentAndLevel(courseData, [dept], requirement.level)
        const courseCodes = coursesInDept.map((course) => course.code)
        const hasAnyCourse = courseCodes.some((courseCode) => userProgress.completedCourses.has(courseCode))
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
  }, [courseData, userProgress, calculatePinProgress, t])

  const getOverallStats = useCallback((): OverallStats => {
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

  const getSectionProgress = useCallback((): SectionProgressData[] => {
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

  const getLevelProgress = useCallback((): LevelProgressData[] => {
    const levelStats = new Map<string, { total: number; completed: number }>()
    courseData.courses.forEach((course) => {
      const level = course.level
      if (!level) {
        return
      }
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

  const getAchievements = useCallback((): CalculatedAchievement[] => {
    try {
      return calculateAchievements(courseData, userProgress, t)
    } catch {
      const fallbackAchievements: CalculatedAchievement[] = []
      const completedCount = userProgress.completedCourses.size
      fallbackAchievements.push({
        id: 'firstCourse',
        title: t.achievements.firstCourse.title,
        description: t.achievements.firstCourse.description,
        completed: completedCount >= 1,
        category: 'progression',
        progress: { current: completedCount >= 1 ? 1 : 0, target: 1 }
      })
      fallbackAchievements.push({
        id: 'gettingStarted',
        title: t.achievements.gettingStarted.title,
        description: t.achievements.gettingStarted.description,
        completed: completedCount >= 3,
        category: 'progression',
        progress: { current: Math.min(completedCount, 3), target: 3 }
      })
      return fallbackAchievements
    }
  }, [courseData, userProgress, t])

  // Memoized calculations
  const overallStats = useMemo(() => getOverallStats(), [getOverallStats])
  const sectionProgress = useMemo(() => getSectionProgress(), [getSectionProgress])
  const levelProgress = useMemo(() => getLevelProgress(), [getLevelProgress])
  const achievements = useMemo(() => getAchievements(), [getAchievements])
  const { oswpProgress, eswpProgress } = useMemo(() => getSpaceWarfarePins(), [getSpaceWarfarePins])

  return {
    overallStats,
    sectionProgress,
    levelProgress,
    achievements,
    oswpProgress,
    eswpProgress
  }
}
