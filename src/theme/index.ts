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

    // Additional semantic colors
    cardBackground: string
    headerText: string
    bodyText: string
    infoBackground: string
    code: string
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
    nodeHover: '#2c5282',

    // Additional semantic colors
    cardBackground: '#ffffff',
    headerText: '#2c3e50',
    bodyText: '#2c3e50',
    infoBackground: '#f8f9fa',
    code: '#7f8c8d'
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
    background: '#0f0f16',
    backgroundSecondary: '#1a1b26',
    surface: '#24263a',
    surfaceSecondary: '#2a2d42',

    // Text colors
    text: '#f7fafc',
    textSecondary: '#c3c7d1',
    textMuted: '#9ca3af',

    // Accent colors
    primary: '#7dd3fc',
    primaryHover: '#38bdf8',
    secondary: '#64748b',
    success: '#4ade80',
    warning: '#fbbf24',
    error: '#f87171',

    // UI elements
    border: '#374151',
    borderLight: '#2a2d42',
    shadow: 'rgba(0, 0, 0, 0.6)',
    overlay: 'rgba(0, 0, 0, 0.85)',

    // Course status colors
    courseAvailable: '#3b82f6',
    courseCompleted: '#10b981',
    courseLocked: '#6b7280',
    courseInProgress: '#f59e0b',

    // Node colors for skill tree
    nodeAvailable: '#60a5fa',
    nodeCompleted: '#34d399',
    nodeLocked: '#6b7280',
    nodeHover: '#3b82f6',

    // Additional semantic colors
    cardBackground: '#24263a',
    headerText: '#e2e8f0',
    bodyText: '#d1d5db',
    infoBackground: '#1f2937',
    code: '#9ca3af'
  },
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.5)',
    medium: '0 2px 8px rgba(0, 0, 0, 0.6)',
    large: '0 4px 16px rgba(0, 0, 0, 0.7)'
  }
}

export const getTheme = (themeName: 'light' | 'dark'): Theme => {
  return themeName === 'dark' ? darkTheme : lightTheme
}
