import React from 'react'
import styled from 'styled-components'
import { Course, UserProgress } from '../types'
import { EligibilityEngine } from '../utils/eligibilityEngine'

const DetailsContainer = styled.div`
  padding: 1.5rem;
  height: 100%;
  overflow-y: auto;
`

const EmptyState = styled.div`
  text-align: center;
  color: #7f8c8d;
  padding: 2rem;
  font-style: italic;
`

const CourseHeader = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #ecf0f1;
`

const CourseTitle = styled.h2`
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
`

const CourseCode = styled.div`
  font-family: 'Courier New', monospace;
  color: #7f8c8d;
  font-size: 1rem;
  margin-bottom: 0.5rem;
`

const CourseSection = styled.div`
  color: #3498db;
  font-weight: 500;
  font-size: 0.9rem;
`

const StatusBadge = styled.div<{ status: 'completed' | 'available' | 'locked' | 'in_progress' | 'waiting_grade' }>`
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 0.5rem;
  background: ${(props) => {
    switch (props.status) {
      case 'completed':
        return '#27ae60'
      case 'waiting_grade':
        return '#d69e2e'
      case 'in_progress':
        return '#38b2ac'
      case 'available':
        return '#3498db'
      case 'locked':
        return '#95a5a6'
    }
  }};
  color: white;
`

const ActionButton = styled.button<{ variant: 'primary' | 'secondary' }>`
  padding: 0.7rem 1.2rem;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  margin-right: 0.5rem;
  transition: all 0.3s ease;

  background: ${(props) => (props.variant === 'primary' ? '#3498db' : '#95a5a6')};
  color: white;

  &:hover {
    background: ${(props) => (props.variant === 'primary' ? '#2980b9' : '#7f8c8d')};
    transform: translateY(-1px);
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    transform: none;
  }
`

const Section = styled.div`
  margin-bottom: 1.5rem;
`

const SectionTitle = styled.h3`
  color: #2c3e50;
  margin: 0 0 0.8rem 0;
  font-size: 1rem;
  font-weight: 600;
`

const PrerequisitesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const PrerequisiteItem = styled.div<{ satisfied: boolean }>`
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  background: ${(props) => (props.satisfied ? '#d5f4e6' : '#ffeaea')};
  color: ${(props) => (props.satisfied ? '#27ae60' : '#e74c3c')};
  border-left: 3px solid ${(props) => (props.satisfied ? '#27ae60' : '#e74c3c')};
`

const UnlockedCoursesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`

const UnlockedCourseItem = styled.div`
  padding: 0.4rem;
  background: #e8f4fd;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #2980b9;
`

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
`

const InfoItem = styled.div`
  background: #f8f9fa;
  padding: 0.8rem;
  border-radius: 4px;
`

const InfoLabel = styled.div`
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: 500;
  margin-bottom: 0.2rem;
`

const InfoValue = styled.div`
  font-weight: 600;
  color: #2c3e50;
`

const DescriptionText = styled.div`
  color: #2c3e50;
  line-height: 1.5;
