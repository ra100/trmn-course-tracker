import React from 'react'
import { Section, SectionTitle, JsonPre } from './DebugPanel.styles'
import { ParseSummarySectionProps } from './types'

export const ParseSummarySection: React.FC<ParseSummarySectionProps> = React.memo(({ debugData }) => (
  <Section>
    <SectionTitle>Parse Summary</SectionTitle>
    <JsonPre>{JSON.stringify(debugData, null, 2)}</JsonPre>
  </Section>
))

ParseSummarySection.displayName = 'ParseSummarySection'
