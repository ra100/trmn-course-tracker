import React from 'react'
import { css } from 'styled-system/css'
import { TRMNHeaderProps } from './types'
import { TRMNLogo } from '../TRMNLogo'
import { useT } from '~/i18n'

const headerContainer = css({
  backgroundColor: 'rgba(5, 11, 20, 0.9)',
  backdropFilter: 'blur(blurs.lg)',
  color: 'fg.default',
  paddingX: '6',
  paddingY: '4',
  boxShadow: 'shadows.xl',
  borderBottom: 'borders.none',
  borderBottomWidth: '1px',
  borderBottomStyle: 'solid',
  borderColor: 'rgba(190, 47, 38, 0.3)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  minHeight: 'sizes.24',
  position: 'relative',
  overflow: 'hidden',

  // Subtle gradient overlay for depth
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(190, 47, 38, 0.1) 0%, transparent 50%, rgba(250, 233, 36, 0.05) 100%)',
    pointerEvents: 'none',
    zIndex: 1
  },

  '@media (max-width: md)': {
    paddingX: '4',
    paddingY: '3',
    minHeight: 'sizes.20'
  }
})

const contentWrapper = css({
  display: 'flex',
  alignItems: 'center',
  gap: '6',
  flex: 1,
  position: 'relative',
  zIndex: 2,

  '@media (max-width: md)': {
    gap: '4'
  },

  '@media (max-width: sm)': {
    gap: '3'
  }
})

const mobileMenuButton = css({
  display: 'none',
  background: 'none',
  border: 'borders.none',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'rgba(190, 47, 38, 0.5)',
  color: '#ffffff',
  fontSize: 'fontSizes.xl',
  cursor: 'pointer',
  padding: '2',
  borderRadius: 'radii.md',
  transition: 'all 0.2s ease',
  fontFamily: 'fonts.body',
  position: 'relative',
  zIndex: 3,

  _hover: {
    backgroundColor: 'rgba(190, 47, 38, 0.2)',
    borderColor: 'brand.primary',
    color: 'brand.primary',
    boxShadow: 'shadows.md'
  },

  '@media (max-width: md)': {
    display: 'block'
  }
})

const logotypeContainer = css({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  position: 'relative',
  zIndex: 2
})

const dualLineLogotype = css({
  margin: 0,
  fontFamily: 'fonts.heading',
  color: '#ffffff',
  textTransform: 'uppercase',
  letterSpacing: 'letterSpacings.wide',
  lineHeight: 'lineHeights.tight',
  textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 16px rgba(190, 47, 38, 0.3)',
  fontSize: 'fontSizes.3xl',
  fontWeight: 'fontWeights.bold',
  textAlign: 'left',

  // Responsive typography following TRMN style guide principles
  '@media (max-width: lg)': {
    fontSize: 'fontSizes.2xl',
    letterSpacing: 'letterSpacings.normal'
  },
  '@media (max-width: md)': {
    fontSize: 'fontSizes.lg',
    letterSpacing: 'letterSpacings.tight',
    lineHeight: 'lineHeights.tight'
  },
  '@media (max-width: sm)': {
    fontSize: 'fontSizes.md',
    letterSpacing: 'letterSpacings.tight'
  }
})

const subtitleText = css({
  margin: '1 0 0 0',
  fontSize: 'fontSizes.sm',
  color: 'rgba(250, 233, 36, 0.9)',
  fontWeight: 'fontWeights.normal',
  fontFamily: 'fonts.body',
  lineHeight: 'lineHeights.relaxed',
  fontStyle: 'italic',
  textShadow: '0 1px 4px rgba(0,0,0,0.6)',

  '@media (max-width: md)': {
    fontSize: 'fontSizes.xs',
    marginTop: '0.5'
  },
  '@media (max-width: sm)': {
    fontSize: 'fontSizes.2xs',
    marginTop: '0.5'
  }
})

/**
 * TRMN Header Component
 *
 * Displays the official Royal Manticoran Navy branding with logo and dual-line
 * logotype according to RMN-4-40 Organizational Style Guide specifications.
 * Matches the official website design with space theme and modern enhancements.
 *
 * Features:
 * - Prominent TRMN circular logo with Manticore
 * - Dual-line logotype format: "THE ROYAL" / "MANTICORAN NAVY"
 * - Space-themed background with subtle gradients
 * - Bureau of Communications subtitle
 * - Responsive design maintaining brand consistency
 */
export const TRMNHeader: React.FC<TRMNHeaderProps> = ({
  showMobileMenu = false,
  onMobileMenuToggle,
  subtitle,
  menuToggleLabel
}) => {
  const t = useT()
  const effectiveSubtitle = subtitle !== undefined ? subtitle : t.trmnHeader.subtitle
  const effectiveMenuToggleLabel = menuToggleLabel !== undefined ? menuToggleLabel : t.trmnHeader.menuToggleLabel
  return (
    <header className={headerContainer}>
      {showMobileMenu && (
        <button
          className={mobileMenuButton}
          onClick={onMobileMenuToggle}
          aria-label={effectiveMenuToggleLabel}
          type="button"
        >
          ☰
        </button>
      )}

      <div className={contentWrapper}>
        <TRMNLogo size={80} showText={false} glow interactive={false} />

        <div className={logotypeContainer}>
          <h1 className={dualLineLogotype}>
            {t.trmnHeader.line1}
            <br />
            {t.trmnHeader.line2}
          </h1>
          {effectiveSubtitle && <p className={subtitleText}>{effectiveSubtitle}</p>}
        </div>
      </div>
    </header>
  )
}
