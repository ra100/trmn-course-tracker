import React from 'react'
import { section, sectionTitle, jsonPre } from './DebugPanel.styles'
import { ParseSummarySectionProps } from './types'

export const ParseSummarySection: React.FC<ParseSummarySectionProps> = React.memo(({ debugData }) => (
  <div className={section}>
    <h4 className={sectionTitle}>Parse Summary</h4>
    <pre className={jsonPre}>{JSON.stringify(debugData, null, 2)}</pre>
  </div>
))

ParseSummarySection.displayName = 'ParseSummarySection'
