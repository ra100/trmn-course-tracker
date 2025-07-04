import { css, cva } from 'styled-system/css'

// Main container and layout
export const panelContainer = css({
  padding: '1.5rem',
  borderBottom: '1px solid',
  borderColor: 'border.default',
  overscrollBehavior: 'contain',
  '@media (max-width: 768px)': {
    padding: '1rem'
  }
})

export const panelTitle = css({
  color: 'fg.default',
  margin: '0 0 1rem 0',
  fontSize: '1.1rem'
})

export const flexContainer = css({
  display: 'flex',
  flexDirection: 'column',
  flex: 1
})

// Progress bars and visual indicators
export const progressBar = css({
  backgroundColor: 'gray.200',
  borderRadius: '8px',
  height: '12px',
  margin: '0.75rem 0',
  overflow: 'hidden',
  border: '1px solid',
  borderColor: 'gray.300',
  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
})

export const progressFill = cva({
  base: {
    height: '100%',
    transition: 'width 0.3s ease',
    borderRadius: '7px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
  },
  variants: {
    color: {
      primary: {
        bgGradient: 'to-r',
        gradientFrom: 'accent.default',
        gradientTo: 'accent.emphasized'
      },
      success: {
        bgGradient: 'to-r',
        gradientFrom: 'green.9',
        gradientTo: 'green.11'
      },
      warning: {
        bgGradient: 'to-r',
        gradientFrom: 'amber.9',
        gradientTo: 'amber.11'
      },
      error: {
        bgGradient: 'to-r',
        gradientFrom: 'red.9',
        gradientTo: 'red.11'
      }
    }
  },
  defaultVariants: {
    color: 'primary'
  }
})

export const progressLabel = css({
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.8rem',
  color: 'fg.muted',
  marginBottom: '0.2rem'
})

// Section and subsection components
export const sectionProgress = css({
  marginBottom: '1rem'
})

export const sectionTitle = css({
  fontSize: '0.9rem',
  color: 'fg.default',
  fontWeight: '500',
  marginBottom: '0.5rem'
})

// Status indicators
export const statusIcon = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    flexShrink: 0,
    marginRight: '0.5rem',
    border: '2px solid'
  },
  variants: {
    completed: {
      true: {
        backgroundColor: 'green.9',
        color: 'white',
        borderColor: 'green.6'
      },
      false: {
        backgroundColor: 'gray.300',
        color: 'gray.700',
        borderColor: 'gray.400'
      }
    }
  }
})

export const requirementText = cva({
  base: {
    textDecoration: 'none',
    fontSize: '0.9rem',
    lineHeight: 1.4
  },
  variants: {
    completed: {
      true: {
        color: 'black',
        fontWeight: '500'
      },
      false: {
        color: 'black',
        fontWeight: '400'
      }
    }
  }
})

export const departmentInfo = css({
  fontSize: '0.75rem',
  color: 'gray.600',
  marginTop: '0.3rem',
  fontStyle: 'italic'
})

// Legacy exports for backward compatibility (will be removed after full migration)
export const PanelContainer = panelContainer
export const PanelTitle = panelTitle
export const FlexContainer = flexContainer
export const ProgressBar = progressBar
export const ProgressFill = progressFill
export const ProgressLabel = progressLabel
export const SectionProgress = sectionProgress
export const SectionTitle = sectionTitle
export const StatusIcon = statusIcon
export const RequirementText = requirementText
export const DepartmentInfo = departmentInfo
