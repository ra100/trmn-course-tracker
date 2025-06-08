import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMobileNavigation } from './useMobileNavigation'

describe('useMobileNavigation', () => {
  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useMobileNavigation())

      expect(result.current.mobileMenuOpen).toBe(false)
      expect(result.current.mobileLayout).toBe('courses')
    })
  })

  describe('mobile menu actions', () => {
    it('should toggle mobile menu open and closed', () => {
      const { result } = renderHook(() => useMobileNavigation())

      // Initially closed
      expect(result.current.mobileMenuOpen).toBe(false)

      // Toggle to open
      act(() => {
        result.current.toggleMobileMenu()
      })
      expect(result.current.mobileMenuOpen).toBe(true)

      // Toggle to close
      act(() => {
        result.current.toggleMobileMenu()
      })
      expect(result.current.mobileMenuOpen).toBe(false)
    })

    it('should close mobile menu explicitly', () => {
      const { result } = renderHook(() => useMobileNavigation())

      // Open menu first
      act(() => {
        result.current.toggleMobileMenu()
      })
      expect(result.current.mobileMenuOpen).toBe(true)

      // Close explicitly
      act(() => {
        result.current.closeMobileMenu()
      })
      expect(result.current.mobileMenuOpen).toBe(false)
    })

    it('should handle mobile overlay click', () => {
      const { result } = renderHook(() => useMobileNavigation())

      // Open menu first
      act(() => {
        result.current.toggleMobileMenu()
      })
      expect(result.current.mobileMenuOpen).toBe(true)

      // Click overlay should close menu
      act(() => {
        result.current.handleMobileOverlayClick()
      })
      expect(result.current.mobileMenuOpen).toBe(false)
    })
  })

  describe('mobile layout actions', () => {
    it('should toggle between courses and details layout', () => {
      const { result } = renderHook(() => useMobileNavigation())

      // Initially courses
      expect(result.current.mobileLayout).toBe('courses')

      // Toggle to details
      act(() => {
        result.current.toggleMobileLayout()
      })
      expect(result.current.mobileLayout).toBe('details')

      // Toggle back to courses
      act(() => {
        result.current.toggleMobileLayout()
      })
      expect(result.current.mobileLayout).toBe('courses')
    })

    it('should set mobile layout to details explicitly', () => {
      const { result } = renderHook(() => useMobileNavigation())

      // Initially courses
      expect(result.current.mobileLayout).toBe('courses')

      // Set to details
      act(() => {
        result.current.setMobileLayoutToDetails()
      })
      expect(result.current.mobileLayout).toBe('details')

      // Set to details again (should remain details)
      act(() => {
        result.current.setMobileLayoutToDetails()
      })
      expect(result.current.mobileLayout).toBe('details')
    })
  })

  describe('function stability', () => {
    it('should have stable function references', () => {
      const { result, rerender } = renderHook(() => useMobileNavigation())

      const initialFunctions = {
        toggleMobileMenu: result.current.toggleMobileMenu,
        closeMobileMenu: result.current.closeMobileMenu,
        toggleMobileLayout: result.current.toggleMobileLayout,
        setMobileLayoutToDetails: result.current.setMobileLayoutToDetails,
        handleMobileOverlayClick: result.current.handleMobileOverlayClick
      }

      // Trigger a rerender
      rerender()

      // Functions should be the same references (memoized)
      expect(result.current.toggleMobileMenu).toBe(initialFunctions.toggleMobileMenu)
      expect(result.current.closeMobileMenu).toBe(initialFunctions.closeMobileMenu)
      expect(result.current.toggleMobileLayout).toBe(initialFunctions.toggleMobileLayout)
      expect(result.current.setMobileLayoutToDetails).toBe(initialFunctions.setMobileLayoutToDetails)
      expect(result.current.handleMobileOverlayClick).toBe(initialFunctions.handleMobileOverlayClick)
    })
  })

  describe('edge cases', () => {
    it('should handle rapid state changes correctly', () => {
      const { result } = renderHook(() => useMobileNavigation())

      // Rapid menu toggles
      act(() => {
        result.current.toggleMobileMenu()
        result.current.toggleMobileMenu()
        result.current.toggleMobileMenu()
      })
      expect(result.current.mobileMenuOpen).toBe(true)

      // Rapid layout toggles
      act(() => {
        result.current.toggleMobileLayout()
        result.current.toggleMobileLayout()
        result.current.toggleMobileLayout()
      })
      expect(result.current.mobileLayout).toBe('details')
    })

    it('should handle mixed actions correctly', () => {
      const { result } = renderHook(() => useMobileNavigation())

      act(() => {
        // Open menu and switch to details
        result.current.toggleMobileMenu()
        result.current.setMobileLayoutToDetails()
      })

      expect(result.current.mobileMenuOpen).toBe(true)
      expect(result.current.mobileLayout).toBe('details')

      act(() => {
        // Close menu but keep layout
        result.current.handleMobileOverlayClick()
      })

      expect(result.current.mobileMenuOpen).toBe(false)
      expect(result.current.mobileLayout).toBe('details')
    })
  })
})
