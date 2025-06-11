import React from 'react'
import { GroupingControlsProps } from './types'
import { GroupingToggle, GroupingLabel, GroupingButton } from './SkillTreeView.styles'

export const GroupingControls: React.FC<GroupingControlsProps> = React.memo(
  ({ groupingMode, onGroupingModeChange }) => {
    return (
      <GroupingToggle role="group" aria-label="Course grouping options">
        <GroupingLabel id="grouping-label">Group by:</GroupingLabel>
        <GroupingButton
          $active={groupingMode === 'section'}
          onClick={() => onGroupingModeChange('section')}
          aria-pressed={groupingMode === 'section'}
          aria-describedby="grouping-label"
        >
          Section
        </GroupingButton>
        <GroupingButton
          $active={groupingMode === 'department'}
          onClick={() => onGroupingModeChange('department')}
          aria-pressed={groupingMode === 'department'}
          aria-describedby="grouping-label"
        >
          Department
        </GroupingButton>
        <GroupingButton
          $active={groupingMode === 'series'}
          onClick={() => onGroupingModeChange('series')}
          aria-pressed={groupingMode === 'series'}
          aria-describedby="grouping-label"
        >
          Series
        </GroupingButton>
      </GroupingToggle>
    )
  }
)

GroupingControls.displayName = 'GroupingControls'
