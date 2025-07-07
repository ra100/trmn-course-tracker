import React from 'react'
import { css } from 'styled-system/css'
import { TRMNLogoProps } from './types'
import { useT } from '~/i18n'

const logoContainer = css({
  display: 'inline-block',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',

  '&[data-interactive="true"]:hover': {
    transform: 'scale(1.05)',
    filter: 'drop-shadow(0 6px 12px rgba(190, 47, 38, 0.4))'
  },

  '&[data-glow="true"]': {
    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 16px rgba(190, 47, 38, 0.3))'
  }
})

const logoImage = (size: number) =>
  css({
    display: 'block',
    width: `${size}px`,
    height: `${size}px`,
    objectFit: 'contain'
  })

/**
 * TRMN Logo Component
 *
 * Renders the official Royal Manticoran Navy circular logo with heraldic Manticore
 * Follows the organizational style guide color specifications and maintains
 * scalability across different sizes and backgrounds.
 */
export const TRMNLogo: React.FC<TRMNLogoProps> = ({
  size = 120,
  className = '',
  onClick,
  interactive = false,
  glow = false
}) => {
  const t = useT()
  return (
    <div
      className={`${logoContainer} ${className}`}
      data-interactive={interactive}
      data-glow={glow}
      onClick={interactive ? onClick : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={t.trmnHeader ? t.trmnHeader.line2 : 'The Royal Manticoran Navy Logo'}
    >
      <img
        src="/trmn-seal.png"
        width={size}
        height={size}
        alt={t.trmnHeader ? t.trmnHeader.line2 : 'The Royal Manticoran Navy Logo'}
        className={logoImage(size)}
        draggable={false}
      />
    </div>
  )
}
