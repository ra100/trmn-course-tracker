import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import { useT } from '../../i18n'
import { FlexContainer, StatusIcon, RequirementText, DepartmentInfo } from './ProgressPanel.styles'

// Space Warfare specific styled components
const SpaceWarfareContainer = styled.div<{ $earned: boolean }>`
  padding: 0.7rem;
  background: ${(props) => (props.$earned ? props.theme.colors.success : props.theme.colors.surface)};
  border-radius: 4px;
  font-size: 0.85rem;
  color: ${(props) => (props.$earned ? 'white' : props.theme.colors.textSecondary)};
  border-left: 3px solid ${(props) => (props.$earned ? props.theme.colors.success : props.theme.colors.secondary)};
  border: 1px solid ${(props) => props.theme.colors.border};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.$earned ? props.theme.colors.success : `${props.theme.colors.border}40`)};
  }
`

const SpaceWarfareHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`

const PinIcon = styled.div`
  width: 20px;
  height: 20px;
  background: gold;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: #000;
  font-weight: bold;
  flex-shrink: 0;
`

const ExpandIcon = styled.div<{ $expanded: boolean }>`
  margin-left: auto;
  font-size: 0.8rem;
  transform: rotate(${(props) => (props.$expanded ? '180deg' : '0deg')});
  transition: transform 0.3s ease;
`

const SpaceWarfareDetails = styled.div<{ $expanded: boolean }>`
  max-height: ${(props) => (props.$expanded ? '500px' : '0')};
  opacity: ${(props) => (props.$expanded ? '1' : '0')};
  overflow: hidden;
  transition: all 0.3s ease;
  margin-top: ${(props) => (props.$expanded ? '0.5rem' : '0')};
`

const PinSection = styled.div`
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  background: ${(props) => props.theme.colors.background};

  &:last-child {
    margin-bottom: 0;
  }
`

const PinTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const PinBadge = styled.div<{ $earned: boolean }>`
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: bold;
  background: ${(props) => (props.$earned ? props.theme.colors.success : props.theme.colors.secondary)};
  color: white;
  margin-left: auto;
`

const RequirementsList = styled.div`
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.textSecondary};
`

const RequirementItem = styled.div<{ $completed: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.3rem;
  margin-bottom: 0.2rem;
  padding: 0.2rem;
  border-radius: 3px;
  background: ${(props) => (props.$completed ? `${props.theme.colors.success}20` : 'transparent')};

  &:last-child {
    margin-bottom: 0;
  }
`

const ProgressBarContainer = styled.div`
  margin-top: 0.5rem;
  height: 6px;
  background: ${(props) => props.theme.colors.surface};
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid ${(props) => props.theme.colors.border};
`

const ProgressBarFill = styled.div<{ progress: number }>`
  height: 100%;
  background: linear-gradient(
    90deg,
    ${(props) => props.theme.colors.primary},
    ${(props) => props.theme.colors.success}
  );
  width: ${(props) => props.progress}%;
  transition: width 0.3s ease;
`

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  margin-top: 0.2rem;
  color: ${(props) => props.theme.colors.textSecondary};
`

const AchievementDescription = styled.div`
  font-size: 0.8rem;
  margin-top: 0.2rem;
`

interface PinRequirement {
  id: string
  name: string
  courseCode?: string
  type: 'course' | 'department_choice'
  completed: boolean
  level?: string
  departments?: string[]
  minimum?: number
  satisfied?: number
  description?: string
}

interface PinProgress {
  name: string
  type: 'OSWP' | 'ESWP'
  earned: boolean
  requirements: PinRequirement[]
  overallProgress: number
}

interface SpaceWarfareAchievementProps {
  oswpProgress: PinProgress
  eswpProgress: PinProgress
  combinedEarned: boolean
}

/**
 * SpaceWarfareAchievement displays the complex space warfare pin achievement
 * with expandable details showing OSWP and ESWP requirements
 */
export const SpaceWarfareAchievement: React.FC<SpaceWarfareAchievementProps> = ({
  oswpProgress,
  eswpProgress,
  combinedEarned
}) => {
  const t = useT()
  const [expanded, setExpanded] = useState(false)

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev)
  }, [])

  const renderSpaceWarfareRequirement = useCallback((req: PinRequirement) => {
    if (req.type === 'course') {
      return (
        <RequirementItem key={req.id} $completed={req.completed}>
          <StatusIcon $completed={req.completed}>{req.completed ? '✓' : '○'}</StatusIcon>
          <RequirementText $completed={req.completed}>
            {req.name} ({req.courseCode})
          </RequirementText>
        </RequirementItem>
      )
    } else if (req.type === 'department_choice') {
      const displayText = req.name.startsWith('Department Choice')
        ? req.name
        : `Department Choice - ${req.description || req.name}`

      return (
        <RequirementItem key={req.id} $completed={req.completed}>
          <StatusIcon $completed={req.completed}>{req.completed ? '✓' : `${req.satisfied}/${req.minimum}`}</StatusIcon>
          <FlexContainer>
            <RequirementText $completed={req.completed}>
              {displayText} - Progress: {req.satisfied}/{req.minimum} departments
            </RequirementText>
            {req.departments && req.departments.length > 0 && (
              <DepartmentInfo>Available: {req.departments.join(', ')}</DepartmentInfo>
            )}
          </FlexContainer>
        </RequirementItem>
      )
    }
    return null
  }, [])

  const renderPinSection = useCallback(
    (progress: PinProgress) => (
      <PinSection key={progress.type}>
        <PinTitle>
          <PinIcon>★</PinIcon>
          {progress.name}
          <PinBadge $earned={progress.earned}>
            {progress.earned ? t.spaceWarfare.eligible : t.spaceWarfare.progress}
          </PinBadge>
        </PinTitle>
        <RequirementsList>{progress.requirements.map(renderSpaceWarfareRequirement)}</RequirementsList>
        <ProgressBarContainer>
          <ProgressBarFill progress={progress.overallProgress} />
        </ProgressBarContainer>
        <ProgressText>
          <span>{t.spaceWarfare.progress}</span>
          <span>{Math.round(progress.overallProgress)}%</span>
        </ProgressText>
      </PinSection>
    ),
    [t, renderSpaceWarfareRequirement]
  )

  return (
    <SpaceWarfareContainer $earned={combinedEarned} onClick={toggleExpanded}>
      <SpaceWarfareHeader>
        <PinIcon>★</PinIcon>
        <FlexContainer>
          <strong>{t.achievements.spaceWarfarePins.title}</strong>
          <AchievementDescription>{t.achievements.spaceWarfarePins.description}</AchievementDescription>
        </FlexContainer>
        <ExpandIcon $expanded={expanded}>▼</ExpandIcon>
      </SpaceWarfareHeader>
      <SpaceWarfareDetails $expanded={expanded}>
        {renderPinSection(oswpProgress)}
        {renderPinSection(eswpProgress)}
      </SpaceWarfareDetails>
    </SpaceWarfareContainer>
  )
}