`

interface CourseDetailsProps {
  course: Course | null
  userProgress: UserProgress
  eligibilityEngine: EligibilityEngine
  onCourseToggle: (courseCode: string) => void
  onCourseStatusChange?: (
    courseCode: string,
    status: 'available' | 'in_progress' | 'waiting_grade' | 'completed'
  ) => void
}

export const CourseDetails: React.FC<CourseDetailsProps> = ({
  course,
  userProgress,
  eligibilityEngine,
  onCourseToggle,
  onCourseStatusChange
}) => {
  if (!course) {
    return (
      <DetailsContainer>
        <EmptyState>Select a course to view details</EmptyState>
      </DetailsContainer>
    )
  }

  const getStatus = (): 'completed' | 'available' | 'locked' | 'in_progress' | 'waiting_grade' => {
    if (course.completed) return 'completed'
    if (userProgress.waitingGradeCourses.has(course.code)) return 'waiting_grade'
    if (userProgress.inProgressCourses.has(course.code)) return 'in_progress'
    if (course.available) return 'available'
    return 'locked'
  }

  const getStatusText = (): string => {
    const status = getStatus()
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'waiting_grade':
        return 'Waiting for Grade'
      case 'in_progress':
        return 'Working On'
      case 'available':
        return 'Available'
      case 'locked':
        return 'Prerequisites Required'
    }
  }

  const getPrerequisites = () => {
    return course.prerequisites
      .map((prereq) => {
        if (prereq.type === 'course' && prereq.code) {
          const satisfied = userProgress.completedCourses.has(prereq.code)
          return {
            text: `Course: ${prereq.code}`,
            satisfied,
            type: 'course'
          }
        } else if (prereq.type === 'alternative_group' && prereq.alternativePrerequisites) {
          // Check if any of the alternatives are satisfied
          const satisfiedAlternatives = prereq.alternativePrerequisites.filter(
            (alt) => alt.type === 'course' && alt.code && userProgress.completedCourses.has(alt.code)
          )
          const satisfied = satisfiedAlternatives.length > 0

          // Create a readable description
          const alternativeTexts = prereq.alternativePrerequisites
            .filter((alt) => alt.type === 'course' && alt.code)
            .map((alt) => alt.code)

          return {
            text: `One of: ${alternativeTexts.join(' OR ')}`,
            satisfied,
            type: 'alternative_group'
          }
        } else if (prereq.type === 'complex') {
          return {
            text: prereq.description || 'Complex requirement',
            satisfied: false, // Complex requirements need special handling
            type: 'complex'
          }
        }
        return null
      })
      .filter(Boolean)
  }

  const getUnlockedCourses = () => {
    return eligibilityEngine.getCoursesUnlockedBy(course.code)
  }

  const handleToggleClick = () => {
    if (course.available || course.completed) {
      onCourseToggle(course.code)
    }
  }

  const prerequisites = getPrerequisites()
  const unlockedCourses = getUnlockedCourses()
  const status = getStatus()

  return (
    <DetailsContainer>
      <CourseHeader>
        <CourseTitle>{course.name}</CourseTitle>
        <CourseCode>{course.code}</CourseCode>
        <CourseSection>
          {course.section}
          {course.subsection && ` → ${course.subsection}`}
        </CourseSection>
        <StatusBadge status={status}>{getStatusText()}</StatusBadge>
      </CourseHeader>

      <InfoGrid>
        {course.level && (
          <InfoItem>
            <InfoLabel>Level</InfoLabel>
            <InfoValue>{course.level}</InfoValue>
          </InfoItem>
        )}
        <InfoItem>
          <InfoLabel>Prerequisites</InfoLabel>
          <InfoValue>{prerequisites.length || 'None'}</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>Unlocks</InfoLabel>
          <InfoValue>{unlockedCourses.length} course(s)</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>Status</InfoLabel>
          <InfoValue>{getStatusText()}</InfoValue>
        </InfoItem>
      </InfoGrid>

      <ActionButton variant="primary" onClick={handleToggleClick} disabled={status === 'locked'}>
        {course.completed ? 'Mark Incomplete' : 'Mark Complete'}
      </ActionButton>

      {onCourseStatusChange && status !== 'locked' && (
        <>
          {status !== 'in_progress' && (
            <ActionButton variant="secondary" onClick={() => onCourseStatusChange(course.code, 'in_progress')}>
              Working On
            </ActionButton>
          )}
          {status !== 'waiting_grade' && (
            <ActionButton variant="secondary" onClick={() => onCourseStatusChange(course.code, 'waiting_grade')}>
              Waiting Grade
            </ActionButton>
          )}
          {(status === 'in_progress' || status === 'waiting_grade') && (
            <ActionButton variant="secondary" onClick={() => onCourseStatusChange(course.code, 'available')}>
              Reset to Available
            </ActionButton>
          )}
        </>
      )}

      {prerequisites.length > 0 && (
        <Section>
          <SectionTitle>Prerequisites</SectionTitle>
          <PrerequisitesList>
            {prerequisites.map((prereq, index) => (
              <PrerequisiteItem key={index} satisfied={prereq?.satisfied || false}>
                {prereq?.text}
              </PrerequisiteItem>
            ))}
          </PrerequisitesList>
        </Section>
      )}

      {unlockedCourses.length > 0 && (
        <Section>
          <SectionTitle>Unlocks These Courses</SectionTitle>
          <UnlockedCoursesList>
            {unlockedCourses.map((unlockedCourse) => (
              <UnlockedCourseItem key={unlockedCourse.id}>
                <strong>{unlockedCourse.code}</strong> - {unlockedCourse.name}
              </UnlockedCourseItem>
            ))}
          </UnlockedCoursesList>
        </Section>
      )}

      {course.description && (
        <Section>
          <SectionTitle>Description</SectionTitle>
          <DescriptionText>{course.description}</DescriptionText>
        </Section>
      )}
    </DetailsContainer>
  )
}
