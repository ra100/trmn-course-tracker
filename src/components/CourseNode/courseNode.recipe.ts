import { cva, css } from 'styled-system/css'

export const courseNodeContainer = cva({
  base: {
    color: 'white',
    padding: '1.25rem',
    borderRadius: 'xl',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    boxShadow: 'md',
    minHeight: '120px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    _hover: {
      transform: 'translateY(-3px)',
      boxShadow: 'xl',
      filter: 'brightness(1.05)'
    },
    _active: {
      transform: 'scale(0.97)'
    },
    _focus: {
      outline: '2px solid',
      outlineColor: 'accent.default',
      outlineOffset: '2px'
    },
    '@media (max-width: 768px)': {
      padding: '1rem',
      marginBottom: '0.5rem',
      minHeight: '100px',
      _hover: {
        transform: 'translateY(-1px)',
        boxShadow: 'lg'
      }
    },
    '@media (max-width: 480px)': {
      padding: '0.875rem',
      fontSize: '0.9rem',
      minHeight: '90px'
    }
  },
  variants: {
    status: {
      completed: {
        bgGradient: 'to-br',
        gradientFrom: 'green.9',
        gradientTo: 'green.11',
        borderColor: 'green.6',
        borderWidth: '2px'
      },
      waiting_grade: {
        bgGradient: 'to-br',
        gradientFrom: 'amber.9',
        gradientTo: 'amber.11',
        borderColor: 'amber.6',
        borderWidth: '2px'
      },
      in_progress: {
        bgGradient: 'to-br',
        gradientFrom: 'cyan.9',
        gradientTo: 'cyan.11',
        borderColor: 'cyan.6',
        borderWidth: '2px'
      },
      available: {
        bgGradient: 'to-br',
        gradientFrom: 'accent.default',
        gradientTo: 'accent.emphasized',
        borderColor: 'accent.600',
        borderWidth: '2px'
      },
      locked: {
        bg: 'gray.6',
        borderColor: 'gray.7',
        borderWidth: '2px',
        cursor: 'not-allowed',
        opacity: 0.6,
        color: 'gray.11'
      },
      error: {
        bgGradient: 'to-br',
        gradientFrom: 'red.9',
        gradientTo: 'red.11',
        borderColor: 'red.6',
        borderWidth: '2px'
      }
    }
  }
})

export const courseCode = css({
  fontFamily: 'mono',
  fontSize: '0.875rem',
  opacity: 0.85,
  marginBottom: '0.375rem',
  fontWeight: '500',
  letterSpacing: '0.025em'
})

export const courseName = css({
  fontWeight: '600',
  fontSize: '1.1rem',
  lineHeight: 1.25,
  marginBottom: '0.5rem',
  flex: '1',
  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
})

export const courseLevel = css({
  position: 'absolute',
  top: '0.75rem',
  right: '0.75rem',
  bg: 'rgba(255, 255, 255, 0.25)',
  backdropFilter: 'blur(4px)',
  padding: '0.25rem 0.625rem',
  borderRadius: 'full',
  fontSize: '0.75rem',
  fontWeight: '600',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  textShadow: '0 1px 2px rgba(0,0,0,0.2)'
})

export const prerequisites = css({
  fontSize: '0.8rem',
  opacity: 0.9,
  marginTop: 'auto',
  paddingTop: '0.5rem',
  fontWeight: '400'
})

export const statusIcon = cva({
  base: {
    position: 'absolute',
    bottom: '0.5rem',
    right: '0.5rem',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem'
  },
  variants: {
    status: {
      completed: {
        bg: 'white',
        color: 'green.9',
        _after: { content: '"✓"' },
        fontWeight: 'bold'
      },
      waiting_grade: {
        bg: 'rgba(255,255,255,0.95)',
        color: 'amber.11',
        _after: { content: '"⏳"' }
      },
      in_progress: {
        bg: 'rgba(255,255,255,0.95)',
        color: 'cyan.11',
        _after: { content: '"📚"' }
      },
      available: {
        bg: 'rgba(255,255,255,0.4)',
        color: 'white',
        _after: { content: '"○"' }
      },
      locked: {
        bg: 'rgba(255,255,255,0.2)',
        color: 'gray.11',
        _after: { content: '"●"' }
      },
      error: {
        bg: 'rgba(255,255,255,0.95)',
        color: 'red.11',
        _after: { content: '"!"' },
        fontWeight: 'bold'
      }
    }
  }
})
