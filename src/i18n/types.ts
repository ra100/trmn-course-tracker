export type Language = 'en' | 'cs'

export interface TranslationStrings {
  // App Header
  appTitle: string
  appSubtitle: string
  trmnHeader: {
    line1: string
    line2: string
    subtitle: string
    menuToggleLabel: string
  }

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

  // Waiting Grade Alert
  waitingGradeAlert: {
    title: string
    totalWaiting: string
    overdue: string
    daysWaiting: string
    overdueLabel: string
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
    completed: string
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
    statusLabels: {
      completed: string
      inProgress: string
      waitingGrade: string
      available: string
      locked: string
    }
    levelLabels: {
      A: string
      C: string
      D: string
      W: string
    }
    departmentLabels: {
      Tactical: string
      Engineering: string
      Medical: string
      Communications: string
      Intelligence: string
      Navigation: string
      Supply: string
      Operations: string
      Other: string
    }
    activeFilters: string
    activeFilter: string
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
    // Progression Milestones
    firstCourse: {
      title: string
      description: string
    }
    gettingStarted: {
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
    courseVeteran: {
      title: string
      description: string
    }
    // Department Breadth
    multiDepartmental: {
      title: string
      description: string
    }
    departmentExplorer: {
      title: string
      description: string
    }
    // Specialty Depth
    firstQualification: {
      title: string
      description: string
    }
    warrantSpecialist: {
      title: string
      description: string
    }
    // Institution Diversity
    wellRounded: {
      title: string
      description: string
    }
    scholar: {
      title: string
      description: string
    }
    // Legacy achievements (kept for backwards compatibility)
    makingProgress: {
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
    spaceWarfarePins: {
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
    noCoursesFound: string
  }

  // GDPR Consent
  gdpr: {
    bannerLabel: string
    bannerText: string
    settings: string
    settingsTitle: string
    acceptAll: string
    rejectAll: string
    customizeSettings: string
    rejectNonEssential: string
    cancel: string
    saveSettings: string
    essentialCookies: string
    essentialDescription: string
    analyticsCookies: string
    analyticsDescription: string
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

  // Accessibility
  accessibility: {
    skipToMainContent: string
    skipToSkillTree: string
    skipToSidebar: string
    skipToCourseDetails: string
    closeModal: string
    openModal: string
    menuToggle: string
    searchBox: string
    filterSection: string
    courseNode: string
    courseSelected: string
    prerequisiteOf: string
    unlockedBy: string
    levelLabel: string
    statusLabel: string
    focusTrapActive: string
  }
}
