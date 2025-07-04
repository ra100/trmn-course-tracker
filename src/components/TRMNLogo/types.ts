export interface TRMNLogoProps {
  /**
   * Size of the logo in pixels
   */
  size?: number

  /**
   * Whether to include the circular text around the logo
   */
  showText?: boolean

  /**
   * Color variant for different backgrounds
   */
  variant?: 'default' | 'light' | 'dark'

  /**
   * Whether to show a subtle glow effect
   */
  glow?: boolean

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Click handler for interactive logos
   */
  onClick?: () => void

  /**
   * Whether the logo should be interactive (clickable)
   */
  interactive?: boolean
}
