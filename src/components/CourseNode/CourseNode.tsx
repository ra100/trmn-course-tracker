import React from 'react'
import { Course, NodeStatus, UserProgress } from '../../types'
import { useCourseNode } from './useCourseNode'
import {
  CourseNodeContainer,
  CourseCode,
  CourseName,
  CourseLevel,
  Prerequisites,
  StatusIcon
} from './CourseNode.styles'

interface CourseNodeProps {
  course: Course
  status: NodeStatus
  userProgress: UserProgress
  onCourseSelect: (course: Course) => void
  onCourseToggle: (courseCode: string) => void
  onCourseStatusChange: (
    courseCode: string,
    status: 'available' | 'in_progress' | 'waiting_grade' | 'completed'
  ) => void
}

/**
 * CourseNode represents a single course in the skill tree view with
 * visual status indicators, interactions, and accessibility features
 */
export const CourseNode: React.FC<CourseNodeProps> = ({
  course,
  status,
  userProgress,
  onCourseSelect,
  onCourseToggle,
  onCourseStatusChange
}) => {
  const {
    handleClick,
    handleDoubleClick,
    handleRightClick,
    handleKeyDown,
    getPrerequisiteText,
    getAriaLabel,
    getTitle
  } = useCourseNode({
    course,
    status,
    userProgress,
    onCourseSelect,
    onCourseToggle,
    onCourseStatusChange
  })

  return (
    <CourseNodeContainer
      status={status}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleRightClick}
      onKeyDown={handleKeyDown}
      title={getTitle()}
      role="button"
      tabIndex={0}
      aria-label={getAriaLabel()}
    >
      <CourseCode>{course.code}</CourseCode>
      <CourseName>{course.name}</CourseName>
      {course.level && <CourseLevel>{course.level}</CourseLevel>}
      <Prerequisites>{getPrerequisiteText()}</Prerequisites>
      <StatusIcon status={status} />
    </CourseNodeContainer>
  )
}
