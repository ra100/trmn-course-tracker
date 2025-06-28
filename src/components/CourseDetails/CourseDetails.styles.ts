import { css, cva } from 'styled-system/css'

export const detailsContainer = css({
  height: '100%',
  overflowY: 'auto',
  boxSizing: 'border-box'
})

export const emptyState = css({
  textAlign: 'center',
  color: 'fg.muted',
  padding: '8',
  fontStyle: 'italic'
})

export const courseHeader = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
  alignItems: 'flex-start'
})

export const courseTitle = css({
  color: 'fg.default',
  fontSize: { base: 'lg', sm: 'xl', md: '2xl' }
})

export const courseCode = css({
  fontFamily: 'mono',
  color: 'fg.muted',
  fontSize: 'md'
})

export const courseSection = css({
  color: 'trmn.gold',
  fontWeight: 'medium',
  fontSize: 'sm'
})

export const section = css({ margin: '3' })

export const sectionTitle = css({
  color: 'fg.default',
  fontSize: 'xl',
  fontWeight: 'bold',
  letterSpacing: '0.02em',
  textTransform: 'uppercase'
})

export const prerequisitesList = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2'
})

// Create wrapper functions that filter out variant props to prevent DOM attribute warnings
export const prerequisiteItem = (props: { satisfied: boolean }) => {
  return cva({
    base: {
      padding: '2',
      borderRadius: 'radii.md',
      fontSize: 'sm',
      borderLeft: 'borders.none',
      borderLeftWidth: '3px',
      borderLeftStyle: 'solid'
    },
    variants: {
      satisfied: {
        true: {
          bg: 'green.100',
          color: 'green.700',
          borderLeftColor: 'green.500'
        },
        false: {
          bg: 'red.100',
          color: 'red.700',
          borderLeftColor: 'red.500'
        }
      }
    }
  })({ satisfied: props.satisfied })
}

export const departmentChoiceItem = (props: { satisfied: boolean }) => {
  return cva({
    base: {
      borderRadius: 'radii.md',
      fontSize: 'sm',
      borderLeft: 'borders.none',
      borderLeftWidth: '3px',
      borderLeftStyle: 'solid',
      position: 'relative'
    },
    variants: {
      satisfied: {
        true: {
          bg: 'green.100',
          color: 'green.700',
          borderLeftColor: 'green.500'
        },
        false: {
          bg: 'yellow.100',
          color: 'yellow.700',
          borderLeftColor: 'yellow.500'
        }
      }
    }
  })({ satisfied: props.satisfied })
}

export const departmentChoiceHeader = css({
  fontWeight: 'semibold'
})

export const departmentChoiceProgress = (props: { satisfied: boolean }) => {
  return cva({
    base: {
      fontSize: 'xs',
      opacity: 0.8,
      marginBottom: '1'
    },
    variants: {
      satisfied: {
        true: {},
        false: {}
      }
    }
  })({ satisfied: props.satisfied })
}

export const departmentList = css({
  fontSize: 'xs',
  opacity: 0.9
})

export const unlockedCoursesList = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1'
})

export const unlockedCourseItem = css({
  padding: '1',
  bg: 'accent.100',
  borderRadius: 'radii.md',
  fontSize: 'sm',
  color: 'accent.700'
})

export const clickableCourseCode = css({
  color: 'accent.default',
  cursor: 'pointer',
  textDecoration: 'underline',
  fontWeight: 'semibold',
  _hover: {
    color: 'accent.a11y',
    textDecoration: 'none'
  }
})

export const clickableUnlockedCourse = css({
  padding: '1',
  bg: 'accent.100',
  borderRadius: 'radii.md',
  fontSize: 'sm',
  color: 'accent.700',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  _hover: {
    bg: 'accent.200',
    transform: 'translateX(0.5)'
  }
})

export const infoGrid = css({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  background: 'bg.subtle',
  borderRadius: 'radii.md'
})

export const infoItem = css({
  background: 'whiteAlpha.50',
  borderRadius: 'radii.md',
  display: 'flex',
  flexDirection: 'column'
})

export const infoLabel = css({
  fontSize: 'xs',
  color: 'amber.700',
  fontWeight: 'semibold',
  background: 'amber.100',
  borderRadius: 'radii.sm',
  padding: '0.1em 0.5em',
  marginBottom: '0.5',
  letterSpacing: '0.02em',
  alignSelf: 'flex-start'
})

export const infoValue = css({
  fontWeight: 'semibold',
  color: 'fg.default'
})

export const descriptionText = css({
  color: 'fg.default',
  lineHeight: 'lineHeights.relaxed'
})

export const panelCard = css({
  background: 'bg.elevated',
  borderRadius: 'radii.xl',
  boxShadow: 'lg',
  minHeight: '80vh',
  display: 'flex',
  flexDirection: 'column',
  gap: '1',
  maxWidth: '600px',
  marginX: 'auto'
})

export const headerCard = css({
  background: 'bg.subtle',
  borderRadius: 'radii.md',
  padding: '4',
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
  position: 'relative'
})

export const headerDivider = css({})

export const actionGroup = css({
  display: 'flex',
  flexDirection: 'row',
  gap: '1',
  padding: '3',
  flexWrap: 'wrap'
})

export const badgeMargin = css({
  marginY: '3'
})
