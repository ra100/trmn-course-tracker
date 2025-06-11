import React, { useState, useMemo, useRef } from 'react'
import { useCourseFiltering } from '../hooks/useCourseFiltering'
import {
  CourseSearch,
  GroupingControls,
  CourseStats,
  SkillTreeViewProps,
  GroupingMode,
  TreeContainer,
  CategoryCourseRenderer
} from './SkillTreeView/index'

const SkillTreeViewComponent: React.FC<SkillTreeViewProps> = ({
  courseData,
  userProgress,
  filters,
  settings,
  eligibilityEngine,
  onCourseSelect,
  onCourseToggle,
  onCourseStatusChange
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [groupingMode, setGroupingMode] = useState<GroupingMode>('section')
  const containerRef = useRef<HTMLDivElement>(null)

  // Memoize expensive computations
  const updatedCourses = useMemo(() => {
    return eligibilityEngine.updateCourseAvailability(userProgress)
  }, [eligibilityEngine, userProgress])

  // Use custom hook for filtering logic
  const { filteredCourses, getCourseStatus, stats } = useCourseFiltering({
    courses: updatedCourses,
    searchTerm,
    filters,
    settings,
    userProgress,
    courseData
  })

  return (
    <TreeContainer ref={containerRef}>
      <CourseSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <GroupingControls groupingMode={groupingMode} onGroupingModeChange={setGroupingMode} />

      <CourseStats stats={stats} />

      <CategoryCourseRenderer
        filteredCourses={filteredCourses}
        groupingMode={groupingMode}
        userProgress={userProgress}
        courseData={courseData}
        getCourseStatus={getCourseStatus}
        onCourseSelect={onCourseSelect}
        onCourseToggle={onCourseToggle}
        onCourseStatusChange={onCourseStatusChange}
      />
    </TreeContainer>
  )
}

export const SkillTreeView = React.memo(SkillTreeViewComponent)
