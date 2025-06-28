import React from 'react'
import { Course, NodeStatus, UserProgress } from '~/types'
import { useCourseNode } from './useCourseNode'
import {
  courseNodeContainer,
  courseCode,
  courseName,
  courseLevel,
  prerequisites,
  statusIcon
} from './courseNode.recipe'

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
    <div
      className={courseNodeContainer({ status: status || 'error' })}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleRightClick}
      onKeyDown={handleKeyDown}
      title={getTitle()}
      role="button"
      tabIndex={0}
      aria-label={getAriaLabel()}
    >
      <div className={courseCode}>{course.code}</div>
      <div className={courseName}>{course.name}</div>
      {course.level && <div className={courseLevel}>{course.level}</div>}
      <div className={prerequisites}>{getPrerequisiteText()}</div>
      <div className={statusIcon({ status: status || 'error' })} />
    </div>
  )
}
