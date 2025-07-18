import { TranslationStrings } from '../types'

export const csTranslations: TranslationStrings = {
  // App Header
  appTitle: 'TRMN Sledování kurzů',
  appSubtitle: 'Sledujte svůj pokrok v systému kurzů Královského mantikorského námořnictva',
  trmnHeader: {
    line1: 'KRÁLOVSKÉ',
    line2: 'MANTIKORSKÉ NÁMOŘNICTVO',
    subtitle: 'Sledování kurzů - Úřad komunikace',
    menuToggleLabel: 'Přepnout navigační menu'
  },

  // Navigation and General
  loading: 'Načítání dat kurzů TRMN...',
  error: 'Chyba',
  retry: 'Opakovat',
  save: 'Uložit',
  cancel: 'Zrušit',
  close: 'Zavřít',
  search: 'Hledat',

  // Course Status
  courseStatus: {
    available: 'Dostupný',
    completed: 'Dokončeno',
    locked: 'Vyžaduje předpoklady',
    inProgress: 'Pracuji na tom',
    waitingGrade: 'Čekám na hodnocení',
    prerequisitesRequired: 'Vyžaduje předpoklady'
  },

  // Course Actions
  courseActions: {
    markComplete: 'Označit jako dokončené',
    markIncomplete: 'Označit jako nedokončené',
    workingOn: 'Pracuji na tom',
    waitingGrade: 'Čekám na hodnocení',
    resetToAvailable: 'Resetovat na dostupný',
    doubleClickToToggle: 'Dvojklik pro',
    rightClickForOptions: 'Pravý klik pro možnosti'
  },

  // Waiting Grade Alert
  waitingGradeAlert: {
    title: 'Kurzy čekající na hodnocení',
    totalWaiting: 'čeká na hodnocení',
    overdue: 'po termínu',
    daysWaiting: 'dní čekání',
    overdueLabel: 'PO TERMÍNU'
  },

  // Progress Panel
  progress: {
    title: 'Přehled pokroku',
    completed: 'Dokončeno',
    available: 'Dostupné',
    workingOn: 'Pracuji na tom',
    waitingGrade: 'Čekám na hodnocení',
    totalProgress: 'Celkový pokrok:',
    totalCourses: 'Celkem kurzů:',
    activeCourses: 'Aktivní kurzy:',
    lastUpdated: 'Naposledy aktualizováno:',
    sectionProgress: 'Pokrok sekcí',
    levelProgress: 'Pokrok úrovní',
    achievements: 'Úspěchy',
    level: 'Úroveň'
  },

  // Course Details
  courseDetails: {
    selectCourse: 'Vyberte kurz pro zobrazení detailů',
    prerequisites: 'Předpoklady',
    unlocks: 'Odemyká',
    status: 'Stav',
    description: 'Popis',
    unlocksCourses: 'Odemyká tyto kurzy',
    none: 'Žádné',
    courses: 'kurz(ů)',
    completed: 'Dokončeno'
  },

  // Filter Panel
  filters: {
    title: 'Filtry',
    search: 'Hledejte kurzy podle názvu, kódu nebo sekce...',
    sections: 'Sekce',
    departments: 'Oddělení',
    levels: 'Úrovně',
    status: 'Stav',
    showCompleted: 'Zobrazit dokončené',
    showUnavailable: 'Zobrazit nedostupné',
    clearFilters: 'Vymazat filtry',
    statusLabels: {
      completed: 'Dokončené',
      inProgress: 'Právě studuji',
      waitingGrade: 'Čekám na hodnocení',
      available: 'Dostupné',
      locked: 'Uzamčené'
    },
    levelLabels: {
      A: 'A (Základní)',
      C: 'C (Pokročilé)',
      D: 'D (Pokročilé)',
      W: 'W (Specialista)'
    },
    departmentLabels: {
      Tactical: 'Taktické',
      Engineering: 'Strojírenství',
      Medical: 'Zdravotnictví',
      Communications: 'Komunikace',
      Intelligence: 'Zpravodajství',
      Navigation: 'Navigace',
      Supply: 'Zásobování',
      Operations: 'Operace',
      Other: 'Ostatní'
    },
    activeFilters: 'Aktivní filtry',
    activeFilter: 'Aktivní filtr'
  },

  // Settings Panel
  settings: {
    title: 'Nastavení',
    theme: 'Vzhled',
    light: 'Světlý',
    dark: 'Tmavý',
    layout: 'Rozložení',
    tree: 'Strom',
    grid: 'Mřížka',
    force: 'Síla',
    language: 'Jazyk',
    autoSave: 'Automatické ukládání',
    medusaImport: 'Import Medusa',
    importCourses: 'Importovat kurzy z Medusa',
    selectFile: 'Vyberte soubor medusa_export.json...',
    importButton: 'Importovat',
    importResults: 'Výsledky importu',
    imported: 'Importováno',
    trackable: 'Sledovatelné',
    alreadyCompleted: 'Již dokončeno'
  },

  // Space Warfare Pin Tracker
  spaceWarfare: {
    title: 'Space Warfare Pin',
    oswp: 'OSWP',
    eswp: 'ESWP',
    eligible: 'Způsobilý',
    notEligible: 'Nezpůsobilý',
    progress: 'Pokrok',
    requirements: 'Požadavky',
    completed: 'Dokončeno',
    remaining: 'Zbývající'
  },

  // Debug Panel
  debug: {
    title: 'Ladicí informace',
    userProgress: 'Pokrok uživatele',
    courseData: 'Data kurzů',
    coursesLoaded: 'kurzů načteno',
    categoriesLoaded: 'kategorií načteno',
    specialRulesLoaded: 'speciálních pravidel načteno'
  },

  // Achievements
  achievements: {
    // Progression Milestones
    firstCourse: {
      title: 'První kurz',
      description: 'Dokončete svůj první kurz'
    },
    gettingStarted: {
      title: 'Začínáme',
      description: 'Dokončete 3 kurzy'
    },
    dedicatedStudent: {
      title: 'Oddaný student',
      description: 'Dokončete 10 kurzů'
    },
    expertLevel: {
      title: 'Expertní úroveň',
      description: 'Dokončete 25 kurzů'
    },
    courseVeteran: {
      title: 'Veterán kurzů',
      description: 'Dokončete 50 kurzů'
    },
    // Department Breadth
    multiDepartmental: {
      title: 'Více oddělení',
      description: 'Dokončete kurzy ve 3 různých odděleních'
    },
    departmentExplorer: {
      title: 'Průzkumník oddělení',
      description: 'Dokončete kurzy v 5 různých odděleních'
    },
    // Specialty Depth
    firstQualification: {
      title: 'První kvalifikace',
      description: 'Dokončete postup A→C→D v jakékoli specializaci'
    },
    warrantSpecialist: {
      title: 'Warrant specialista',
      description: 'Dokončete jakýkoli kurz úrovně W (Warrant)'
    },
    // Institution Diversity
    wellRounded: {
      title: 'Všestranný',
      description: 'Dokončete kurzy z TSC i RMACA'
    },
    scholar: {
      title: 'Učenec',
      description: 'Dokončete kurzy z TSC i Univerzity'
    },
    // Legacy achievements (kept for backwards compatibility)
    makingProgress: {
      title: 'Postupujeme',
      description: 'Dokončete 10 kurzů'
    },
    quarterComplete: {
      title: 'Čtvrtina hotová',
      description: 'Dokončete 25% všech kurzů'
    },
    halfwayThere: {
      title: 'V polovině cesty',
      description: 'Dokončete 50% všech kurzů'
    },
    almostDone: {
      title: 'Skoro hotovo',
      description: 'Dokončete 75% všech kurzů'
    },
    courseMaster: {
      title: 'Mistr kurzů',
      description: 'Dokončete všechny dostupné kurzy'
    },
    spaceWarfarePins: {
      title: 'Odznaky vesmírné války',
      description: 'Získejte OSWP nebo ESWP kvalifikace vesmírné války'
    }
  },

  // Error Messages
  errors: {
    loadingCourseData: 'Nepodařilo se načíst data kurzů',
    noDataAvailable: 'Data kurzů nejsou k dispozici. Zkontrolujte připojení a zkuste to znovu.',
    failedToLoad: 'Nepodařilo se načíst data kurzů',
    connectionError: 'Zkontrolujte připojení a zkuste to znovu',
    noCoursesFound: 'Žádné kurzy neodpovídají aktuálním filtrům'
  },

  // GDPR Consent
  gdpr: {
    bannerLabel: 'Banner souhlasu s cookies',
    bannerText: 'Používáme cookies pro analýzu používání webu.',
    settings: 'Nastavení',
    settingsTitle: 'Nastavení Cookies',
    acceptAll: 'Přijmout vše',
    rejectAll: 'Odmítnout vše',
    customizeSettings: 'Přizpůsobit nastavení cookies',
    rejectNonEssential: 'Odmítnout nezbytné cookies',
    cancel: 'Zrušit',
    saveSettings: 'Uložit nastavení',
    essentialCookies: 'Nezbytné Cookies',
    essentialDescription: 'Tyto cookies jsou nezbytné pro fungování webu a nelze je zakázat.',
    analyticsCookies: 'Analytické Cookies',
    analyticsDescription:
      'Tyto cookies nám pomáhají pochopit, jak návštěvníci interagují s naším webem shromažďováním a hlášením informací anonymně.'
  },

  // Common UI Elements
  ui: {
    yes: 'Ano',
    no: 'Ne',
    ok: 'OK',
    apply: 'Použít',
    reset: 'Resetovat',
    clear: 'Vymazat',
    export: 'Exportovat',
    import: 'Importovat',
    delete: 'Smazat',
    edit: 'Upravit',
    view: 'Zobrazit',
    back: 'Zpět',
    next: 'Další',
    previous: 'Předchozí',
    finish: 'Dokončit'
  },

  // Accessibility
  accessibility: {
    skipToMainContent: 'Přejít na hlavní obsah',
    skipToSkillTree: 'Přejít na strom dovedností',
    skipToSidebar: 'Přejít na boční panel',
    skipToCourseDetails: 'Přejít na detaily kurzu',
    closeModal: 'Zavřít dialog',
    openModal: 'Otevřít dialog',
    menuToggle: 'Přepnout menu',
    searchBox: 'Hledat kurzy',
    filterSection: 'Filtrovat kurzy',
    courseNode: 'Uzel kurzu',
    courseSelected: 'Kurz vybrán',
    prerequisiteOf: 'Předpoklad pro',
    unlockedBy: 'Odemčeno pomocí',
    levelLabel: 'Úroveň',
    statusLabel: 'Stav',
    focusTrapActive: 'Fokus je uzavřen v tomto dialogu. Použijte Tab pro navigaci mezi prvky a Escape pro zavření.'
  }
}
