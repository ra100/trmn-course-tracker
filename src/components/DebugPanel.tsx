import React, { useState } from 'react'
import styled from 'styled-components'
import { ParsedCourseData, UserProgress } from '../types'

const DebugContainer = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.colors.border};
  box-shadow: ${(props) => props.theme.shadows.medium};
  margin: 1rem;
  overflow: hidden;
`

const DebugHeader = styled.div`
  background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
  color: white;
  padding: 1rem;
  font-weight: bold;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
`

const DebugContent = styled.div<{ $expanded: boolean }>`
  padding: ${(props) => (props.$expanded ? '1rem' : '0')};
  max-height: ${(props) => (props.$expanded ? '400px' : '0')};
  overflow-y: auto;
  transition: all 0.3s ease;
`

const Section = styled.div`
  margin-bottom: 1.5rem;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  padding: 1rem;
`

const SectionTitle = styled.h4`
  color: ${(props) => props.theme.colors.primary};
  margin: 0 0 1rem 0;
  font-size: 1rem;
`

const CourseList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`

const CourseItem = styled.li`
  padding: 0.25rem 0;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.text};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
`

const JsonPre = styled.pre`
  background: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text};
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.8rem;
  max-height: 200px;
  overflow-y: auto;
`

interface DebugPanelProps {
  courseData: ParsedCourseData
  userProgress: UserProgress
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ courseData, userProgress }) => {
  const [expanded, setExpanded] = useState(false)

  // Find Space Warfare Pin related courses
  const swpRelatedCourses = courseData.courses.filter((course) => {
    const code = course.code
    // Space Warfare Pin related courses
    return (
      code === 'SIA-SRN-31C' || // Master-at-Arms Advanced
      code === 'SIA-SRN-01C' || // Personnelman Advanced
      code === 'SIA-SRN-01A' || // Personnelman Specialist
      code === 'SIA-SRN-04A' || // Yeoman Specialist
      // Department courses (C and D levels)
      code.match(/^SIA-SRN-(05|06|07|35|08|09|10|27|28|29|32|14|15|16|17|18|19|11|12|13)[CD]$/)
    )
  })

  // Group by department
  const departmentCourses = {
    'Core Requirements': swpRelatedCourses.filter((c) =>
      ['SIA-SRN-31C', 'SIA-SRN-01C', 'SIA-SRN-01A', 'SIA-SRN-04A'].includes(c.code)
    ),
    Astrogation: swpRelatedCourses.filter((c) => c.code.match(/^SIA-SRN-(05|06|07|35)[CD]$/)),
    'Flight Operations': swpRelatedCourses.filter((c) => c.code.match(/^SIA-SRN-05[CD]$/)),
    Tactical: swpRelatedCourses.filter((c) => c.code.match(/^SIA-SRN-(08|09|10|27|28|29|32)[CD]$/)),
    Engineering: swpRelatedCourses.filter((c) => c.code.match(/^SIA-SRN-(14|15|16|17|18|19)[CD]$/)),
    Communications: swpRelatedCourses.filter((c) => c.code.match(/^SIA-SRN-(11|12|13)[CD]$/))
  }

  const debugData = {
    totalCourses: courseData.courses.length,
    swpRelatedCount: swpRelatedCourses.length,
    completedCourses: Array.from(userProgress.completedCourses),
    departmentCounts: Object.entries(departmentCourses).map(([dept, courses]) => ({
      department: dept,
      count: courses.length,
      codes: courses.map((c) => c.code)
    }))
  }

  return (
    <DebugContainer>
      <DebugHeader onClick={() => setExpanded(!expanded)}>🐛 Debug Info {expanded ? '▼' : '▶'}</DebugHeader>
      <DebugContent $expanded={expanded}>
        {expanded && (
          <>
            <Section>
              <SectionTitle>Parse Summary</SectionTitle>
              <JsonPre>{JSON.stringify(debugData, null, 2)}</JsonPre>
            </Section>

            {Object.entries(departmentCourses).map(([department, courses]) => (
              <Section key={department}>
                <SectionTitle>
                  {department} ({courses.length} courses)
                </SectionTitle>
                <CourseList>
                  {courses.map((course) => (
                    <CourseItem key={course.code}>
                      {course.code}: {course.name}
                      {userProgress.completedCourses.has(course.code) && ' ✅'}
                    </CourseItem>
                  ))}
                </CourseList>
              </Section>
            ))}

            <Section>
              <SectionTitle>All Completed Courses</SectionTitle>
              <CourseList>
                {Array.from(userProgress.completedCourses).map((code) => (
                  <CourseItem key={code}>
                    {code}
                    {courseData.courses.find((c) => c.code === code)?.name &&
                      ` - ${courseData.courses.find((c) => c.code === code)?.name}`}
                  </CourseItem>
                ))}
              </CourseList>
            </Section>
          </>
        )}
      </DebugContent>
    </DebugContainer>
  )
}
