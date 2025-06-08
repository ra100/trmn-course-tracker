import React from 'react'
import { useT } from '../../i18n'
import {
  PanelTitle,
  SectionProgress,
  ProgressLabel,
  SectionTitle,
  ProgressBar,
  ProgressFill
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

  const getLevelColor = (level: string): string => {
    switch (level) {
      case 'A':
        return '#e74c3c' // Red for advanced
      case 'C':
        return '#f39c12' // Orange for continuing
      case 'D':
        return '#9b59b6' // Purple for diploma
      case 'W':
        return '#2ecc71' // Green for warfare
      default:
        return '#3498db' // Blue for default
    }
  }

  return (
    <>
      {/* Section Progress */}
      <PanelTitle>{t.progress.sectionProgress}</PanelTitle>
      {sectionProgress.slice(0, 5).map((section) => (
        <SectionProgress key={section.section}>
          <ProgressLabel>
            <SectionTitle>{section.section}</SectionTitle>
            <span>
              {section.completed}/{section.total}
            </span>
          </ProgressLabel>
          <ProgressBar>
            <ProgressFill percentage={section.percentage} />
          </ProgressBar>
        </SectionProgress>
      ))}

      {/* Level Progress */}
      <PanelTitle>{t.progress.levelProgress}</PanelTitle>
      {levelProgress.map((level) => (
        <SectionProgress key={level.level}>
          <ProgressLabel>
            <SectionTitle>
              {t.progress.level} {level.level}
            </SectionTitle>
            <span>
              {level.completed}/{level.total}
            </span>
          </ProgressLabel>
          <ProgressBar>
            <ProgressFill percentage={level.percentage} color={getLevelColor(level.level)} />
          </ProgressBar>
        </SectionProgress>
      ))}
    </>
  )
}
