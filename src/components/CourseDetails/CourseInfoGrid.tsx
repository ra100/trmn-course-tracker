import React from 'react'
import { CourseInfoGridProps } from './types'
import { useT } from '../../i18n'
import { InfoGrid, InfoItem, InfoLabel, InfoValue } from './CourseDetails.styles'

export const CourseInfoGrid: React.FC<CourseInfoGridProps> = ({
  course,
  prerequisites,
  unlockedCourses,
  getStatusText
}) => {
  const t = useT()

  return (
    <InfoGrid>
      {course.level && (
        <InfoItem>
          <InfoLabel>{t.progress.level}</InfoLabel>
          <InfoValue>{course.level}</InfoValue>
        </InfoItem>
      )}
      <InfoItem>
        <InfoLabel>{t.courseDetails.prerequisites}</InfoLabel>
        <InfoValue>{prerequisites.length || t.courseDetails.none}</InfoValue>
      </InfoItem>
      <InfoItem>
        <InfoLabel>{t.courseDetails.unlocks}</InfoLabel>
        <InfoValue>
          {unlockedCourses.length} {t.courseDetails.courses}
        </InfoValue>
      </InfoItem>
      <InfoItem>
        <InfoLabel>{t.courseDetails.status}</InfoLabel>
        <InfoValue>{getStatusText()}</InfoValue>
      </InfoItem>
    </InfoGrid>
  )
}
