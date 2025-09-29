import React from 'react'
import { PrerequisitesSectionProps } from './types'
import { useT } from '~/i18n'
import { Progress } from '~/components/ui/progress'
import {
  section,
  sectionTitle,
  prerequisitesList,
  prerequisiteItem,
  departmentChoiceItem,
  departmentChoiceHeader,
  departmentChoiceProgress,
  departmentList,
  clickableCourseCode,
  courseAliasGroup,
  courseAliasBadge,
  primaryCourseCode
} from './CourseDetails.styles'

export const PrerequisitesSection: React.FC<PrerequisitesSectionProps> = React.memo(
  ({ prerequisites, onCourseSelect, handleCourseClick }) => {
    const t = useT()

    if (prerequisites.length === 0) {
      return null
    }

    return (
      <div className={section}>
        <h3 className={sectionTitle}>{t.courseDetails.prerequisites}</h3>
        <div className={prerequisitesList}>
          {prerequisites.map((prereq, index) => {
            if (prereq.type === 'department_choice') {
              const progress = prereq.progress || 0
              const total = prereq.total || 1
              const percentage = total > 0 ? (progress / total) * 100 : 0

              return (
                <div
                  key={`dept-choice-${prereq.text || index}`}
                  className={departmentChoiceItem({ satisfied: prereq.satisfied })}
                >
                  <div className={departmentChoiceHeader}>
                    {prereq.satisfied ? '✓' : '○'} Department Choice Requirement
                  </div>
                  <div className={departmentChoiceProgress({ satisfied: prereq.satisfied })}>
                    Progress: {progress}/{total} courses completed
                  </div>
                  <div className={departmentList}>{prereq.text}</div>
                  <Progress value={percentage} />
                </div>
              )
            }

            if (prereq.type === 'course' && prereq.courseCode && onCourseSelect) {
              const courseCode = prereq.courseCode
              const courseCodes = prereq.courseCodes
              const satisfyingCourse = prereq.satisfyingCourse

              return (
                <div key={`course-${courseCode}`} className={prerequisiteItem({ satisfied: prereq.satisfied })}>
                  <div>
                    Course:{' '}
                    {courseCodes && courseCodes.length > 1 ? (
                      <span className={courseAliasGroup}>
                        {courseCodes.map((code, index) => (
                          <React.Fragment key={code}>
                            <span
                              onClick={() => handleCourseClick(code)}
                              className={index === 0 ? primaryCourseCode : courseAliasBadge}
                              style={{
                                background:
                                  satisfyingCourse === code
                                    ? 'var(--colors-green-100)'
                                    : index === 0
                                    ? 'var(--colors-accent-100)'
                                    : 'var(--colors-bg-subtle)',
                                color:
                                  satisfyingCourse === code
                                    ? 'var(--colors-green-700)'
                                    : index === 0
                                    ? 'var(--colors-accent-700)'
                                    : 'var(--colors-fg-muted)'
                              }}
                            >
                              {code}
                              {satisfyingCourse === code && (
                                <span style={{ marginLeft: '0.25rem', fontSize: 'xs' }}>✓</span>
                              )}
                            </span>
                            {index < courseCodes.length - 1 && (
                              <span style={{ color: 'var(--colors-fg-muted)', fontSize: 'xs' }}> / </span>
                            )}
                          </React.Fragment>
                        ))}
                      </span>
                    ) : (
                      <span onClick={() => handleCourseClick(courseCode)} className={clickableCourseCode}>
                        {courseCode}
                      </span>
                    )}
                  </div>
                  {satisfyingCourse && satisfyingCourse !== courseCode && (
                    <div style={{ fontSize: 'xs', opacity: 0.8, marginTop: '0.25rem' }}>
                      Satisfied by: {satisfyingCourse}
                    </div>
                  )}
                </div>
              )
            }

            if (prereq.type === 'alternative_group' && prereq.courseCodes && onCourseSelect) {
              return (
                <div
                  key={`alt-group-${prereq.courseCodes.join('-')}`}
                  className={prerequisiteItem({ satisfied: prereq.satisfied })}
                >
                  One of:{' '}
                  {prereq.courseCodes.map((courseCode, codeIndex) => (
                    <React.Fragment key={courseCode}>
                      {codeIndex > 0 && ' OR '}
                      <span onClick={() => courseCode && handleCourseClick(courseCode)} className={clickableCourseCode}>
                        {courseCode}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              )
            }

            return (
              <div key={`prereq-${prereq.text || index}`} className={prerequisiteItem({ satisfied: prereq.satisfied })}>
                {prereq.text}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)

PrerequisitesSection.displayName = 'PrerequisitesSection'
