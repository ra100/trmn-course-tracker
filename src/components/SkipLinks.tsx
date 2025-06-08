import React from 'react'
import styled from 'styled-components'
import { useT } from '../i18n'

const SkipLinksContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9999;
`

const SkipLink = styled.a`
  position: absolute;
  top: -40px;
  left: 6px;
  background: ${(props) => props.theme.colors.primary};
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 0 0 4px 4px;
  font-weight: 600;
  font-size: 14px;
  line-height: 1.4;
  transform: translateY(-100%);
  transition: transform 0.2s ease;
  z-index: 10000;

  &:focus {
    transform: translateY(0);
    outline: 2px solid ${(props) => props.theme.colors.primaryHover};
    outline-offset: 2px;
  }

  &:focus-visible {
    transform: translateY(0);
  }

  &:hover {
    background: ${(props) => props.theme.colors.primaryHover};
  }
`

export const SkipLinks: React.FC = () => {
  const t = useT()

  const handleSkipToContent = (targetId: string) => {
    const target = document.getElementById(targetId)
    if (target) {
      target.focus()
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <SkipLinksContainer>
      <SkipLink
        href="#main-content"
        onClick={(e) => {
          e.preventDefault()
          handleSkipToContent('main-content')
        }}
      >
        {t.accessibility?.skipToMainContent || 'Skip to main content'}
      </SkipLink>
      <SkipLink
        href="#skill-tree"
        onClick={(e) => {
          e.preventDefault()
          handleSkipToContent('skill-tree')
        }}
      >
        {t.accessibility?.skipToSkillTree || 'Skip to skill tree'}
      </SkipLink>
      <SkipLink
        href="#sidebar"
        onClick={(e) => {
          e.preventDefault()
          handleSkipToContent('sidebar')
        }}
      >
        {t.accessibility?.skipToSidebar || 'Skip to sidebar'}
      </SkipLink>
      <SkipLink
        href="#course-details"
        onClick={(e) => {
          e.preventDefault()
          handleSkipToContent('course-details')
        }}
      >
        {t.accessibility?.skipToCourseDetails || 'Skip to course details'}
      </SkipLink>
    </SkipLinksContainer>
  )
}
