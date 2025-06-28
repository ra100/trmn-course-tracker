import React from 'react'
import { GroupingControlsProps } from './types'
import { groupingToggle, groupingLabel } from './SkillTreeView.styles'
import { Button } from '~/components/ui/button'

export const GroupingControls: React.FC<GroupingControlsProps> = React.memo(
  ({ groupingMode, onGroupingModeChange }) => {
    return (
      <div role="group" aria-label="Course grouping options" className={groupingToggle}>
        <span id="grouping-label" className={groupingLabel}>
          Group by:
        </span>
        <Button
          variant={groupingMode === 'section' ? 'solid' : 'outline'}
          size="sm"
          onClick={() => onGroupingModeChange('section')}
          aria-pressed={groupingMode === 'section'}
          aria-describedby="grouping-label"
        >
          Section
        </Button>
        <Button
          variant={groupingMode === 'department' ? 'solid' : 'outline'}
          size="sm"
          onClick={() => onGroupingModeChange('department')}
          aria-pressed={groupingMode === 'department'}
          aria-describedby="grouping-label"
        >
          Department
        </Button>
        <Button
          variant={groupingMode === 'series' ? 'solid' : 'outline'}
          size="sm"
          onClick={() => onGroupingModeChange('series')}
          aria-pressed={groupingMode === 'series'}
          aria-describedby="grouping-label"
        >
          Series
        </Button>
      </div>
    )
  }
)

GroupingControls.displayName = 'GroupingControls'
