import { css, cva } from 'styled-system/css'

export const panelContainer = css({
  padding: { base: '1rem', md: '1.5rem' },
  borderBottom: '1px solid',
  borderColor: 'border.default'
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

export const progressLabel = css({
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.8rem',
  color: 'fg.muted',
  marginBottom: '0.2rem'
})

export const sectionProgress = css({
  marginBottom: '1rem'
})

export const sectionTitle = css({
  fontSize: '0.9rem',
  color: 'fg.default',
  fontWeight: 500,
  marginBottom: '0.5rem'
})

export const statusIcon = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    flexShrink: 0,
    color: 'white',
    marginRight: '0.5rem'
  },
  variants: {
    completed: {
      true: {
        bg: 'green.500'
      },
      false: {
        bg: 'gray.400'
      }
    }
  }
})

export const requirementText = cva({
  base: {},
  variants: {
    completed: {
      true: {
        color: 'fg.default'
      },
      false: {
        color: 'fg.muted'
      }
    }
  }
})

export const departmentInfo = css({
  fontSize: '0.7rem',
  color: 'fg.muted',
  marginTop: '0.2rem'
})
