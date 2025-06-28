import { css } from 'styled-system/css'

// Panel container styles
export const panelContainer = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  padding: '1rem',
  backgroundColor: 'bg.default',
  borderRadius: 'md',
  border: '1px solid',
  borderColor: 'border.default'
})

export const panelTitle = css({
  fontSize: 'lg',
  fontWeight: 'semibold',
  color: 'fg.default',
  margin: 0
})

// Setting section styles
export const settingSection = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem'
})

export const settingLabel = css({
  fontSize: 'sm',
  fontWeight: 'medium',
  color: 'fg.default'
})

// Toggle styles
export const toggleGroup = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem'
})

export const toggleItem = css({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '1rem',
  padding: '0.75rem',
  backgroundColor: 'bg.subtle',
  borderRadius: 'md',
  border: '1px solid',
  borderColor: 'border.subtle'
})

export const toggleContent = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  flex: 1
})

export const toggleLabel = css({
  fontSize: 'sm',
  fontWeight: 'medium',
  color: 'fg.default'
})

export const settingDescription = css({
  fontSize: 'xs',
  color: 'fg.muted',
  lineHeight: 'tight'
})

// Language selector styles
export const languageSelector = css({
  padding: '0.5rem',
  borderRadius: 'md',
  border: '1px solid',
  borderColor: 'border.default',
  backgroundColor: 'bg.default',
  color: 'fg.default',
  fontSize: 'sm',
  _focus: {
    outline: '2px solid',
    outlineColor: 'accent.default',
    outlineOffset: '2px'
  }
})

// Reset button styles
export const resetButton = css({
  marginTop: '1rem',
  alignSelf: 'flex-start'
})
