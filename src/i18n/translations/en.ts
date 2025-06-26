import { TranslationStrings } from '../types'

export const enTranslations: TranslationStrings = {
  // App Header
  appTitle: 'TRMN Course Tracker',
  appSubtitle: 'Track your progress through The Royal Manticoran Navy course system',

  // Navigation and General
  loading: 'Loading TRMN Course Data...',
  error: 'Error',
  retry: 'Retry',
  save: 'Save',
  cancel: 'Cancel',
  close: 'Close',
  search: 'Search',

  // Course Status
  courseStatus: {
    available: 'Available',
    completed: 'Completed',
    locked: 'Prerequisites Required',
    inProgress: 'Working On',
    waitingGrade: 'Waiting for Grade',
    prerequisitesRequired: 'Prerequisites Required'
  },

  // Course Actions
  courseActions: {
    markComplete: 'Mark Complete',
    markIncomplete: 'Mark Incomplete',
    workingOn: 'Working On',
    waitingGrade: 'Waiting Grade',
    resetToAvailable: 'Reset to Available',
    doubleClickToToggle: 'Double-click to',
    rightClickForOptions: 'Right-click for options'
  },

  // Progress Panel
  progress: {
    title: 'Progress Overview',
    completed: 'Completed',
    available: 'Available',
    workingOn: 'Working On',
    waitingGrade: 'Waiting Grade',
    totalProgress: 'Total Progress:',
    totalCourses: 'Total Courses:',
    activeCourses: 'Active Courses:',
    lastUpdated: 'Last Updated:',
    sectionProgress: 'Section Progress',
    levelProgress: 'Level Progress',
    achievements: 'Achievements',
    level: 'Level'
  },

  // Course Details
  courseDetails: {
    selectCourse: 'Select a course to view details',
    prerequisites: 'Prerequisites',
    unlocks: 'Unlocks',
    status: 'Status',
    description: 'Description',
    unlocksCourses: 'Unlocks These Courses',
    none: 'None',
    courses: 'course(s)'
  },

  // Filter Panel
  filters: {
    title: 'Filters',
    search: 'Search courses by name, code, or section...',
    sections: 'Sections',
    departments: 'Departments',
    levels: 'Levels',
    status: 'Status',
    showCompleted: 'Show Completed',
    showUnavailable: 'Show Unavailable',
    clearFilters: 'Clear Filters',
    statusLabels: {
      completed: 'Completed',
      inProgress: 'Working On',
      waitingGrade: 'Waiting Grade',
      available: 'Available',
      locked: 'Locked'
    },
    levelLabels: {
      A: 'A (Basic)',
      C: 'C (Intermediate)',
      D: 'D (Advanced)',
      W: 'W (Specialist)'
    },
    departmentLabels: {
      Tactical: 'Tactical',
      Engineering: 'Engineering',
      Medical: 'Medical',
      Communications: 'Communications',
      Intelligence: 'Intelligence',
      Navigation: 'Navigation',
      Supply: 'Supply',
      Operations: 'Operations',
      Other: 'Other'
    },
    activeFilters: 'Active Filters',
    activeFilter: 'Active Filter'
  },

  // Settings Panel
  settings: {
    title: 'Settings',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    layout: 'Layout',
    tree: 'Tree',
    grid: 'Grid',
    force: 'Force',
    language: 'Language',
    autoSave: 'Auto Save',
    medusaImport: 'Medusa Import',
    importCourses: 'Import Courses from Medusa',
    selectFile: 'Select medusa_export.json file...',
    importButton: 'Import',
    importResults: 'Import Results',
    imported: 'Imported',
    trackable: 'Trackable',
    alreadyCompleted: 'Already completed'
  },

  // Space Warfare Pin Tracker
  spaceWarfare: {
    title: 'Space Warfare Pin',
    oswp: 'OSWP',
    eswp: 'ESWP',
    eligible: 'Eligible',
    notEligible: 'Not Eligible',
    progress: 'Progress',
    requirements: 'Requirements',
    completed: 'Completed',
    remaining: 'Remaining'
  },

  // Debug Panel
  debug: {
    title: 'Debug Info',
    userProgress: 'User Progress',
    courseData: 'Course Data',
    coursesLoaded: 'courses loaded',
    categoriesLoaded: 'categories loaded',
    specialRulesLoaded: 'special rules loaded'
  },

  // Achievements
  achievements: {
    // Progression Milestones
    firstCourse: {
      title: 'First Course',
      description: 'Complete your first course'
    },
    gettingStarted: {
      title: 'Getting Started',
      description: 'Complete 3 courses'
    },
    dedicatedStudent: {
      title: 'Dedicated Student',
      description: 'Complete 10 courses'
    },
    expertLevel: {
      title: 'Expert Level',
      description: 'Complete 25 courses'
    },
    courseVeteran: {
      title: 'Course Veteran',
      description: 'Complete 50 courses'
    },
    // Department Breadth
    multiDepartmental: {
      title: 'Multi-Departmental',
      description: 'Complete courses in 3 different departments'
    },
    departmentExplorer: {
      title: 'Department Explorer',
      description: 'Complete courses in 5 different departments'
    },
    // Specialty Depth
    firstQualification: {
      title: 'First Qualification',
      description: 'Complete A→C→D progression in any specialty'
    },
    warrantSpecialist: {
      title: 'Warrant Specialist',
      description: 'Complete any W-level (Warrant) course'
    },
    // Institution Diversity
    wellRounded: {
      title: 'Well-Rounded',
      description: 'Complete courses from both TSC and RMACA'
    },
    scholar: {
      title: 'Scholar',
      description: 'Complete courses from both TSC and University'
    },
    // Legacy achievements (kept for backwards compatibility but not used in new system)
    makingProgress: {
      title: 'Making Progress',
      description: 'Complete 10 courses'
    },
    quarterComplete: {
      title: 'Quarter Complete',
      description: 'Complete 25% of all courses'
    },
    halfwayThere: {
      title: 'Halfway There',
      description: 'Complete 50% of all courses'
    },
    almostDone: {
      title: 'Almost Done',
      description: 'Complete 75% of all courses'
    },
    courseMaster: {
      title: 'Course Master',
      description: 'Complete all available courses'
    },
    spaceWarfarePins: {
      title: 'Space Warfare Pins',
      description: 'Earn OSWP or ESWP Space Warfare qualifications'
    }
  },

  // Error Messages
  errors: {
    loadingCourseData: 'Failed to load course data',
    noDataAvailable: 'No course data available. Please check your connection and try again.',
    failedToLoad: 'Failed to load course data',
    connectionError: 'Please check your connection and try again'
  },

  // GDPR Consent
  gdpr: {
    bannerLabel: 'Cookie consent banner',
    bannerText: 'We use cookies to analyze site usage.',
    settings: 'Settings',
    settingsTitle: 'Cookie Settings',
    acceptAll: 'Accept All',
    rejectAll: 'Reject All',
    customizeSettings: 'Customize cookie settings',
    rejectNonEssential: 'Reject non-essential cookies',
    cancel: 'Cancel',
    saveSettings: 'Save Settings',
    essentialCookies: 'Essential Cookies',
    essentialDescription: 'These cookies are necessary for the website to function and cannot be disabled.',
    analyticsCookies: 'Analytics Cookies',
    analyticsDescription:
      'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.'
  },

  // Common UI Elements
  ui: {
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    apply: 'Apply',
    reset: 'Reset',
    clear: 'Clear',
    export: 'Export',
    import: 'Import',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish'
  },

  // Accessibility
  accessibility: {
    skipToMainContent: 'Skip to main content',
    skipToSkillTree: 'Skip to skill tree',
    skipToSidebar: 'Skip to sidebar',
    skipToCourseDetails: 'Skip to course details',
    closeModal: 'Close modal',
    openModal: 'Open modal',
    menuToggle: 'Toggle menu',
    searchBox: 'Search courses',
    filterSection: 'Filter courses',
    courseNode: 'Course node',
    courseSelected: 'Course selected',
    prerequisiteOf: 'Prerequisite of',
    unlockedBy: 'Unlocked by',
    levelLabel: 'Level',
    statusLabel: 'Status',
    focusTrapActive: 'Focus is trapped within this dialog. Use Tab to navigate between elements, and Escape to close.'
  }
}
