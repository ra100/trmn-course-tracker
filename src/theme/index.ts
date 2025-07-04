export interface Theme {
  colors: {
    // TRMN Brand Colors
    trmn: {
      red: string
      yellow: string
      black: string
      gold: string
    }

    // Space theme colors
    space: {
      dark: string
      blue: string
      navy: string
    }

    // Main backgrounds
    background: string
    backgroundSecondary: string
    surface: string
    surfaceSecondary: string

    // Text colors
    text: string
    textSecondary: string
    textMuted: string

    // Accent colors (now using TRMN red)
    primary: string
    primaryHover: string
    secondary: string
    success: string
    warning: string
    error: string

    // UI elements
    border: string
    borderLight: string
    shadow: string
    overlay: string

    // Course status colors
    courseAvailable: string
    courseCompleted: string
    courseLocked: string
    courseInProgress: string

    // Node colors for skill tree
    nodeAvailable: string
    nodeCompleted: string
    nodeLocked: string
    nodeHover: string

    // Additional semantic colors
    cardBackground: string
    headerText: string
    bodyText: string
    infoBackground: string
    code: string
  }
  typography: {
    // TRMN Typography from organizational style guide
    fontFamily: {
      heading: string // Cinzel approximates Incised 901 Nord BT
      body: string // Roboto for body text
      mono: string // Monospace for code
    }
  }
  shadows: {
    small: string
    medium: string
    large: string
    glow: string
  }
}

// TRMN Brand Colors from RMN-4-40 Organizational Style Guide
const trmn = {
  red: '#BE2F26', // PMS 1805 - Official TRMN Red
  yellow: '#FAE924', // PMS 604 - Official TRMN Yellow
  black: '#010101', // Rich Black for deep space appearance
  gold: '#D4AF37' // For accents and highlights
}

// Space theme colors matching official sites
const space = {
  dark: '#050B14', // Deep space dark
  blue: '#0B1426', // Space blue
  navy: '#1a237e' // Deep navy accent
}

export const darkTheme: Theme = {
  colors: {
    trmn,
    space,

    // Main backgrounds (deeper space theme)
    background: trmn.black,
    backgroundSecondary: space.dark,
    surface: 'rgba(5, 11, 20, 0.9)',
    surfaceSecondary: 'rgba(11, 20, 38, 0.8)',

    // Text colors
    text: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    textMuted: 'rgba(255, 255, 255, 0.6)',

    // Accent colors (using TRMN colors)
    primary: trmn.red,
    primaryHover: '#D43D31',
    secondary: trmn.gold,
    success: '#4ade80',
    warning: trmn.yellow,
    error: trmn.red,

    // UI elements
    border: 'rgba(255, 255, 255, 0.15)',
    borderLight: 'rgba(255, 255, 255, 0.08)',
    shadow: 'rgba(0, 0, 0, 0.9)',
    overlay: 'rgba(1, 1, 1, 0.95)',

    // Course status colors
    courseAvailable: trmn.red,
    courseCompleted: '#4ade80',
    courseLocked: 'rgba(255, 255, 255, 0.3)',
    courseInProgress: trmn.yellow,

    // Node colors for skill tree
    nodeAvailable: trmn.red,
    nodeCompleted: '#4ade80',
    nodeLocked: 'rgba(255, 255, 255, 0.25)',
    nodeHover: '#D43D31',

    // Additional semantic colors
    cardBackground: 'rgba(5, 11, 20, 0.8)',
    headerText: '#ffffff',
    bodyText: 'rgba(255, 255, 255, 0.9)',
    infoBackground: 'rgba(11, 20, 38, 0.6)',
    code: 'rgba(255, 255, 255, 0.8)'
  },
  typography: {
    fontFamily: {
      heading: "'Cinzel', 'Times New Roman', Georgia, serif",
      body: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
    }
  },
  shadows: {
    small: '0 2px 8px rgba(0, 0, 0, 0.8)',
    medium: '0 4px 16px rgba(0, 0, 0, 0.9)',
    large: '0 8px 32px rgba(0, 0, 0, 0.95)',
    glow: '0 0 24px rgba(190, 47, 38, 0.5)'
  }
}

export const getTheme = (): Theme => darkTheme
