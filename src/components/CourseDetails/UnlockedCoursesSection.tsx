import React from 'react'
import { UnlockedCoursesSectionProps } from './types'
import { Course } from '~/types'
import { useT } from '~/i18n'
import {
  section,
  sectionTitle,
  unlockedCoursesList,
  unlockedCourseItem,
  clickableUnlockedCourse
} from './CourseDetails.styles'

export const UnlockedCoursesSection: React.FC<UnlockedCoursesSectionProps> = React.memo(
  ({ unlockedCourses, onCourseSelect, handleCourseClick }) => {
    const t = useT()

    if (unlockedCourses.length === 0) {
      return null
    }

    // Group courses by institution for better organization
    const coursesByInstitution = unlockedCourses.reduce((acc, course) => {
      const institution = course.institution || 'Other'
      if (!acc[institution]) {
        acc[institution] = []
      }
      acc[institution].push(course)
      return acc
    }, {} as Record<string, Course[]>)

    return (
      <div className={section}>
        <h3 className={sectionTitle}>{t.courseDetails.unlocksCourses}</h3>
        <div className={unlockedCoursesList}>
          {Object.entries(coursesByInstitution).map(([institution, courses]) => (
            <div key={institution}>
              <div
                style={{ fontSize: 'xs', color: 'var(--colors-fg-muted)', marginBottom: '0.5', fontWeight: 'semibold' }}
              >
                {institution}
              </div>
              {courses.map((unlockedCourse) => {
                const isIntroductory = unlockedCourse.isIntroductory
                const hasAliases = unlockedCourse.aliases && unlockedCourse.aliases.length > 0

                return onCourseSelect ? (
                  <div
                    key={unlockedCourse.id}
                    onClick={() => handleCourseClick(unlockedCourse.code)}
                    className={clickableUnlockedCourse}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1', flexWrap: 'wrap' }}>
                      <strong>{unlockedCourse.code}</strong>
                      {isIntroductory && (
                        <span
                          style={{
                            background: 'var(--colors-accent-100)',
                            color: 'var(--colors-accent-700)',
                            fontSize: 'xs',
                            padding: '0.25 0.5',
                            borderRadius: 'var(--radii-sm)',
                            fontWeight: 'medium'
                          }}
                        >
                          Introductory
                        </span>
                      )}
                      {hasAliases && (
                        <span
                          style={{
                            background: 'var(--colors-bg-subtle)',
                            color: 'var(--colors-fg-muted)',
                            fontSize: 'xs',
                            padding: '0.25 0.5',
                            borderRadius: 'var(--radii-sm)',
                            border: '1px solid var(--colors-border-default)',
                            fontWeight: 'medium'
                          }}
                        >
                          Has Aliases
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 'sm', opacity: 0.9 }}>{unlockedCourse.name}</div>
                    {unlockedCourse.description && (
                      <div style={{ fontSize: 'xs', opacity: 0.8, marginTop: '0.5' }}>{unlockedCourse.description}</div>
                    )}
                  </div>
                ) : (
                  <div key={unlockedCourse.id} className={unlockedCourseItem}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1', flexWrap: 'wrap' }}>
                      <strong>{unlockedCourse.code}</strong>
                      {isIntroductory && (
                        <span
                          style={{
                            background: 'var(--colors-accent-100)',
                            color: 'var(--colors-accent-700)',
                            fontSize: 'xs',
                            padding: '0.25 0.5',
                            borderRadius: 'var(--radii-sm)',
                            fontWeight: 'medium'
                          }}
                        >
                          Introductory
                        </span>
                      )}
                      {hasAliases && (
                        <span
                          style={{
                            background: 'var(--colors-bg-subtle)',
                            color: 'var(--colors-fg-muted)',
                            fontSize: 'xs',
                            padding: '0.25 0.5',
                            borderRadius: 'var(--radii-sm)',
                            border: '1px solid var(--colors-border-default)',
                            fontWeight: 'medium'
                          }}
                        >
                          Has Aliases
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 'sm', opacity: 0.9 }}>{unlockedCourse.name}</div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }
)

UnlockedCoursesSection.displayName = 'UnlockedCoursesSection'
