import { css, cva } from 'styled-system/css'

export const debugContainer = css({
  bg: 'bg.surface',
  borderRadius: 'lg',
  border: '1px solid',
  borderColor: 'border.default',
  boxShadow: 'md',
  margin: '1rem',
  overflow: 'hidden'
})

export const debugHeader = css({
  bgGradient: 'to-br',
  gradientFrom: 'red.400',
  gradientTo: 'red.600',
  color: 'white',
  padding: '1rem',
  fontWeight: 'bold',
  fontSize: '1.1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  cursor: 'pointer'
})

export const debugContent = cva({
  base: {
    transition: 'all 0.3s ease',
    overflowY: 'auto'
  },
  variants: {
    expanded: {
      true: {
        padding: '1rem',
        maxHeight: '400px'
      },
      false: {
        padding: '0',
        maxHeight: '0'
      }
    }
  }
})

export const section = css({
  marginBottom: '1.5rem',
  border: '1px solid',
  borderColor: 'border.default',
  borderRadius: 'md',
  padding: '1rem'
})

export const sectionTitle = css({
  color: 'accent.default',
  margin: '0 0 1rem 0',
  fontSize: '1rem'
})

export const courseList = css({
  listStyle: 'none',
  padding: 0,
  margin: 0
})

export const courseItem = css({
  padding: '0.25rem 0',
  fontFamily: 'mono',
  fontSize: '0.9rem',
  color: 'fg.default',
  borderBottom: '1px solid',
  borderColor: 'border.default'
})

export const jsonPre = css({
  bg: 'bg.canvas',
  color: 'fg.default',
  padding: '1rem',
  borderRadius: 'md',
  overflowX: 'auto',
  fontSize: '0.8rem',
  maxHeight: '200px',
  overflowY: 'auto'
})
