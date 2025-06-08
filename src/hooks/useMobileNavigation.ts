import { useState, useCallback } from 'react'

export type MobileLayout = 'courses' | 'details'

export interface MobileNavigationState {
  mobileMenuOpen: boolean
  mobileLayout: MobileLayout
}

export interface MobileNavigationActions {
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
  toggleMobileLayout: () => void
  setMobileLayoutToDetails: () => void
  handleMobileOverlayClick: () => void
}

export interface UseMobileNavigationReturn extends MobileNavigationState, MobileNavigationActions {}

/**
 * Custom hook for managing mobile navigation state and interactions
 * Extracts mobile-specific logic from App.tsx for better separation of concerns
 */
export const useMobileNavigation = (): UseMobileNavigationReturn => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileLayout, setMobileLayout] = useState<MobileLayout>('courses')

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev)
  }, [])

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  const toggleMobileLayout = useCallback(() => {
    setMobileLayout((current) => (current === 'courses' ? 'details' : 'courses'))
  }, [])

  const setMobileLayoutToDetails = useCallback(() => {
    setMobileLayout('details')
  }, [])

  const handleMobileOverlayClick = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  return {
    // State
    mobileMenuOpen,
    mobileLayout,

    // Actions
    toggleMobileMenu,
    closeMobileMenu,
    toggleMobileLayout,
    setMobileLayoutToDetails,
    handleMobileOverlayClick
  }
}
