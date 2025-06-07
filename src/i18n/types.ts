export type Language = 'en' | 'cs'

export interface TranslationStrings {
  // App Header
  appTitle: string
  appSubtitle: string

  // Navigation and General
  loading: string
  error: string
  retry: string
  save: string
  cancel: string
  close: string
  search: string

  // Course Status
  courseStatus: {
    available: string
    completed: string
    locked: string
    inProgress: string
    waitingGrade: string
    prerequisitesRequired: string
  }

  // Course Actions
  courseActions: {
    markComplete: string
    markIncomplete: string
    workingOn: string
    waitingGrade: string
    resetToAvailable: string
    doubleClickToToggle: string
    rightClickForOptions: string
  }

  // Progress Panel
  progress: {
    title: string
    completed: string
    available: string
    workingOn: string
    waitingGrade: string
    totalProgress: string
    totalCourses: string
    activeCourses: string
    lastUpdated: string
    sectionProgress: string
    levelProgress: string
    achievements: string
    level: string
  }

  // Course Details
  courseDetails: {
    selectCourse: string
    prerequisites: string
    unlocks: string
    status: string
    description: string
    unlocksCourses: string
    none: string
    courses: string
  }

  // Filter Panel
  filters: {
    title: string
    search: string
    sections: string
    departments: string
    levels: string
    status: string
    showCompleted: string
    showUnavailable: string
    clearFilters: string
  }

  // Settings Panel
  settings: {
    title: string
    theme: string
    light: string
    dark: string
    layout: string
    tree: string
    grid: string
    force: string
    language: string
    autoSave: string
    medusaImport: string
    importCourses: string
    selectFile: string
    importButton: string
    importResults: string
    imported: string
    trackable: string
    alreadyCompleted: string
  }

  // Space Warfare Pin Tracker
  spaceWarfare: {
    title: string
    oswp: string
    eswp: string
    eligible: string
    notEligible: string
    progress: string
    requirements: string
    completed: string
    remaining: string
  }

  // Debug Panel
  debug: {
    title: string
    userProgress: string
    courseData: string
    coursesLoaded: string
    categoriesLoaded: string
    specialRulesLoaded: string
  }

  // Achievements
  achievements: {
    firstCourse: {
      title: string
      description: string
    }
    gettingStarted: {
      title: string
      description: string
    }
    makingProgress: {
      title: string
      description: string
    }
    dedicatedStudent: {
      title: string
      description: string
    }
    expertLevel: {
      title: string
      description: string
    }
    quarterComplete: {
      title: string
      description: string
    }
    halfwayThere: {
      title: string
      description: string
    }
    almostDone: {
      title: string
      description: string
    }
    courseMaster: {
      title: string
      description: string
    }
  }

  // Error Messages
  errors: {
    loadingCourseData: string
    noDataAvailable: string
    failedToLoad: string
    connectionError: string
  }

  // Common UI Elements
  ui: {
    yes: string
    no: string
    ok: string
    apply: string
    reset: string
    clear: string
    export: string
    import: string
    delete: string
    edit: string
    view: string
    back: string
    next: string
    previous: string
    finish: string
  }
}
