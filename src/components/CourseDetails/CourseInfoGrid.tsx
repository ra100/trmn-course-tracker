import React from 'react'
import { CourseInfoGridProps } from './types'
import { useT } from '~/i18n'
import { infoGrid, infoItem, infoLabel, infoValue } from './CourseDetails.styles'

export const CourseInfoGrid: React.FC<CourseInfoGridProps> = React.memo(
  ({ course, prerequisites, unlockedCourses, getStatusText }) => {
    const t = useT()

    return (
      <div className={infoGrid}>
        {course.level && (
          <div className={infoItem}>
            <div className={infoLabel}>{t.progress.level}</div>
            <div className={infoValue}>{course.level}</div>
          </div>
        )}
        <div className={infoItem}>
          <div className={infoLabel}>{t.courseDetails.prerequisites}</div>
          <div className={infoValue}>{prerequisites.length || t.courseDetails.none}</div>
        </div>
        <div className={infoItem}>
          <div className={infoLabel}>{t.courseDetails.unlocks}</div>
          <div className={infoValue}>
            {unlockedCourses.length} {t.courseDetails.courses}
          </div>
        </div>
        <div className={infoItem}>
          <div className={infoLabel}>{t.courseDetails.status}</div>
          <div className={infoValue}>{getStatusText()}</div>
        </div>
      </div>
    )
  }
)

CourseInfoGrid.displayName = 'CourseInfoGrid'
