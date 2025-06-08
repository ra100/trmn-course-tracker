import React from 'react'
import styled from 'styled-components'

// Achievement-specific styled components
const AchievementsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const AchievementItem = styled.div<{ $completed: boolean }>`
  padding: 0.7rem;
  background: ${(props) => (props.$completed ? props.theme.colors.success : props.theme.colors.surface)};
  border-radius: 4px;
  font-size: 0.85rem;
  color: ${(props) => (props.$completed ? 'white' : props.theme.colors.textSecondary)};
  border-left: 3px solid ${(props) => (props.$completed ? props.theme.colors.success : props.theme.colors.secondary)};
  border: 1px solid ${(props) => props.theme.colors.border};
`

const AchievementDescription = styled.div`
  font-size: 0.8rem;
  margin-top: 0.2rem;
`

interface Achievement {
  title: string
  description: string
  completed: boolean
}

interface BasicAchievementsProps {
  achievements: Achievement[]
  maxDisplay?: number
}

/**
 * BasicAchievements displays a list of standard achievements
 * with completion status and descriptions
 */
export const BasicAchievements: React.FC<BasicAchievementsProps> = ({ achievements, maxDisplay = 5 }) => {
  return (
    <AchievementsList>
      {achievements.slice(0, maxDisplay).map((achievement) => (
        <AchievementItem key={achievement.title} $completed={achievement.completed}>
          <strong>{achievement.title}</strong>
          <AchievementDescription>{achievement.description}</AchievementDescription>
        </AchievementItem>
      ))}
    </AchievementsList>
  )
}
