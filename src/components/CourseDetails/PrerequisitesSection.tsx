import React from 'react'
import { PrerequisitesSectionProps } from './types'
import { useT } from '../../i18n'
import {
  Section,
  SectionTitle,
  PrerequisitesList,
  PrerequisiteItem,
  DepartmentChoiceItem,
  DepartmentChoiceHeader,
  DepartmentChoiceProgress,
  DepartmentList,
  ProgressBar,
  ClickableCourseCode
} from './CourseDetails.styles'

export const PrerequisitesSection: React.FC<PrerequisitesSectionProps> = React.memo(
  ({ prerequisites, onCourseSelect, handleCourseClick }) => {
    const t = useT()

    if (prerequisites.length === 0) {
      return null
    }

    return (
      <Section>
        <SectionTitle>{t.courseDetails.prerequisites}</SectionTitle>
        <PrerequisitesList>
          {prerequisites.map((prereq, index) => {
            if (prereq.type === 'department_choice') {
              const progress = prereq.progress || 0
              const total = prereq.total || 1
              const percentage = total > 0 ? (progress / total) * 100 : 0

              return (
                <DepartmentChoiceItem key={`dept-choice-${prereq.text || index}`} $satisfied={prereq.satisfied}>
                  <DepartmentChoiceHeader>
                    {prereq.satisfied ? '✓' : '○'} Department Choice Requirement
                  </DepartmentChoiceHeader>
                  <DepartmentChoiceProgress $satisfied={prereq.satisfied}>
                    Progress: {progress}/{total} courses completed
                  </DepartmentChoiceProgress>
                  <DepartmentList>{prereq.text}</DepartmentList>
                  <ProgressBar $percentage={percentage} $satisfied={prereq.satisfied} />
                </DepartmentChoiceItem>
              )
            }

            if (prereq.type === 'course' && prereq.courseCode && onCourseSelect) {
              const courseCode = prereq.courseCode
              return (
                <PrerequisiteItem key={`course-${courseCode}`} $satisfied={prereq.satisfied}>
                  Course:{' '}
                  <ClickableCourseCode onClick={() => courseCode && handleCourseClick(courseCode)}>
                    {courseCode}
                  </ClickableCourseCode>
                </PrerequisiteItem>
              )
            }

            if (prereq.type === 'alternative_group' && prereq.courseCodes && onCourseSelect) {
              return (
                <PrerequisiteItem key={`alt-group-${prereq.courseCodes.join('-')}`} $satisfied={prereq.satisfied}>
                  One of:{' '}
                  {prereq.courseCodes.map((courseCode, codeIndex) => (
                    <React.Fragment key={courseCode}>
                      {codeIndex > 0 && ' OR '}
                      <ClickableCourseCode onClick={() => courseCode && handleCourseClick(courseCode)}>
                        {courseCode}
                      </ClickableCourseCode>
                    </React.Fragment>
                  ))}
                </PrerequisiteItem>
              )
            }

            return (
              <PrerequisiteItem key={`prereq-${prereq.text || index}`} $satisfied={prereq.satisfied}>
                {prereq.text}
              </PrerequisiteItem>
            )
          })}
        </PrerequisitesList>
      </Section>
    )
  }
)

PrerequisitesSection.displayName = 'PrerequisitesSection'
