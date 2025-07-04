export interface TRMNHeaderProps {
  /**
   * Whether to show the mobile menu button
   */
  showMobileMenu?: boolean

  /**
   * Handler for mobile menu toggle
   */
  onMobileMenuToggle?: () => void

  /**
   * Additional subtitle text to display below the TRMN logotype
   */
  subtitle?: string

  /**
   * Whether to use compact layout for mobile
   */
  compact?: boolean

  /**
   * Accessibility label for the menu toggle button
   */
  menuToggleLabel?: string
}
