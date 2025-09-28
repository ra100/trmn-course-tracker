import React from 'react'
import { ParsedCourseData, UserProgress } from '../types'
import { EligibilityEngine } from '../utils/eligibilityEngine'
import { useT } from '../i18n'
import {
  StatisticsPanel,
  SectionProgressList,
  BasicAchievements,
  SpaceWarfareAchievement,
  panelContainer,
  panelTitle
} from './ProgressPanel/index'
import { useProgressPanelData } from '../hooks/useProgressPanelData'

interface ProgressPanelProps {
  userProgress: UserProgress
  courseData: ParsedCourseData
  eligibilityEngine: EligibilityEngine
}

/**
 * ProgressPanel displays comprehensive user progress including statistics,
 * section progress, level progress, and achievements including space warfare pins
 */
const ProgressPanelComponent: React.FC<ProgressPanelProps> = ({ userProgress, courseData, eligibilityEngine }) => {
  const t = useT()
  const { overallStats, sectionProgress, levelProgress, achievements, oswpProgress, eswpProgress } =
    useProgressPanelData({ userProgress, courseData, eligibilityEngine, t })

  return (
    <div className={panelContainer} data-testid="progress-panel">
      <h2 className={panelTitle}>{t.progress.title}</h2>

      <StatisticsPanel stats={overallStats} userProgress={userProgress} />

      <SectionProgressList sectionProgress={sectionProgress} levelProgress={levelProgress} />

      <h3 className={panelTitle}>{t.progress.achievements}</h3>

      <SpaceWarfareAchievement oswpProgress={oswpProgress} eswpProgress={eswpProgress} />

      <BasicAchievements achievements={achievements} maxDisplay={15} />
    </div>
  )
}

export const ProgressPanel = React.memo(ProgressPanelComponent)
