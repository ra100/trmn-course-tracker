import styled from 'styled-components'

export const DetailsContainer = styled.div`
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

export const EmptyState = styled.div`
  text-align: center;
  color: #7f8c8d;
  padding: 2rem;
  font-style: italic;
`

export const CourseHeader = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${(props) => props.theme.colors.borderLight};
`

export const CourseTitle = styled.h2`
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

export const CourseCode = styled.div`
  font-family: 'Courier New', monospace;
  color: ${(props) => props.theme.colors.code};
  font-size: 1rem;
  margin-bottom: 0.5rem;
`

export const CourseSection = styled.div`
  color: ${(props) => props.theme.colors.primary};
  font-weight: 500;
  font-size: 0.9rem;
`

export const StatusBadge = styled.div<{
  status: 'completed' | 'available' | 'locked' | 'in_progress' | 'waiting_grade'
}>`
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

export const ActionButton = styled.button<{ variant: 'primary' | 'secondary' }>`
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

export const Section = styled.div`
  margin-bottom: 1.5rem;
  margin-top: 1.5rem;
`

export const SectionTitle = styled.h3`
  color: ${(props) => props.theme.colors.headerText};
  margin: 0 0 0.8rem 0;
  font-size: 1rem;
  font-weight: 600;
`

export const PrerequisitesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

export const PrerequisiteItem = styled.div<{ $satisfied: boolean }>`
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  background: ${(props) => (props.$satisfied ? `${props.theme.colors.success}20` : `${props.theme.colors.error}20`)};
  color: ${(props) => (props.$satisfied ? props.theme.colors.success : props.theme.colors.error)};
  border-left: 3px solid ${(props) => (props.$satisfied ? props.theme.colors.success : props.theme.colors.error)};
`

export const DepartmentChoiceItem = styled.div<{ $satisfied: boolean }>`
  padding: 0.8rem;
  border-radius: 4px;
  font-size: 0.9rem;
  background: ${(props) => (props.$satisfied ? `${props.theme.colors.success}20` : `${props.theme.colors.warning}20`)};
  color: ${(props) => (props.$satisfied ? props.theme.colors.success : props.theme.colors.warning)};
  border-left: 3px solid ${(props) => (props.$satisfied ? props.theme.colors.success : props.theme.colors.warning)};
  position: relative;
`

export const DepartmentChoiceHeader = styled.div`
  font-weight: 600;
  margin-bottom: 0.5rem;
`

export const DepartmentChoiceProgress = styled.div<{ $satisfied: boolean }>`
  font-size: 0.8rem;
  opacity: 0.8;
  margin-bottom: 0.3rem;
`

export const DepartmentList = styled.div`
  font-size: 0.8rem;
  opacity: 0.9;
  margin-top: 0.3rem;
`

export const ProgressBar = styled.div<{ $percentage: number; $satisfied: boolean }>`
  width: 100%;
  height: 4px;
  background: ${(props) => props.theme.colors.border};
  border-radius: 2px;
  margin-top: 0.5rem;
  overflow: hidden;

  &::after {
    content: '';
    display: block;
    width: ${(props) => props.$percentage}%;
    height: 100%;
    background: ${(props) => (props.$satisfied ? props.theme.colors.success : props.theme.colors.warning)};
    border-radius: 2px;
    transition: width 0.3s ease;
  }
`

export const UnlockedCoursesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`

export const UnlockedCourseItem = styled.div`
  padding: 0.4rem;
  background: ${(props) => `${props.theme.colors.primary}20`};
  border-radius: 4px;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.primary};
`

export const ClickableCourseCode = styled.span`
  color: ${(props) => props.theme.colors.primary};
  cursor: pointer;
  text-decoration: underline;
  font-weight: 600;

  &:hover {
    color: ${(props) => props.theme.colors.primaryHover};
    text-decoration: none;
  }
`

export const ClickableUnlockedCourse = styled.div`
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

export const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
`

export const InfoItem = styled.div`
  background: ${(props) => props.theme.colors.infoBackground};
  padding: 0.8rem;
  border-radius: 4px;
`

export const InfoLabel = styled.div`
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.textMuted};
  font-weight: 500;
  margin-bottom: 0.2rem;
`

export const InfoValue = styled.div`
  font-weight: 600;
  color: ${(props) => props.theme.colors.headerText};
`

export const DescriptionText = styled.div`
  color: ${(props) => props.theme.colors.bodyText};
  line-height: 1.5;
`
