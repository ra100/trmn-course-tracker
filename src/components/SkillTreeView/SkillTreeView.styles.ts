import { css } from 'styled-system/css'

export const treeContainer = css({
  width: '100%',
  height: '100%',
  position: 'relative',
  bg: 'bg.canvas',
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  overscrollBehavior: 'contain'
})

export const categorySection = css({
  margin: { base: '0.5rem', sm: '1rem', md: '2rem' },
  bg: 'bg.surface',
  borderRadius: { base: 'sm', sm: 'md', md: 'lg' },
  boxShadow: 'md',
  overflow: 'hidden',
  border: '1px solid',
  borderColor: 'border.default'
})

export const categoryHeader = css({
  bgGradient: 'to-br',
  gradientFrom: 'accent.default',
  gradientTo: 'accent.a11y',
  color: 'white',
  padding: '1rem',
  fontWeight: 'bold',
  fontSize: '1.1rem'
})

export const subsectionContainer = css({
  padding: '1rem'
})

export const subsectionHeader = css({
  fontWeight: 600,
  color: 'fg.default',
  marginBottom: '1rem',
  paddingBottom: '0.5rem',
  borderBottom: '2px solid',
  borderColor: 'border.subtle'
})

export const courseGrid = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
  gap: { base: '0.6rem', sm: '0.8rem', md: '1rem' },
  marginBottom: { base: '1rem', sm: '1rem', md: '2rem' },
  '@media (max-width: 768px)': {
    gridTemplateColumns: '1fr'
  }
})

export const searchContainer = css({
  padding: '1rem',
  bg: 'bg.surface',
  borderBottom: '1px solid',
  borderColor: 'border.default'
})

export const statsContainer = css({
  display: 'flex',
  gap: { base: '0.3rem', sm: '0.5rem', md: '1rem' },
  padding: { base: '0.5rem', sm: '0.8rem', md: '1rem' },
  bg: 'bg.surface',
  borderBottom: '1px solid',
  borderColor: 'border.default',
  '@media (max-width: 768px)': {
    flexWrap: 'wrap'
  }
})

export const statItem = css({
  textAlign: 'center',
  flex: 1
})

export const statValue = css({
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: 'fg.default'
})

export const statLabel = css({
  fontSize: '0.9rem',
  color: 'fg.muted'
})

export const groupingToggle = css({
  display: 'flex',
  alignItems: 'center',
  gap: { base: '0.5rem', sm: '0.8rem', md: '1rem' },
  padding: { base: '0.8rem', sm: '0.8rem 1rem', md: '1rem 2rem' },
  bg: 'bg.surface',
  borderBottom: '1px solid',
  borderColor: 'border.default'
})

export const groupingLabel = css({
  fontSize: '0.9rem',
  color: 'fg.default',
  fontWeight: 500
})

export const contentArea = css({
  flex: 1,
  overflow: 'auto',
  minHeight: 0,
  overscrollBehavior: 'contain'
})
