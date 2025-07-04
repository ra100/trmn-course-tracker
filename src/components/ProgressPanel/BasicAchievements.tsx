import React from 'react'
import { css, cva } from 'styled-system/css'

// Achievement-specific styles
const achievementsList = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
})

const achievementItem = cva({
  base: {
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    border: '2px solid',
    transition: 'all 0.2s ease',
    _hover: {
      transform: 'translateY(-1px)',
      boxShadow: 'md'
    }
  },
  variants: {
    completed: {
      true: {
        bgGradient: 'to-br',
        gradientFrom: 'green.9',
        gradientTo: 'green.11',
        color: 'white',
        borderColor: 'green.6',
        boxShadow: 'sm'
      },
      false: {
        background: 'bg.surface',
        color: 'fg.default',
        borderColor: 'border.default',
        _hover: {
          borderColor: 'accent.default'
        }
      }
    }
  }
})

const achievementDescription = css({
  fontSize: '0.85rem',
  marginTop: '0.5rem',
  opacity: 0.9,
  lineHeight: 1.4
})

const achievementTitle = css({
  fontSize: '1rem',
  fontWeight: '600',
  marginBottom: '0.25rem'
})

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
    <div className={achievementsList}>
      {achievements.slice(0, maxDisplay).map((achievement) => (
        <div key={achievement.title} className={achievementItem({ completed: achievement.completed })}>
          <div className={achievementTitle}>{achievement.title}</div>
          <div className={achievementDescription}>{achievement.description}</div>
        </div>
      ))}
    </div>
  )
}

export { achievementItem }
