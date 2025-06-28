import React from 'react'
import { useT } from '../../i18n'
import {
  panelTitle,
  sectionProgress as sectionProgressStyle,
  progressLabel,
  sectionTitle,
  progressBar,
  progressFill
} from './ProgressPanel.styles'

interface SectionProgressData {
  section: string
  completed: number
  total: number
  percentage: number
}

interface LevelProgressData {
  level: string
  completed: number
  total: number
  percentage: number
}

interface SectionProgressListProps {
  sectionProgress: SectionProgressData[]
  levelProgress: LevelProgressData[]
}

/**
 * SectionProgressList displays progress bars for different course sections
 * and level categories with completion percentages
 */
export const SectionProgressList: React.FC<SectionProgressListProps> = ({ sectionProgress, levelProgress }) => {
  const t = useT()

  const getLevelColor = (level: string): 'primary' | 'success' | 'warning' | 'error' => {
    switch (level) {
      case 'A':
        return 'error' // Red for advanced
      case 'C':
        return 'warning' // Orange for continuing
      case 'D':
        return 'primary' // Purple/blue for diploma
      case 'W':
        return 'success' // Green for warfare
      default:
        return 'primary' // Blue for default
    }
  }

  return (
    <>
      {/* Section Progress */}
      <h3 className={panelTitle}>{t.progress.sectionProgress}</h3>
      {sectionProgress.slice(0, 5).map((section) => (
        <div key={section.section} className={sectionProgressStyle}>
          <div className={progressLabel}>
            <div className={sectionTitle}>{section.section}</div>
            <span>
              {section.completed}/{section.total}
            </span>
          </div>
          <div className={progressBar}>
            <div className={progressFill({ color: 'primary' })} style={{ width: `${section.percentage}%` }} />
          </div>
        </div>
      ))}

      {/* Level Progress */}
      <h3 className={panelTitle}>{t.progress.levelProgress}</h3>
      {levelProgress.map((level) => (
        <div key={level.level} className={sectionProgressStyle}>
          <div className={progressLabel}>
            <div className={sectionTitle}>
              {t.progress.level} {level.level}
            </div>
            <span>
              {level.completed}/{level.total}
            </span>
          </div>
          <div className={progressBar}>
            <div
              className={progressFill({ color: getLevelColor(level.level) })}
              style={{ width: `${level.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </>
  )
}
