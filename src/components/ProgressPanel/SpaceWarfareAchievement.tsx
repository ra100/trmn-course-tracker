import React, { useState, useCallback } from 'react'
import { css, cva } from 'styled-system/css'
import { useT } from '../../i18n'
import { flexContainer, statusIcon, requirementText, departmentInfo } from './ProgressPanel.styles'
import { achievementItem } from './BasicAchievements'

const spaceWarfareHeader = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'spacing.2',
  cursor: 'pointer'
})

const pinIcon = css({
  width: '2rem',
  height: '2rem',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #FFD700 60%, #FFB300 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.2rem',
  color: '#7c4700',
  fontWeight: 'bold',
  boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
  border: 'none',
  flexShrink: 0
})

const expandIcon = cva({
  base: {
    marginLeft: 'auto',
    fontSize: 'fontSizes.xs',
    transition: 'transform 0.3s ease'
  },
  variants: {
    expanded: {
      true: { transform: 'rotate(180deg)' },
      false: { transform: 'rotate(0deg)' }
    }
  }
})

const spaceWarfareDetails = cva({
  base: {
    overflow: 'hidden',
    transition: 'all 0.3s ease'
  },
  variants: {
    expanded: {
      true: {
        maxHeight: '1000px',
        opacity: '1',
        marginTop: 'spacing.4',
        paddingBottom: 'spacing.2'
      },
      false: {
        maxHeight: '0',
        opacity: '0',
        marginTop: '0',
        paddingBottom: '0'
      }
    }
  }
})

const pinSection = css({
  marginBottom: '1.5rem',
  padding: '1rem',
  border: '2px solid',
  borderColor: 'border.default',
  borderRadius: '8px',
  background: 'bg.surface',
  color: 'fg.default',
  boxShadow: 'none',
  '&:last-child': {
    marginBottom: '1.5rem'
  }
})

const pinTitle = css({
  fontSize: '1rem',
  fontWeight: '600',
  marginBottom: '0.25rem',
  color: 'fg.default',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  letterSpacing: '0.03em',
  textShadow: 'none'
})

const pinBadge = cva({
  base: {
    padding: '0.13rem 0.8rem',
    borderRadius: '999px',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 'auto',
    letterSpacing: '0.03em',
    boxShadow: '0 1px 2px rgba(0,0,0,0.10)'
  },
  variants: {
    earned: {
      true: {
        background: '#16a34a',
        color: 'white'
      },
      false: {
        background: '#64748b',
        color: 'white'
      }
    }
  }
})

const requirementsList = css({
  fontSize: '0.98rem',
  marginBottom: '0.7rem',
  marginTop: '0.5rem'
})

const requirementItem = cva({
  base: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    marginBottom: '0.5rem',
    padding: '0.5rem 0.8rem',
    borderRadius: '6px',
    fontWeight: 'normal',
    fontSize: '0.98rem',
    boxShadow: '0 0.5px 2px rgba(0,0,0,0.06)',
    '&:last-child': {
      marginBottom: '0'
    }
  },
  variants: {
    completed: {
      true: {
        background: 'linear-gradient(90deg, #bbf7d0 60%, #f0fdf4 100%)',
        borderLeft: '4px solid #16a34a',
        color: '#14532d',
        fontWeight: 'bold'
      },
      false: {
        background: 'linear-gradient(90deg, #f3f4f6 60%, #e5e7eb 100%)',
        borderLeft: '4px solid #64748b',
        color: '#334155',
        fontWeight: 'normal'
      }
    }
  }
})

const progressBarContainer = css({
  marginTop: '0.5rem',
  height: '0.7rem',
  background: '#1e293b',
  borderRadius: '5px',
  overflow: 'hidden',
  border: '1px solid #334155'
})

const progressBarFill = cva({
  base: {
    height: '100%',
    transition: 'width 0.3s ease',
    borderRadius: '5px'
  },
  variants: {
    earned: {
      true: {
        background: '#16a34a'
      },
      false: {
        background: '#64748b'
      }
    }
  }
})

const progressText = css({
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.98rem',
  marginTop: '0.18rem',
  color: '#22c55e',
  fontWeight: 'bold'
})

