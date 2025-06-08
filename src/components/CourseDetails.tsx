import React, { useEffect } from 'react'
import styled from 'styled-components'
import { Course, UserProgress } from '../types'
import { EligibilityEngine } from '../utils/eligibilityEngine'
import { useT } from '../i18n'
import { trackCourseDetailsView } from '../utils/analytics'

const DetailsContainer = styled.div`
  padding: 1.5rem;
  height: 100%;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }

  @media (max-width: 480px) {
    padding: 0.8rem;
  }
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
  border-bottom: 2px solid ${(props) => props.theme.colors.borderLight};
`

const CourseTitle = styled.h2`
  color: ${(props) => props.theme.colors.headerText};
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`

const CourseCode = styled.div`
  font-family: 'Courier New', monospace;
  color: ${(props) => props.theme.colors.code};
  font-size: 1rem;
  margin-bottom: 0.5rem;
`

const CourseSection = styled.div`
  color: ${(props) => props.theme.colors.primary};
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
        return props.theme.colors.courseCompleted
      case 'waiting_grade':
        return props.theme.colors.warning
      case 'in_progress':
        return props.theme.colors.courseInProgress
      case 'available':
        return props.theme.colors.courseAvailable
      case 'locked':
        return props.theme.colors.courseLocked
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

  background: ${(props) => (props.variant === 'primary' ? props.theme.colors.primary : props.theme.colors.secondary)};
  color: white;

  &:hover {
    background: ${(props) =>
      props.variant === 'primary' ? props.theme.colors.primaryHover : props.theme.colors.textMuted};
    transform: translateY(-1px);
  }

  &:disabled {
    background: ${(props) => props.theme.colors.textMuted};
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    padding: 0.8rem 1rem;
    margin-right: 0.3rem;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;

    &:hover {
      transform: none;
    }

    &:active {
      transform: scale(0.98);
    }
  }

  @media (max-width: 480px) {
    width: 100%;
    margin-right: 0;
    margin-bottom: 0.5rem;
  }
`

const Section = styled.div`
  margin-bottom: 1.5rem;
  margin-top: 1.5rem;
`

const SectionTitle = styled.h3`
  color: ${(props) => props.theme.colors.headerText};
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
  background: ${(props) => (props.satisfied ? `${props.theme.colors.success}20` : `${props.theme.colors.error}20`)};
  color: ${(props) => (props.satisfied ? props.theme.colors.success : props.theme.colors.error)};
  border-left: 3px solid ${(props) => (props.satisfied ? props.theme.colors.success : props.theme.colors.error)};
`

const DepartmentChoiceItem = styled.div<{ satisfied: boolean }>`
  padding: 0.8rem;
  border-radius: 4px;
  font-size: 0.9rem;
  background: ${(props) => (props.satisfied ? `${props.theme.colors.success}20` : `${props.theme.colors.warning}20`)};
  color: ${(props) => (props.satisfied ? props.theme.colors.success : props.theme.colors.warning)};
  border-left: 3px solid ${(props) => (props.satisfied ? props.theme.colors.success : props.theme.colors.warning)};
  position: relative;
`

const DepartmentChoiceHeader = styled.div`
  font-weight: 600;
  margin-bottom: 0.5rem;
`

const DepartmentChoiceProgress = styled.div<{ satisfied: boolean }>`
  font-size: 0.8rem;
  opacity: 0.8;
  margin-bottom: 0.3rem;
`

const DepartmentList = styled.div`
  font-size: 0.8rem;
  opacity: 0.9;
  margin-top: 0.3rem;
`

const ProgressBar = styled.div<{ percentage: number; satisfied: boolean }>`
  width: 100%;
  height: 4px;
  background: ${(props) => props.theme.colors.border};
  border-radius: 2px;
  margin-top: 0.5rem;
  overflow: hidden;

  &::after {
    content: '';
    display: block;
    width: ${(props) => props.percentage}%;
    height: 100%;
    background: ${(props) => (props.satisfied ? props.theme.colors.success : props.theme.colors.warning)};
    border-radius: 2px;
    transition: width 0.3s ease;
  }
`

const UnlockedCoursesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`

const UnlockedCourseItem = styled.div`
  padding: 0.4rem;
  background: ${(props) => `${props.theme.colors.primary}20`};
  border-radius: 4px;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.primary};
`

const ClickableCourseCode = styled.span`
  color: ${(props) => props.theme.colors.primary};
  cursor: pointer;
  text-decoration: underline;
  font-weight: 600;

  &:hover {
    color: ${(props) => props.theme.colors.primaryHover};
    text-decoration: none;
  }
`

const ClickableUnlockedCourse = styled.div`
  padding: 0.4rem;
  background: ${(props) => `${props.theme.colors.primary}20`};
  border-radius: 4px;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.primary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => `${props.theme.colors.primary}30`};
    transform: translateX(2px);
  }
`

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
`

const InfoItem = styled.div`
  background: ${(props) => props.theme.colors.infoBackground};
  padding: 0.8rem;
  border-radius: 4px;
`

const InfoLabel = styled.div`
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.textMuted};
  font-weight: 500;
  margin-bottom: 0.2rem;
`

const InfoValue = styled.div`
  font-weight: 600;
  color: ${(props) => props.theme.colors.headerText};
`

const DescriptionText = styled.div`
  color: ${(props) => props.theme.colors.bodyText};
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
  onCourseSelect?: (course: Course) => void
}

export const CourseDetails: React.FC<CourseDetailsProps> = ({
  course,
  userProgress,
  eligibilityEngine,
  onCourseToggle,
  onCourseStatusChange,
  onCourseSelect
}) => {
  const t = useT()

  // Track course details view when course changes
  useEffect(() => {
    if (course) {
      trackCourseDetailsView(course.code, course.name, 'course_details_panel')
    }
  }, [course])

  if (!course) {
    return (
      <DetailsContainer>
        <EmptyState>{t.courseDetails.selectCourse}</EmptyState>
      </DetailsContainer>
    )
  }

  const getStatus = (): 'completed' | 'available' | 'locked' | 'in_progress' | 'waiting_grade' => {
    if (course.completed) {
      return 'completed'
    }
    if (userProgress.waitingGradeCourses.has(course.code)) {
      return 'waiting_grade'
    }
    if (userProgress.inProgressCourses.has(course.code)) {
      return 'in_progress'
    }
    if (course.available) {
      return 'available'
    }
    return 'locked'
  }

  const getStatusText = (): string => {
    const status = getStatus()
    switch (status) {
      case 'completed':
        return t.courseStatus.completed
      case 'waiting_grade':
        return t.courseStatus.waitingGrade
      case 'in_progress':
        return t.courseStatus.inProgress
      case 'available':
        return t.courseStatus.available
      case 'locked':
        return t.courseStatus.prerequisitesRequired
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
            type: 'course',
            courseCode: prereq.code
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
            type: 'alternative_group',
            courseCodes: alternativeTexts
          }
        } else if (prereq.type === 'department_choice') {
          // Handle department choice requirements (like Navy Counselor courses)
          const eligibility = eligibilityEngine.checkCourseEligibility(course.code, userProgress)
          const deptMissing = eligibility.missingPrerequisites.find((mp) => mp.type === 'department_choice')

          let satisfied = true
          let progress = prereq.minimum
          let progressText = ''

          if (deptMissing) {
            satisfied = false
            progress = deptMissing.progress || 0
            progressText = ` (${progress}/${deptMissing.total || prereq.minimum})`
          } else {
            // Course is satisfied, use minimum as progress since it's met
            progress = prereq.minimum
            progressText = ` (${progress}/${prereq.minimum})`
          }

          const departmentList = prereq.departments?.join(', ') || 'various departments'
          const text = `${prereq.minimum} ${prereq.level} level courses from: ${departmentList}${progressText}`

          return {
            text,
            satisfied,
            type: 'department_choice',
            progress,
            total: prereq.minimum
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

  const handleCourseClick = (courseCode: string) => {
    if (!onCourseSelect || !eligibilityEngine) {
      return
    }

    const targetCourse = eligibilityEngine.getCourseByCode(courseCode)
    if (targetCourse) {
      onCourseSelect(targetCourse)
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

      <ActionButton variant="primary" onClick={handleToggleClick} disabled={status === 'locked'}>
        {course.completed ? t.courseActions.markIncomplete : t.courseActions.markComplete}
      </ActionButton>

      {onCourseStatusChange && status !== 'locked' && (
        <>
          {status !== 'in_progress' && (
            <ActionButton variant="secondary" onClick={() => onCourseStatusChange(course.code, 'in_progress')}>
              {t.courseActions.workingOn}
            </ActionButton>
          )}
          {status !== 'waiting_grade' && (
            <ActionButton variant="secondary" onClick={() => onCourseStatusChange(course.code, 'waiting_grade')}>
              {t.courseActions.waitingGrade}
            </ActionButton>
          )}
          {(status === 'in_progress' || status === 'waiting_grade') && (
            <ActionButton variant="secondary" onClick={() => onCourseStatusChange(course.code, 'available')}>
              {t.courseActions.resetToAvailable}
            </ActionButton>
          )}
        </>
      )}

      {prerequisites.length > 0 && (
        <Section>
          <SectionTitle>{t.courseDetails.prerequisites}</SectionTitle>
          <PrerequisitesList>
            {prerequisites.map((prereq, index) => {
              if (prereq?.type === 'department_choice') {
                const progress = prereq.progress || 0
                const total = prereq.total || 1
                const percentage = total > 0 ? (progress / total) * 100 : 0

                return (
                  <DepartmentChoiceItem
                    key={`dept-choice-${prereq.text || index}`}
                    satisfied={prereq.satisfied || false}
                  >
                    <DepartmentChoiceHeader>
                      {prereq.satisfied ? '✓' : '○'} Department Choice Requirement
                    </DepartmentChoiceHeader>
                    <DepartmentChoiceProgress satisfied={prereq.satisfied || false}>
                      Progress: {progress}/{total} courses completed
                    </DepartmentChoiceProgress>
                    <DepartmentList>{prereq.text}</DepartmentList>
                    <ProgressBar percentage={percentage} satisfied={prereq.satisfied || false} />
                  </DepartmentChoiceItem>
                )
              }

              if (prereq?.type === 'course' && prereq.courseCode && onCourseSelect) {
                const courseCode = prereq.courseCode
                return (
                  <PrerequisiteItem key={`course-${courseCode}`} satisfied={prereq.satisfied || false}>
                    Course:{' '}
                    <ClickableCourseCode onClick={() => courseCode && handleCourseClick(courseCode)}>
                      {courseCode}
                    </ClickableCourseCode>
                  </PrerequisiteItem>
                )
              }

              if (prereq?.type === 'alternative_group' && prereq.courseCodes && onCourseSelect) {
                return (
                  <PrerequisiteItem
                    key={`alt-group-${prereq.courseCodes.join('-')}`}
                    satisfied={prereq.satisfied || false}
                  >
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
                <PrerequisiteItem key={`prereq-${prereq?.text || index}`} satisfied={prereq?.satisfied || false}>
                  {prereq?.text}
                </PrerequisiteItem>
              )
            })}
          </PrerequisitesList>
        </Section>
      )}

      {unlockedCourses.length > 0 && (
        <Section>
          <SectionTitle>{t.courseDetails.unlocksCourses}</SectionTitle>
          <UnlockedCoursesList>
            {unlockedCourses.map((unlockedCourse) =>
              onCourseSelect ? (
                <ClickableUnlockedCourse key={unlockedCourse.id} onClick={() => handleCourseClick(unlockedCourse.code)}>
                  <strong>{unlockedCourse.code}</strong> - {unlockedCourse.name}
                </ClickableUnlockedCourse>
              ) : (
                <UnlockedCourseItem key={unlockedCourse.id}>
                  <strong>{unlockedCourse.code}</strong> - {unlockedCourse.name}
                </UnlockedCourseItem>
              )
            )}
          </UnlockedCoursesList>
        </Section>
      )}

      {course.description && (
        <Section>
          <SectionTitle>{t.courseDetails.description}</SectionTitle>
          <DescriptionText>{course.description}</DescriptionText>
        </Section>
      )}
    </DetailsContainer>
  )
}
