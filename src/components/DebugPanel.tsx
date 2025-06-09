import React, { useState } from 'react'
import { DebugContainer, DebugHeader, DebugContent } from './DebugPanel/DebugPanel.styles'
import { ParseSummarySection } from './DebugPanel/ParseSummarySection'
import { DepartmentSection } from './DebugPanel/DepartmentSection'
import { CompletedCoursesSection } from './DebugPanel/CompletedCoursesSection'
import { useDebugData } from './DebugPanel/useDebugData'
import { DebugPanelProps } from './DebugPanel/types'

export const DebugPanel: React.FC<DebugPanelProps> = React.memo(({ courseData, userProgress }) => {
  const [expanded, setExpanded] = useState(false)
  const { debugData, departmentCourses } = useDebugData({ courseData, userProgress })

  return (
    <DebugContainer>
      <DebugHeader onClick={() => setExpanded(!expanded)}>🐛 Debug Info {expanded ? '▼' : '▶'}</DebugHeader>
      <DebugContent $expanded={expanded}>
        {expanded && (
          <>
            <ParseSummarySection debugData={debugData} />

            {Object.entries(departmentCourses).map(([department, courses]) => (
              <DepartmentSection
                key={department}
                department={department}
                courses={courses}
                userProgress={userProgress}
              />
            ))}

            <CompletedCoursesSection courseData={courseData} userProgress={userProgress} />
          </>
        )}
      </DebugContent>
    </DebugContainer>
  )
})

DebugPanel.displayName = 'DebugPanel'
