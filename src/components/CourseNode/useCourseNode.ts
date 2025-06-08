import { useCallback } from 'react'
import { Course, NodeStatus, UserProgress } from '../../types'
import { useT } from '../../i18n'
import { trackCourseDetailsView, trackFeatureEngagement } from '../../utils/analytics'

interface UseCourseNodeProps {
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

interface UseCourseNodeReturn {
  handleClick: () => void
  handleDoubleClick: () => void
  handleRightClick: (e: React.MouseEvent) => void
  handleKeyDown: (e: React.KeyboardEvent) => void
  getPrerequisiteText: () => string
  getAriaLabel: () => string
  getTitle: () => string
}

/**
 * Custom hook for CourseNode interactions and logic
 */
export const useCourseNode = ({
  course,
  status,
  userProgress,
  onCourseSelect,
  onCourseToggle,
  onCourseStatusChange
}: UseCourseNodeProps): UseCourseNodeReturn => {
  const t = useT()

  const handleClick = useCallback(() => {
    trackCourseDetailsView(course.code, course.name, 'skill_tree_click')
    onCourseSelect(course)
  }, [course, onCourseSelect])

  const handleDoubleClick = useCallback(() => {
    if (course.available || course.completed) {
      trackFeatureEngagement('course_toggle', 'double_click', {
        course_id: course.code,
        course_name: course.name,
        current_status: course.completed ? 'completed' : 'available'
      })
      onCourseToggle(course.code)
    }
  }, [course, onCourseToggle])

  const handleRightClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      if (
        !course.available &&
        !course.completed &&
        !userProgress.inProgressCourses.has(course.code) &&
        !userProgress.waitingGradeCourses.has(course.code)
      ) {
        return // Don't show context menu for locked courses
      }

      const contextMenu = document.createElement('div')
      contextMenu.style.position = 'fixed'
      contextMenu.style.left = `${e.clientX}px`
      contextMenu.style.top = `${e.clientY}px`
      contextMenu.style.background = 'white'
      contextMenu.style.border = '1px solid #ccc'
      contextMenu.style.borderRadius = '4px'
      contextMenu.style.padding = '8px'
      contextMenu.style.zIndex = '1000'
      contextMenu.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'
      contextMenu.style.minWidth = '120px'

      const options = [
        { label: t.courseStatus.available, value: 'available' as const },
        { label: t.courseStatus.inProgress, value: 'in_progress' as const },
        { label: t.courseStatus.waitingGrade, value: 'waiting_grade' as const },
        { label: t.courseStatus.completed, value: 'completed' as const }
      ]

      options.forEach((option) => {
        const item = document.createElement('div')
        item.textContent = option.label
        item.style.padding = '4px 8px'
        item.style.cursor = 'pointer'
        item.style.borderRadius = '2px'
        item.addEventListener('mouseenter', () => {
          item.style.backgroundColor = '#f0f0f0'
        })
        item.addEventListener('mouseleave', () => {
          item.style.backgroundColor = 'transparent'
        })
        item.addEventListener('click', () => {
          trackFeatureEngagement('course_status_change', 'context_menu', {
            course_id: course.code,
            course_name: course.name,
            new_status: option.value
          })
          onCourseStatusChange(course.code, option.value)
          document.body.removeChild(contextMenu)
        })
        contextMenu.appendChild(item)
      })

      const closeContextMenu = () => {
        if (document.body.contains(contextMenu)) {
          document.body.removeChild(contextMenu)
        }
        document.removeEventListener('click', closeContextMenu)
      }

      document.addEventListener('click', closeContextMenu)
      document.body.appendChild(contextMenu)
    },
    [course, userProgress, t.courseStatus, onCourseStatusChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleClick()
      }
    },
    [handleClick]
  )

  const getPrerequisiteText = useCallback((): string => {
    const prereqs = course.prerequisites.filter((p) => p.type === 'course' && p.code).map((p) => p.code)

    if (prereqs.length === 0) {
      return 'No prerequisites'
    }
    if (prereqs.length <= 3) {
      return `Requires: ${prereqs.join(', ')}`
    }
    return `Requires: ${prereqs.slice(0, 3).join(', ')}...`
  }, [course.prerequisites])

  const getAriaLabel = useCallback((): string => {
    return `${course.name} (${course.code}) - Status: ${status}. ${t.courseActions.doubleClickToToggle} ${
      course.completed ? t.courseActions.markIncomplete.toLowerCase() : t.courseActions.markComplete.toLowerCase()
    }`
  }, [course, status, t])

  const getTitle = useCallback((): string => {
    return `${t.courseActions.doubleClickToToggle} ${
      course.completed ? t.courseActions.markIncomplete.toLowerCase() : t.courseActions.markComplete.toLowerCase()
    } | ${t.courseActions.rightClickForOptions}`
  }, [course, t])

  return {
    handleClick,
    handleDoubleClick,
    handleRightClick,
    handleKeyDown,
    getPrerequisiteText,
    getAriaLabel,
    getTitle
  }
}
