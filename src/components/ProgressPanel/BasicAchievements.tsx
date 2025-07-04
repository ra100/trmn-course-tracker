import React from 'react'
import { achievementItem, achievementTitle, achievementsList, achievementDescription } from './BasicAchievements.styles'

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
