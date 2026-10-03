import React from 'react'
import { css } from 'styled-system/css'
import { TRMNHeaderProps } from './types'
import { TRMNLogo } from '../TRMNLogo'
import { useT } from '~/i18n'

const headerContainer = css({
  backgroundColor: 'bg.surface',
  color: 'fg.default',
  paddingX: '6',
  paddingY: '4',
  boxShadow: 'none',
  borderBottom: 'borders.none',
  borderBottomWidth: '2px',
  borderBottomStyle: 'solid',
  borderColor: 'trmn.red',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  minHeight: 'sizes.24',
  position: 'relative',
  overflow: 'hidden',

  mdDown: {
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

  '& > :first-child': { flexShrink: 0 },

  mdDown: {
    gap: '4',
    '& > :first-child': { display: 'none' }
  },

  smDown: {
    gap: '3'
  }
})

const mobileMenuButton = css({
  display: 'none',
  background: 'none',
  border: 'borders.none',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border.default',
  color: 'fg.default',
  minWidth: '44px',
  minHeight: '44px',
  fontSize: 'fontSizes.xl',
  cursor: 'pointer',
  padding: '2',
  borderRadius: 'radii.md',
  transition: 'all 0.2s ease',
  fontFamily: 'body',
  position: 'relative',
  zIndex: 3,

  _hover: {
    backgroundColor: 'bg.subtle',
    borderColor: 'brand.primary',
    color: 'brand.primary'
  },

  mdDown: {
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
  fontFamily: 'heading',
  color: 'fg.default',
  textTransform: 'uppercase',
  letterSpacing: 'letterSpacings.normal',
  lineHeight: 'tight',
  textShadow: 'none',
  fontSize: 'fontSizes.3xl',
  fontWeight: 'bold',
  textAlign: 'left',

  // Responsive typography following TRMN style guide principles
  lgDown: {
    fontSize: 'fontSizes.2xl',
    letterSpacing: 'letterSpacings.normal'
  },
  mdDown: {
    fontSize: 'fontSizes.lg',
    letterSpacing: 'letterSpacings.tight',
    lineHeight: 'tight'
  },
  smDown: {
    fontSize: 'fontSizes.md',
    letterSpacing: 'letterSpacings.tight'
  }
})

const subtitleText = css({
  margin: '1 0 0 0',
  fontSize: 'fontSizes.sm',
  color: 'fg.muted',
  fontWeight: 'normal',
  fontFamily: 'body',
  lineHeight: 'relaxed',
  fontStyle: 'normal',
  textShadow: 'none',

  mdDown: {
    fontSize: 'fontSizes.xs',
    marginTop: '0.5'
  },
  smDown: {
    fontSize: 'fontSizes.2xs',
    marginTop: '0.5'
  }
})

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
        <TRMNLogo size={64} showText={false} glow={false} interactive={false} />

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
