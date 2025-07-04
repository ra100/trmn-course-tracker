import { css, cva } from 'styled-system/css'

export const bannerWrapper = cva({
  base: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    bg: 'bg.surface',
    borderTop: '2px solid',
    borderColor: 'accent.default',
    padding: '1rem',
    boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    transition: 'transform 0.3s ease-in-out'
  },
  variants: {
    isVisible: {
      true: {
        transform: 'translateY(0)'
      },
      false: {
        transform: 'translateY(100%)'
      }
    }
  }
})

export const bannerContent = css({
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  '@media (max-width: 768px)': {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '0.75rem'
  }
})

export const bannerText = css({
  flex: 1,
  color: 'fg.default',
  fontSize: '0.875rem',
  lineHeight: 1.4,
  '& a': {
    color: 'accent.default',
    textDecoration: 'underline',
    _hover: {
      color: 'accent.a11y'
    }
  }
})

export const buttonGroup = css({
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center',
  '@media (max-width: 768px)': {
    flexDirection: 'column',
    width: '100%'
  }
})

export const consentOption = css({
  marginBottom: '1rem',
  padding: '1rem',
  border: '1px solid',
  borderColor: 'border.default',
  borderRadius: 'md'
})

export const consentOptionInfo = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  flex: 1
})

export const consentOptionTitle = css({
  fontSize: 'sm',
  fontWeight: 'medium',
  color: 'fg.default',
  margin: 0
})

export const consentOptionDescription = css({
  fontSize: 'xs',
  color: 'fg.muted',
  lineHeight: 'tight',
  margin: 0
})

export const consentLabel = css({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  cursor: 'pointer',
  fontWeight: 500,
  color: 'fg.default'
})

export const consentDescription = css({
  margin: '0.5rem 0 0 1.75rem',
  fontSize: '0.875rem',
  color: 'fg.muted',
  lineHeight: 1.4
})

// Modal styles
export const modalContent = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginTop: '1rem',
  marginBottom: '1.5rem'
})

export const modalActions = css({
  display: 'flex',
  gap: '0.75rem',
  justifyContent: 'flex-end',
  marginTop: '1rem'
})
