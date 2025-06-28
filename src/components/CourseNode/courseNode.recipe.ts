import { cva, css } from 'styled-system/css'

export const courseNodeContainer = cva({
  base: {
    color: 'white',
    padding: '1rem',
    borderRadius: 'lg',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    boxShadow: 'sm',
    _hover: {
      transform: 'translateY(-2px)',
      boxShadow: 'lg',
      filter: 'brightness(1.1)'
    },
    _active: {
      transform: 'scale(0.98)'
    },
    '@media (max-width: 768px)': {
      padding: '1.2rem',
      marginBottom: '0.5rem',
      _hover: {
        transform: 'none'
      }
    },
    '@media (max-width: 480px)': {
      padding: '1rem',
      fontSize: '0.9rem'
    }
  },
  variants: {
    status: {
      completed: {
        bgGradient: 'to-br',
        gradientFrom: 'green.500',
        gradientTo: 'green.700'
      },
      waiting_grade: {
        bgGradient: 'to-br',
        gradientFrom: 'yellow.500',
        gradientTo: 'yellow.700'
      },
      in_progress: {
        bgGradient: 'to-br',
        gradientFrom: 'teal.500',
        gradientTo: 'teal.700'
      },
      available: {
        bgGradient: 'to-br',
        gradientFrom: 'blue.500',
        gradientTo: 'blue.700'
      },
      locked: {
        bgGradient: 'to-br',
        gradientFrom: 'gray.500',
        gradientTo: 'gray.700',
        cursor: 'not-allowed',
        opacity: 0.6
      },
      error: {
        bgGradient: 'to-br',
        gradientFrom: 'red.500',
        gradientTo: 'red.700'
      }
    }
  }
})

export const courseCode = css({
  fontFamily: 'mono',
  fontSize: '0.9rem',
  opacity: 0.8,
  marginBottom: '0.5rem'
})

export const courseName = css({
  fontWeight: 600,
  fontSize: '1rem',
  lineHeight: 1.3,
  marginBottom: '0.5rem'
})

export const courseLevel = css({
  position: 'absolute',
  top: '0.5rem',
  right: '0.5rem',
  bg: 'rgba(255, 255, 255, 0.2)',
  padding: '0.2rem 0.5rem',
  borderRadius: 'full',
  fontSize: '0.8rem',
  fontWeight: 'bold'
})

export const prerequisites = css({
  fontSize: '0.8rem',
  opacity: 0.9,
  marginTop: '0.5rem'
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
        color: 'green.500',
        _after: { content: '"✓"' }
      },
      waiting_grade: {
        bg: 'rgba(255,255,255,0.9)',
        color: 'white',
        _after: { content: '"⏳"' }
      },
      in_progress: {
        bg: 'rgba(255,255,255,0.9)',
        color: 'white',
        _after: { content: '"📚"' }
      },
      available: {
        bg: 'rgba(255,255,255,0.3)',
        color: 'white',
        _after: { content: '"○"' }
      },
      locked: {
        bg: 'rgba(255,255,255,0.1)',
        color: 'white',
        _after: { content: '"●"' }
      },
      error: {
        bg: 'rgba(255,255,255,0.2)',
        color: 'white',
        _after: { content: '"!"' }
      }
    }
  }
})
