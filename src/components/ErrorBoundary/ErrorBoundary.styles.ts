import { css } from 'styled-system/css'

export const errorContainer = css({
  padding: '2rem',
  textAlign: 'center',
  bg: 'bg.surface',
  border: '1px solid',
  borderColor: 'red.500',
  borderRadius: 'lg',
  margin: '1rem'
})

export const errorTitle = css({
  color: 'red.500',
  margin: '0 0 1rem 0',
  fontSize: '1.5rem'
})

export const errorMessage = css({
  color: 'fg.muted',
  margin: '0 0 1.5rem 0',
  fontSize: '1rem',
  lineHeight: 1.5
})

export const errorStack = css({
  fontFamily: 'mono',
  fontSize: '0.8rem',
  color: 'fg.muted',
  overflowX: 'auto',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  margin: '0.5rem 0 0 0'
})
