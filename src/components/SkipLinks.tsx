import React from 'react'
import { css } from 'styled-system/css'

const skipLinksContainer = css({
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 'zIndex.skipLink'
})

const skipLink = css({
  position: 'absolute',
  left: '-9999px',
  top: 'auto',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  backgroundColor: 'accent.default',
  color: 'white',
  padding: '2 4',
  textDecoration: 'none',
  borderRadius: 'radii.md',
  _focus: {
    position: 'static',
    width: 'auto',
    height: 'auto',
    overflow: 'visible',
    clip: 'auto',
    whiteSpace: 'normal'
  }
})

interface SkipLinksProps {
  targets: Array<{
    id: string
    label: string
  }>
}

export const SkipLinks: React.FC<SkipLinksProps> = ({ targets }) => {
  const handleSkipClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const target = document.getElementById(targetId)
    if (target) {
      target.focus()
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className={skipLinksContainer}>
      {targets.map((target) => (
        <a key={target.id} href={`#${target.id}`} className={skipLink} onClick={(e) => handleSkipClick(e, target.id)}>
          {target.label}
        </a>
      ))}
    </div>
  )
}
