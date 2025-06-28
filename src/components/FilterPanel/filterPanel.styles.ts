import { css } from 'styled-system/css'

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

export const filterSection = css({
  marginBottom: '1.5rem'
})

export const filterLabel = css({
  display: 'block',
  color: 'fg.muted',
  fontSize: '0.9rem',
  fontWeight: 500,
  marginBottom: '0.5rem'
})

export const clearButton = css({
  marginTop: '1rem',
  width: '100%'
})

export const filterCount = css({
  bg: 'bg.surface',
  padding: '0.8rem',
  borderRadius: 'md',
  marginBottom: '1rem',
  textAlign: 'center',
  border: '1px solid',
  borderColor: 'border.default'
})

export const countValue = css({
  fontSize: '1.2rem',
  color: 'accent.default',
  fontWeight: 'bold'
})

export const countLabel = css({
  fontSize: '0.8rem',
  color: 'fg.muted'
})
