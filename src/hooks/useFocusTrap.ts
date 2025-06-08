import { useEffect, useRef } from 'react'

interface FocusTrapOptions {
  isActive: boolean
  restoreOnDeactivate?: boolean
  initialFocusRef?: React.RefObject<HTMLElement>
  onEscape?: () => void
}

export const useFocusTrap = ({ isActive, restoreOnDeactivate = true, initialFocusRef, onEscape }: FocusTrapOptions) => {
  const containerRef = useRef<HTMLElement>(null)
  const previousActiveElementRef = useRef<Element | null>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    // Store the currently focused element to restore later
    previousActiveElementRef.current = document.activeElement

    // Get all focusable elements within the container
    const getFocusableElements = (): HTMLElement[] => {
      const focusableSelectors = [
        'button:not([disabled])',
        'input:not([disabled]):not([type="hidden"])',
        'textarea:not([disabled])',
        'select:not([disabled])',
        'a[href]',
        '[tabindex]:not([tabindex="-1"])',
        'audio[controls]',
        'video[controls]',
        '[contenteditable]:not([contenteditable="false"])',
        'details > summary:first-of-type'
      ].join(', ')

      return Array.from(containerRef.current?.querySelectorAll(focusableSelectors) || []).filter((element) => {
        // Additional checks for truly focusable elements
        const tabIndex = element.getAttribute('tabindex')
        return (
          element instanceof HTMLElement &&
          !element.hidden &&
          element.offsetWidth > 0 &&
          element.offsetHeight > 0 &&
          (tabIndex === null || parseInt(tabIndex) >= 0) &&
          getComputedStyle(element).visibility !== 'hidden'
        )
      }) as HTMLElement[]
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault()
        onEscape()
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = getFocusableElements()

      if (focusableElements.length === 0) {
        // If no focusable elements, prevent tabbing and focus the container
        event.preventDefault()
        if (containerRef.current) {
          containerRef.current.focus()
        }
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey) {
        // Shift + Tab (backwards)
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab (forwards)
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    // Add event listener
    document.addEventListener('keydown', handleKeyDown)

    // Set initial focus
    const setInitialFocus = () => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus()
      } else {
        const focusableElements = getFocusableElements()
        if (focusableElements.length > 0) {
          focusableElements[0].focus()
        } else if (containerRef.current) {
          // If no focusable elements, make container focusable and focus it
          containerRef.current.tabIndex = -1
          containerRef.current.focus()
        }
      }
    }

    // Use setTimeout to ensure the container is properly rendered
    const timeoutId = setTimeout(setInitialFocus, 10)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('keydown', handleKeyDown)

      // Restore focus to the previously focused element
      if (restoreOnDeactivate && previousActiveElementRef.current) {
        ;(previousActiveElementRef.current as HTMLElement).focus?.()
      }
    }
  }, [isActive, restoreOnDeactivate, initialFocusRef, onEscape])

  return containerRef
}
