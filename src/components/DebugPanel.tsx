import React, { useState } from 'react'
import { debugContainer, debugHeader, debugContent } from './DebugPanel/DebugPanel.styles'
import { ParseSummarySection } from './DebugPanel/ParseSummarySection'
import { DepartmentSection } from './DebugPanel/DepartmentSection'
import { CompletedCoursesSection } from './DebugPanel/CompletedCoursesSection'
import { useDebugData } from './DebugPanel/useDebugData'
import { DebugPanelProps } from './DebugPanel/types'

export const DebugPanel: React.FC<DebugPanelProps> = React.memo(({ courseData, userProgress }) => {
  const [expanded, setExpanded] = useState(false)
  const { debugData, departmentCourses } = useDebugData({ courseData, userProgress })

  return (
    <div className={debugContainer}>
      <div className={debugHeader} onClick={() => setExpanded(!expanded)}>
        🐛 Debug Info {expanded ? '▼' : '▶'}
      </div>
      <div className={debugContent({ expanded })}>
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
      </div>
    </div>
  )
})

DebugPanel.displayName = 'DebugPanel'
