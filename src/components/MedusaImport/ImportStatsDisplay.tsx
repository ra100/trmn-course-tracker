import React from 'react'
import { ImportStats } from './MedusaImport.styles'
import { ImportStatsDisplayProps } from './types'

export const ImportStatsDisplay: React.FC<ImportStatsDisplayProps> = React.memo(({ stats }) => (
  <ImportStats>
    • {stats.trackable} courses are trackable in TRMN system
    <br />• {stats.trackable - stats.alreadyCompleted} new courses added
    <br />• {stats.alreadyCompleted} courses were already completed
    <br />• {stats.imported - stats.trackable} courses from Medusa are not tracked by this app
  </ImportStats>
))

ImportStatsDisplay.displayName = 'ImportStatsDisplay'
