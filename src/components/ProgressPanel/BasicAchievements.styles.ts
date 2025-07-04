import { css, cva } from 'styled-system/css'

// Achievement-specific styles
export const achievementsList = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
})

export const achievementDescription = css({
  fontSize: '0.85rem',
  marginTop: '0.5rem',
  opacity: 0.9,
  lineHeight: 1.4
})

export const achievementTitle = css({
  fontSize: '1rem',
  fontWeight: '600',
  marginBottom: '0.25rem'
})

export const achievementItem = cva({
  base: {
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    border: '2px solid',
    transition: 'all 0.2s ease',
    _hover: {
      transform: 'translateY(-1px)',
      boxShadow: 'md'
    }
  },
  variants: {
    completed: {
      true: {
        bgGradient: 'to-br',
        gradientFrom: 'green.9',
        gradientTo: 'green.11',
        color: 'white',
        borderColor: 'green.6',
        boxShadow: 'sm'
      },
      false: {
        background: 'bg.surface',
        color: 'fg.default',
        borderColor: 'border.default',
        _hover: {
          borderColor: 'accent.default'
        }
      }
    }
  }
})
