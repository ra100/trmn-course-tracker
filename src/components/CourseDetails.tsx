import React from 'react'
import { Course, UserProgress } from '../types'
import { EligibilityEngine } from '../utils/eligibilityEngine'
import { useT } from '../i18n'
import {
  CourseHeader,
  CourseInfoGrid,
  CourseActions,
  PrerequisitesSection,
  UnlockedCoursesSection,
  CourseDescription,
  useCourseDetails,
  DetailsContainer,
  EmptyState
} from './CourseDetails/index'

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
    <>
      <CourseHeader course={course} status={status} getStatusText={getStatusText} />

      <CourseInfoGrid
        course={course}
        prerequisites={prerequisites}
        unlockedCourses={unlockedCourses}
        getStatusText={getStatusText}
      />

      <CourseActions
        course={course}
        status={status}
        onCourseToggle={handleToggleClick}
        onCourseStatusChange={onCourseStatusChange}
      />

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
    </>
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
      <DetailsContainer>
        <EmptyState>{t.courseDetails.selectCourse}</EmptyState>
      </DetailsContainer>
    )
  }

  return (
    <DetailsContainer>
      <CourseDetailsContent
        course={course}
        userProgress={userProgress}
        eligibilityEngine={eligibilityEngine}
        onCourseToggle={onCourseToggle}
        onCourseStatusChange={onCourseStatusChange}
        onCourseSelect={onCourseSelect}
      />
    </DetailsContainer>
  )
}
