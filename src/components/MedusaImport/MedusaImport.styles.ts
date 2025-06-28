import { css, cva } from 'styled-system/css'

export const importSection = css({
  marginBottom: '1.5rem'
})

export const importSteps = css({
  fontSize: '0.75rem',
  color: 'fg.muted',
  margin: '0.5rem 0',
  paddingLeft: '1.2rem',
  lineHeight: 1.4
})

export const importResults = cva({
  base: {
    color: 'white',
    padding: '0.5rem',
    borderRadius: 'md',
    fontSize: '0.8rem',
    marginTop: '0.5rem'
  },
  variants: {
    type: {
      success: {
        bg: 'green.500'
      },
      error: {
        bg: 'red.500'
      }
    }
  }
})

export const errorList = css({
  margin: '0.5rem 0 0 1rem',
  padding: 0
})

export const importStats = css({
  marginTop: '0.5rem',
  fontSize: '0.75rem'
})

export const importButton = css({
  marginTop: '1rem',
  width: '100%'
})

export const clearButton = css({
  marginTop: '0.5rem',
  width: '100%'
})
