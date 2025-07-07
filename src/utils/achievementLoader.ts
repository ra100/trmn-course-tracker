import { AchievementConfiguration, CalculatedAchievement, ParsedCourseData, UserProgress } from '../types'
import { TranslationStrings } from '../i18n/types'
import { getCourseMainDepartment } from './departmentUtils'
import achievementConfig from '../config/achievements.json'
import { logger } from './logger'

export function loadAchievementConfiguration(): AchievementConfiguration {
  return achievementConfig as AchievementConfiguration
}

export function calculateAchievements(
  courseData: ParsedCourseData,
  userProgress: UserProgress,
  translations: TranslationStrings
): CalculatedAchievement[] {
  try {
    const config = loadAchievementConfiguration()
    const achievements: CalculatedAchievement[] = []

    logger.log('🏆 Achievement System Debug:', {
      hasConfig: !!config,
      configKeys: config ? Object.keys(config) : [],
      progressionCount: config?.progressionMilestones?.length || 0,
      departmentCount: config?.departmentBreadth?.length || 0,
      specialtyCount: config?.specialtyDepth?.length || 0,
      institutionCount: config?.institutionDiversity?.length || 0,
      userCompletedCount: userProgress?.completedCourses?.size || 0
    })

    // Safe fallback for missing data
    if (!config || !courseData || !userProgress || !translations) {
      logger.warn('🏆 Using fallback achievements - missing data')
      return getFallbackAchievements(userProgress, translations)
    }

    // Progression Milestones (course count based)
    if (config.progressionMilestones) {
      config.progressionMilestones.forEach((milestone) => {
        try {
          const completedCount = userProgress.completedCourses?.size || 0
          // Safe translation access using bracket notation
          const achievementTranslation =
            translations.achievements[milestone.id as keyof typeof translations.achievements]

          achievements.push({
            id: milestone.id,
            title: achievementTranslation?.title || milestone.id,
            description: achievementTranslation?.description || milestone.description || '',
            completed: completedCount >= (milestone.threshold || 0),
            category: 'progression',
            progress: {
              current: completedCount,
              target: milestone.threshold || 0
            }
          })
        } catch (err) {
          logger.warn('Error calculating progression milestone:', milestone.id, err)
        }
      })
    }

    // Department Breadth
    if (config.departmentBreadth) {
      config.departmentBreadth.forEach((breadth) => {
        try {
          const departmentCount = calculateUniqueDepartments(courseData, userProgress)
          const achievementTranslation = translations.achievements[breadth.id as keyof typeof translations.achievements]

          achievements.push({
            id: breadth.id,
            title: achievementTranslation?.title || breadth.id,
            description: achievementTranslation?.description || breadth.description || '',
            completed: departmentCount >= (breadth.threshold || 0),
            category: 'department',
            progress: {
              current: departmentCount,
              target: breadth.threshold || 0
            }
          })
        } catch (err) {
          logger.warn('Error calculating department breadth:', breadth.id, err)
        }
      })
    }

    // Specialty Depth
    if (config.specialtyDepth) {
      config.specialtyDepth.forEach((specialty) => {
        try {
          let completed = false
          let progress = { current: 0, target: 1 }

          if (specialty.type === 'qualificationComplete') {
            const qualificationCount = calculateQualifications(courseData, userProgress)
            completed = qualificationCount > 0
            progress = { current: qualificationCount, target: 1 }
          } else if (specialty.type === 'warrantLevel') {
            const warrantCount = calculateWarrantCourses(courseData, userProgress)
            completed = warrantCount > 0
            progress = { current: warrantCount, target: 1 }
          }

          const achievementTranslation =
            translations.achievements[specialty.id as keyof typeof translations.achievements]

          achievements.push({
            id: specialty.id,
            title: achievementTranslation?.title || specialty.id,
            description: achievementTranslation?.description || specialty.description || '',
            completed,
            category: 'specialty',
            progress
          })
        } catch (err) {
          logger.warn('Error calculating specialty depth:', specialty.id, err)
        }
      })
    }

    // Institution Diversity
    if (config.institutionDiversity) {
      config.institutionDiversity.forEach((institution) => {
        try {
          const institutionCount = calculateInstitutionDiversity(
            courseData,
            userProgress,
            institution.institutions || []
          )
          const targetCount = institution.institutions?.length || 0
          const achievementTranslation =
            translations.achievements[institution.id as keyof typeof translations.achievements]

          achievements.push({
            id: institution.id,
            title: achievementTranslation?.title || institution.id,
            description: achievementTranslation?.description || institution.description || '',
            completed: institutionCount >= targetCount,
            category: 'institution',
            progress: {
              current: institutionCount,
              target: targetCount
            }
          })
        } catch (err) {
          logger.warn('Error calculating institution diversity:', institution.id, err)
        }
      })
    }

    logger.log('🏆 Final Achievement Results:', {
      totalAchievements: achievements.length,
      achievementIds: achievements.map((a) => a.id),
      completed: achievements.filter((a) => a.completed).map((a) => a.id),
      usingFallback: achievements.length === 0
    })

    return achievements.length > 0 ? achievements : getFallbackAchievements(userProgress, translations)
  } catch (error) {
    logger.error('Error in calculateAchievements:', error)
    return getFallbackAchievements(userProgress, translations)
  }
}

