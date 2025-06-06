export interface Theme {
  colors: {
    // Main backgrounds
    background: string
    backgroundSecondary: string
    surface: string
    surfaceSecondary: string

    // Text colors
    text: string
    textSecondary: string
    textMuted: string

    // Accent colors
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
  }
  shadows: {
    small: string
    medium: string
    large: string
  }
}

export const lightTheme: Theme = {
  colors: {
    // Main backgrounds
    background: '#f8f9fa',
    backgroundSecondary: '#ffffff',
    surface: '#ffffff',
    surfaceSecondary: '#f1f3f4',

    // Text colors
    text: '#1a202c',
    textSecondary: '#4a5568',
    textMuted: '#718096',

    // Accent colors
    primary: '#3182ce',
    primaryHover: '#2c5282',
    secondary: '#a0aec0',
    success: '#38a169',
    warning: '#ed8936',
    error: '#e53e3e',

    // UI elements
    border: '#e2e8f0',
    borderLight: '#f1f3f4',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.6)',

    // Course status colors
    courseAvailable: '#2b6cb0',
    courseCompleted: '#2f855a',
    courseLocked: '#a0aec0',
    courseInProgress: '#dd6b20',

    // Node colors for skill tree
    nodeAvailable: '#3182ce',
    nodeCompleted: '#38a169',
    nodeLocked: '#cbd5e0',
    nodeHover: '#2c5282'
  },
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.1)',
    medium: '0 2px 6px rgba(0, 0, 0, 0.1)',
    large: '0 4px 12px rgba(0, 0, 0, 0.15)'
  }
}

export const darkTheme: Theme = {
  colors: {
    // Main backgrounds
    background: '#0f1419',
    backgroundSecondary: '#1a202c',
    surface: '#2d3748',
    surfaceSecondary: '#4a5568',

    // Text colors
    text: '#f7fafc',
    textSecondary: '#e2e8f0',
    textMuted: '#a0aec0',

    // Accent colors
    primary: '#63b3ed',
    primaryHover: '#4299e1',
    secondary: '#718096',
    success: '#68d391',
    warning: '#fbb040',
    error: '#fc8181',

    // UI elements
    border: '#4a5568',
    borderLight: '#2d3748',
    shadow: 'rgba(0, 0, 0, 0.5)',
    overlay: 'rgba(0, 0, 0, 0.8)',

    // Course status colors
    courseAvailable: '#4299e1',
    courseCompleted: '#48bb78',
    courseLocked: '#718096',
    courseInProgress: '#ed8936',

    // Node colors for skill tree
    nodeAvailable: '#63b3ed',
    nodeCompleted: '#68d391',
    nodeLocked: '#718096',
    nodeHover: '#4299e1'
  },
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.4)',
    medium: '0 2px 6px rgba(0, 0, 0, 0.4)',
    large: '0 4px 12px rgba(0, 0, 0, 0.5)'
  }
}

export const getTheme = (themeName: 'light' | 'dark'): Theme => {
  return themeName === 'dark' ? darkTheme : lightTheme
}