const achievementDescription = css({
  fontSize: 'fontSizes.sm',
  marginTop: 'spacing.2',
  color: 'rgba(255, 255, 255, 0.95)',
  fontWeight: 'fontWeights.normal',
  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
})

interface PinRequirement {
  id: string
  name: string
  courseCode?: string
  type: 'course' | 'department_choice'
  completed: boolean
  level?: string
  departments?: string[]
  minimum?: number
  satisfied?: number
  description?: string
}

interface PinProgress {
  name: string
  type: 'OSWP' | 'ESWP'
  earned: boolean
  requirements: PinRequirement[]
  overallProgress: number
}

interface SpaceWarfareAchievementProps {
  oswpProgress: PinProgress
  eswpProgress: PinProgress
}

/**
 * SpaceWarfareAchievement displays the complex space warfare pin achievement
 * with expandable details showing OSWP and ESWP requirements
 */
export const SpaceWarfareAchievement: React.FC<SpaceWarfareAchievementProps> = ({ oswpProgress, eswpProgress }) => {
  const t = useT()
  const [expanded, setExpanded] = useState(false)

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev)
  }, [])

  const renderSpaceWarfareRequirement = useCallback((req: PinRequirement) => {
    if (req.type === 'course') {
      return (
        <div key={req.id} className={requirementItem({ completed: req.completed })}>
          <div className={statusIcon({ completed: req.completed })}>{req.completed ? '✓' : '○'}</div>
          <div className={requirementText({ completed: req.completed })}>
            {req.name} ({req.courseCode})
          </div>
        </div>
      )
    } else if (req.type === 'department_choice') {
      const displayText = req.name.startsWith('Department Choice')
        ? req.name
        : `Department Choice - ${req.description || req.name}`

      return (
        <div key={req.id} className={requirementItem({ completed: req.completed })}>
          <div className={statusIcon({ completed: req.completed })}>{req.completed ? '✓' : '○'}</div>
          <div className={flexContainer}>
            <div className={requirementText({ completed: req.completed })}>{displayText}</div>
            {req.departments && req.departments.length > 0 && (
              <div className={departmentInfo}>
                Departments: {req.departments.join(', ')} | Level: {req.level} | Progress: {req.satisfied || 0}/
                {req.minimum || 0}
              </div>
            )}
          </div>
        </div>
      )
    }

    return null
  }, [])

  const renderPinDetails = useCallback(
    (pinProgress: PinProgress) => {
      return (
        <div className={pinSection}>
          <h4 className={pinTitle}>
            <div className={pinIcon}>🏅</div>
            {pinProgress.name}
            <div className={pinBadge({ earned: pinProgress.earned })}>
              {pinProgress.earned ? t.spaceWarfare.eligible : t.spaceWarfare.notEligible}
            </div>
          </h4>

          <div className={requirementsList}>
            {pinProgress.requirements.map((req) => renderSpaceWarfareRequirement(req))}
          </div>

          <div className={progressBarContainer}>
            <div
              className={progressBarFill({ earned: pinProgress.earned })}
              style={{ width: `${pinProgress.overallProgress}%` }}
            />
          </div>
          <div className={progressText}>
            <span>{t.spaceWarfare.progress}</span>
            <span>{pinProgress.overallProgress.toFixed(1)}%</span>
          </div>
        </div>
      )
    },
    [renderSpaceWarfareRequirement, t.spaceWarfare.eligible, t.spaceWarfare.notEligible, t.spaceWarfare.progress]
  )

  const isEligible = oswpProgress.earned || eswpProgress.earned

  return (
    <div className={achievementItem({ completed: isEligible })} style={{ marginBottom: '0.5em' }}>
      <div className={spaceWarfareHeader} onClick={toggleExpanded}>
        <strong>{t.spaceWarfare.title}</strong>
        <div className={expandIcon({ expanded })}>{expanded ? '▲' : '▼'}</div>
      </div>
      <div className={achievementDescription}>{t.spaceWarfare.requirements}</div>
      {expanded && (
        <div className={spaceWarfareDetails({ expanded })}>
          {renderPinDetails(oswpProgress)}
          {renderPinDetails(eswpProgress)}
        </div>
      )}
    </div>
  )
}