function getFallbackAchievements(
  userProgress: UserProgress,
  translations: TranslationStrings
): CalculatedAchievement[] {
  const completedCount = userProgress?.completedCourses?.size || 0

  return [
    {
      id: 'firstCourse',
      title: translations.achievements.firstCourse.title,
      description: translations.achievements.firstCourse.description,
      completed: completedCount >= 1,
      category: 'progression',
      progress: { current: completedCount >= 1 ? 1 : 0, target: 1 }
    },
    {
      id: 'gettingStarted',
      title: translations.achievements.gettingStarted.title,
      description: translations.achievements.gettingStarted.description,
      completed: completedCount >= 3,
      category: 'progression',
      progress: { current: Math.min(completedCount, 3), target: 3 }
    }
  ]
}

function calculateUniqueDepartments(courseData: ParsedCourseData, userProgress: UserProgress): number {
  try {
    const departments = new Set<string>()

    Array.from(userProgress.completedCourses || []).forEach((courseCode) => {
      try {
        const course = courseData.courseMap?.get(courseCode)
        if (course) {
          const department = getCourseMainDepartment(course, courseData.departmentMappings || new Map())
          if (department && department !== 'Other') {
            departments.add(department)
          }
        }
      } catch (err) {
        logger.warn('Error processing course for department calculation:', courseCode, err)
      }
    })

    return departments.size
  } catch (error) {
    logger.warn('Error calculating unique departments:', error)
    return 0
  }
}

function calculateQualifications(courseData: ParsedCourseData, userProgress: UserProgress): number {
  try {
    const qualifications = new Set<string>()

    Array.from(userProgress.completedCourses || []).forEach((courseCode) => {
      try {
        const course = courseData.courseMap?.get(courseCode)
        if (course && course.level === 'D') {
          // Extract base code (remove level suffix)
          const baseCode = courseCode.replace(/[ACDW]$/, '')
          const aCode = `${baseCode}A`
          const cCode = `${baseCode}C`

          // Check if user has completed the full A→C→D sequence
          if (userProgress.completedCourses.has(aCode) && userProgress.completedCourses.has(cCode)) {
            qualifications.add(baseCode)
          }
        }
      } catch (err) {
        logger.warn('Error processing course for qualification calculation:', courseCode, err)
      }
    })

    return qualifications.size
  } catch (error) {
    logger.warn('Error calculating qualifications:', error)
    return 0
  }
}

function calculateWarrantCourses(courseData: ParsedCourseData, userProgress: UserProgress): number {
  try {
    let warrantCount = 0

    Array.from(userProgress.completedCourses || []).forEach((courseCode) => {
      try {
        const course = courseData.courseMap?.get(courseCode)
        if (course && course.level === 'W') {
          warrantCount++
        }
      } catch (err) {
        logger.warn('Error processing course for warrant calculation:', courseCode, err)
      }
    })

    return warrantCount
  } catch (error) {
    logger.warn('Error calculating warrant courses:', error)
    return 0
  }
}

function calculateInstitutionDiversity(
  courseData: ParsedCourseData,
  userProgress: UserProgress,
  targetInstitutions: string[]
): number {
  try {
    const completedInstitutions = new Set<string>()

    Array.from(userProgress.completedCourses || []).forEach((courseCode) => {
      try {
        const course = courseData.courseMap?.get(courseCode)
        if (course) {
          let institution = 'Other'

          if (course.code.includes('SIA-SRN')) {
            institution = 'TSC'
          } else if (course.code.includes('RMACA')) {
            institution = 'RMACA'
          } else if (course.code.includes('MU') || course.code.includes('LU')) {
            institution = 'University'
          }

          if (targetInstitutions.includes(institution)) {
            completedInstitutions.add(institution)
          }
        }
      } catch (err) {
        logger.warn('Error processing course for institution calculation:', courseCode, err)
      }
    })

    return completedInstitutions.size
  } catch (error) {
    logger.warn('Error calculating institution diversity:', error)
    return 0
  }
}
