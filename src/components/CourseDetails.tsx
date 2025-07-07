import React from 'react'
import { Course, UserProgress } from '~/types'
import { EligibilityEngine } from '~/utils/eligibilityEngine'
import { useT } from '~/i18n'
import {
  CourseHeader,
  CourseActions,
  PrerequisitesSection,
  UnlockedCoursesSection,
  CourseDescription,
  useCourseDetails
} from './CourseDetails/index'
import {
  detailsContainer,
  emptyState,
  panelCard,
  headerCard,
  headerDivider,
  actionGroup
} from './CourseDetails/CourseDetails.styles'

interface CourseDetailsProps {
  course: Course | null
  userProgress: UserProgress
  eligibilityEngine: EligibilityEngine
  onCourseToggle: (courseCode: string) => void
  onCourseStatusChange?: (
    courseCode: string,
    status: 'available' | 'in_progress' | 'waiting_grade' | 'completed'
  ) => void
  onCourseSelect?: (course: Course) => void
}

interface CourseDetailsContentProps {
  course: Course
  userProgress: UserProgress
  eligibilityEngine: EligibilityEngine
  onCourseToggle: (courseCode: string) => void
  onCourseStatusChange?: (
    courseCode: string,
    status: 'available' | 'in_progress' | 'waiting_grade' | 'completed'
  ) => void
  onCourseSelect?: (course: Course) => void
}

const CourseDetailsContent: React.FC<CourseDetailsContentProps> = ({
  course,
  userProgress,
  eligibilityEngine,
  onCourseToggle,
  onCourseStatusChange,
  onCourseSelect
}) => {
  const { status, getStatusText, prerequisites, unlockedCourses, handleToggleClick, handleCourseClick } =
    useCourseDetails({
      course,
      userProgress,
      eligibilityEngine,
      onCourseToggle,
      onCourseSelect
    })

  return (
    <div className={panelCard}>
      <div className={headerCard}>
        <CourseHeader course={course} status={status} getStatusText={getStatusText} userProgress={userProgress} />
        <div className={headerDivider} />
      </div>

      <div className={actionGroup}>
        <CourseActions
          course={course}
          status={status}
          onCourseToggle={handleToggleClick}
          onCourseStatusChange={onCourseStatusChange}
        />
      </div>

      <PrerequisitesSection
        prerequisites={prerequisites}
        onCourseSelect={onCourseSelect}
        handleCourseClick={handleCourseClick}
      />

      <UnlockedCoursesSection
        unlockedCourses={unlockedCourses}
        onCourseSelect={onCourseSelect}
        handleCourseClick={handleCourseClick}
      />

      <CourseDescription course={course} />
    </div>
  )
}

export const CourseDetails: React.FC<CourseDetailsProps> = ({
  course,
  userProgress,
  eligibilityEngine,
  onCourseToggle,
  onCourseStatusChange,
  onCourseSelect
}) => {
  const t = useT()

  if (!course) {
    return (
      <div className={detailsContainer}>
        <div className={emptyState}>{t.courseDetails.selectCourse}</div>
      </div>
    )
  }

  return (
    <div className={detailsContainer}>
      <CourseDetailsContent
        course={course}
        userProgress={userProgress}
        eligibilityEngine={eligibilityEngine}
        onCourseToggle={onCourseToggle}
        onCourseStatusChange={onCourseStatusChange}
        onCourseSelect={onCourseSelect}
      />
    </div>
  )
}
