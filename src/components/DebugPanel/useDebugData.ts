import { useMemo } from 'react'
import { UseDebugDataProps, UseDebugDataReturn, DepartmentCourses, DepartmentCourse } from './types'

export const useDebugData = ({ courseData, userProgress }: UseDebugDataProps): UseDebugDataReturn => {
  const debugData = useMemo(() => {
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
    const departmentCourses: DepartmentCourses = {
      'Core Requirements': swpRelatedCourses.filter((c) =>
        ['SIA-SRN-31C', 'SIA-SRN-01C', 'SIA-SRN-01A', 'SIA-SRN-04A'].includes(c.code)
      ),
      Astrogation: swpRelatedCourses.filter((c) => c.code.match(/^SIA-SRN-(05|06|07|35)[CD]$/)),
      'Flight Operations': swpRelatedCourses.filter((c) => c.code.match(/^SIA-SRN-05[CD]$/)),
      Tactical: swpRelatedCourses.filter((c) => c.code.match(/^SIA-SRN-(08|09|10|27|28|29|32)[CD]$/)),
      Engineering: swpRelatedCourses.filter((c) => c.code.match(/^SIA-SRN-(14|15|16|17|18|19)[CD]$/)),
      Communications: swpRelatedCourses.filter((c) => c.code.match(/^SIA-SRN-(11|12|13)[CD]$/))
    }

    const data = {
      totalCourses: courseData.courses.length,
      swpRelatedCount: swpRelatedCourses.length,
      completedCourses: Array.from(userProgress.completedCourses),
      departmentCounts: Object.entries(departmentCourses).map(([dept, courses]) => ({
        department: dept,
        count: courses.length,
        codes: courses.map((c: DepartmentCourse) => c.code)
      }))
    }

    return { debugData: data, departmentCourses }
  }, [courseData.courses, userProgress.completedCourses])

  return debugData
}
