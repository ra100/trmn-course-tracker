import { styled } from 'styled-system/jsx'

export const Spinner = styled('div', {
  base: {
    animation: 'spin 1s linear infinite',
    borderRadius: 'radii.full',
    borderTop: 'borders.none',
    borderTopWidth: '2px',
    borderTopStyle: 'solid',
    borderRight: 'borders.none',
    borderRightWidth: '2px',
    borderRightStyle: 'solid',
    borderRightColor: 'transparent',
    borderBottom: 'borders.none',
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'transparent',
    borderLeft: 'borders.none',
    borderLeftWidth: '2px',
    borderLeftStyle: 'solid',
    borderLeftColor: 'transparent',
    borderColor: 'currentColor',
    display: 'inline-block',
    height: 'sizes.4',
    width: 'sizes.4'
  }
})
