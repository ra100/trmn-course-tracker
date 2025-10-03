import React from 'react'
import { UnlockedCoursesSectionProps } from './types'
import { Course } from '~/types'
import { useT } from '~/i18n'
import {
  section,
  sectionTitle,
  unlockedCoursesList,
  unlockedCourseItem,
  clickableUnlockedCourse,
  courseAliasGroup,
  courseAliasBadge,
  primaryCourseCode
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
                const aliases = unlockedCourse.aliases || []

                return onCourseSelect ? (
                  <div
                    key={unlockedCourse.id}
                    onClick={() => handleCourseClick(unlockedCourse.code)}
                    className={clickableUnlockedCourse}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1', flexWrap: 'wrap' }}>
                      {aliases.length > 0 ? (
                        <span className={courseAliasGroup}>
                          {aliases.map((alias, index) => (
                            <React.Fragment key={alias}>
                              <span
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCourseClick(alias)
                                }}
                                className={index === 0 ? primaryCourseCode : courseAliasBadge}
                                style={{
                                  background: index === 0 ? 'var(--colors-accent-100)' : 'var(--colors-bg-subtle)',
                                  color: index === 0 ? 'var(--colors-accent-700)' : 'var(--colors-fg-muted)'
                                }}
                              >
                                {alias}
                              </span>
                              {index < aliases.length - 1 && (
                                <span style={{ color: 'var(--colors-fg-muted)', fontSize: 'xs' }}> / </span>
                              )}
                            </React.Fragment>
                          ))}
                        </span>
                      ) : (
                        <strong>{unlockedCourse.code}</strong>
                      )}
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
                    </div>
                    <div style={{ fontSize: 'sm', opacity: 0.9 }}>{unlockedCourse.name}</div>
                    {unlockedCourse.description && (
                      <div style={{ fontSize: 'xs', opacity: 0.8, marginTop: '0.5' }}>{unlockedCourse.description}</div>
                    )}
                  </div>
                ) : (
                  <div key={unlockedCourse.id} className={unlockedCourseItem}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1', flexWrap: 'wrap' }}>
                      {aliases.length > 0 ? (
                        <span className={courseAliasGroup}>
                          {aliases.map((alias, index) => (
                            <React.Fragment key={alias}>
                              <span
                                className={index === 0 ? primaryCourseCode : courseAliasBadge}
                                style={{
                                  background: index === 0 ? 'var(--colors-accent-100)' : 'var(--colors-bg-subtle)',
                                  color: index === 0 ? 'var(--colors-accent-700)' : 'var(--colors-fg-muted)'
                                }}
                              >
                                {alias}
                              </span>
                              {index < aliases.length - 1 && (
                                <span style={{ color: 'var(--colors-fg-muted)', fontSize: 'xs' }}> / </span>
                              )}
                            </React.Fragment>
                          ))}
                        </span>
                      ) : (
                        <strong>{unlockedCourse.code}</strong>
                      )}
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
