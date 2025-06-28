import React, { useState, useEffect } from 'react'
import { css } from 'styled-system/css'
import { EligibilityEngine } from './utils/eligibilityEngine'
import { useCourseData } from './hooks/useCourseData'
import { useUserProgress } from './hooks/useUserProgress'
import { useUserSettings, useOptimisticUserSettings } from './hooks/useUserSettings'
import { useMobileNavigation } from './hooks/useMobileNavigation'
import { useFilterState } from './hooks/useFilterState'
import { useCourseManagement } from './hooks/useCourseManagement'
import { SkillTreeView } from './components/SkillTreeView'
import { CourseDetails } from './components/CourseDetails'
import { ProgressPanel } from './components/ProgressPanel'
import { FilterPanel } from './components/FilterPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { GDPRConsentBanner } from './components/GDPRConsentBanner'
import { ErrorBoundary } from './components/ErrorBoundary'
import { DebugPanel } from './components/DebugPanel'
import { SkipLinks } from './components/SkipLinks'
import { Course, FilterOptions, UserSettings } from './types'
import { useT, useTranslation } from './i18n'
import { initializeAnalytics, trackPageView, trackViewModeChange, ConsentSettings } from './utils/analytics'

const appContainer = css({
  display: 'flex',
  height: '100vh',
  maxHeight: '100vh',
  overflow: 'hidden',
  backgroundColor: 'bg.default',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  color: 'fg.default',
  '@media (max-width: md)': {
    flexDirection: 'column',
    height: '100vh',
    maxHeight: '100vh'
  }
})

const sidebar = css({
  width: '350px',
  backgroundColor: 'bg.subtle',
  color: 'fg.default',
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
  overscrollBehavior: 'contain',
  borderRight: 'borders.none',
  borderRightWidth: '1px',
  borderRightStyle: 'solid',
  borderColor: 'border.default',
  '@media (max-width: lg)': {
    width: '300px'
  },
  '@media (max-width: md)': {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
    zIndex: 1000,
    borderRight: 'none',
    borderBottom: 'borders.none',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'border.default'
  }
})

const sidebarMobileOpen = css({
  '@media (max-width: md)': {
    transform: 'translateX(0)',
    transition: 'transform 0.3s ease'
  }
})

const sidebarMobileClosed = css({
  '@media (max-width: md)': {
    transform: 'translateX(-100%)',
    transition: 'transform 0.3s ease'
  }
})

const mainContent = css({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  minHeight: 0,
  '@media (max-width: 768px)': {
    width: '100%'
  '@media (max-width: md)': {
})

const header = css({
  backgroundColor: 'bg.surface',
  color: 'fg.default',
  padding: '1rem',
  boxShadow: 'md',
  borderBottom: '1px solid',
  borderColor: 'border.default',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  '@media (max-width: 768px)': {
    padding: '0.8rem',
    '& h1': {
      fontSize: '1.2rem',
      margin: 0
    },
    '& p': {
      fontSize: '0.9rem',
      margin: 0
    }
  }
})

const contentArea = css({
  flex: 1,
  display: 'flex',
  minHeight: 0,
  overflow: 'hidden',
  '@media (max-width: md)': {
    flexDirection: 'column'
  }
})

const skillTreeContainer = css({
  flex: 1,
  overflow: 'auto',
  backgroundColor: 'bg.surface',
  '@media (max-width: md)': {
    height: '100vh',
    display: 'block'
  }
})

const skillTreeContainerMobileDetails = css({
  '@media (max-width: md)': {
    height: '50vh'
  }
})

const detailsPanel = css({
  width: '350px',
  backgroundColor: 'bg.surface',
  borderLeft: 'borders.none',
  borderLeftWidth: '1px',
  borderLeftStyle: 'solid',
  borderColor: 'border.default',
  overflowY: 'auto',
  overscrollBehavior: 'contain',
  '@media (max-width: 1024px)': {
    width: '300px'
  },
  '@media (max-width: lg)': {
    borderLeft: 'none',
    borderTop: 'borders.none',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: 'border.default',
    transition: 'all 0.3s ease'
  }
})

const detailsPanelMobileVisible = css({
  '@media (max-width: md)': {
    height: '50vh',
    overflow: 'auto',
    transform: 'translateY(0)'
  }
})

const detailsPanelMobileHidden = css({
  '@media (max-width: md)': {
    height: '0',
    overflow: 'hidden',
    transform: 'translateY(100%)'
  }
})

const loadingOverlay = css({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'bg.overlay',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'fg.default',
  fontSize: 'fontSizes.lg',
  zIndex: 1000
})

const errorMessage = css({
  backgroundColor: 'red.500',
  color: 'white',
  padding: '1rem',
  margin: '1rem',
  borderRadius: 'md'
})

const mobileMenuButton = css({
  display: 'none',
  background: 'none',
  border: 'none',
  color: 'fg.default',
  fontSize: '1.5rem',
  cursor: 'pointer',
  padding: '0.5rem',
  borderRadius: 'md',
  transition: 'background-color 0.2s ease',
  _hover: {
    backgroundColor: 'bg.subtle'
  },
  '@media (max-width: 768px)': {
    display: 'block'
  }
})

const mobileOverlay = css({
  display: 'none',
  '@media (max-width: md)': {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999
  }
})

const mobileOverlayVisible = css({
  '@media (max-width: md)': {
    display: 'block'
  }
})

const headerContent = css({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  '& h1': {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  '& p': {
    margin: 0,
    fontSize: '0.9rem',
    color: 'fg.muted'
  }
})

const mobileDetailsToggle = css({
  display: 'none',
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  backgroundColor: 'accent.default',
  color: 'white',
  border: 'none',
  borderRadius: '50%',
  width: '56px',
  height: '56px',
  fontSize: '1.2rem',
  cursor: 'pointer',
  boxShadow: 'lg',
  zIndex: 100,
  transition: 'all 0.3s ease',
  _hover: {
    borderRadius: 'radii.full',
    width: 'sizes.14',
    height: 'sizes.14',
    fontSize: 'lg',
    display: 'block'
  }
})

const mobileCloseButton = css({
  display: 'none',
  position: 'absolute',
  top: 'spacing.4',
  right: 'spacing.4',
  background: 'none',
  border: 'none',
  color: 'fg.default',
  fontSize: 'fontSizes.xl',
  cursor: 'pointer',
  padding: 'spacing.2',
  borderRadius: 'radii.md',
  zIndex: 1001,
  _hover: {
    backgroundColor: 'bg.subtle'
  },
  '@media (max-width: md)': {
    display: 'block'
  }
})

function App() {
  const t = useT()
  const { setLanguage } = useTranslation()

  // Use React Query for all data
  const { data: courseData, isLoading: courseLoading, error: queryError, isError } = useCourseData()
  const { data: userProgress, isLoading: progressLoading } = useUserProgress()
  const { data: settings, isLoading: settingsLoading } = useUserSettings()
  const { updateOptimistically: updateSettings } = useOptimisticUserSettings()

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [eligibilityEngine, setEligibilityEngine] = useState<EligibilityEngine | null>(null)

  // Mobile navigation state management
  const {
    mobileMenuOpen,
    mobileLayout,
    toggleMobileMenu,
    closeMobileMenu,
    toggleMobileLayout,
    setMobileLayoutToDetails,
    handleMobileOverlayClick
  } = useMobileNavigation()

  // Filter state management with analytics
  const { filters, setFilters } = useFilterState(courseData?.courses.length || 0)

  // Course management operations
  const { toggleCourseCompletion, setCourseStatus, handleImportMedusaCourses } = useCourseManagement({
    courseData,
    eligibilityEngine,
    userProgress,
    selectedCourse,
    setSelectedCourse
  })

  // Initialize eligibility engine when course data loads
  useEffect(() => {
    if (courseData) {
      setEligibilityEngine(new EligibilityEngine(courseData))
    }
  }, [courseData])

  // Sync language settings with i18n context
  useEffect(() => {
    if (settings?.language) {
      setLanguage(settings.language)
    }
  }, [settings?.language, setLanguage])

  // Apply dark mode class to document element
  useEffect(() => {
    if (settings?.theme) {
      const htmlElement = document.documentElement
      if (settings.theme === 'dark') {
        htmlElement.classList.add('dark')
        htmlElement.classList.remove('light')
      } else {
        htmlElement.classList.add('light')
        htmlElement.classList.remove('dark')
      }
    }
  }, [settings?.theme])

  // Initialize analytics on app load
  useEffect(() => {
    initializeAnalytics()
  }, [])

  // Track page views on route changes (for future SPA navigation)
  useEffect(() => {
    trackPageView()
  }, [])

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course)
    // On mobile, switch to details view when a course is selected
    if (window.innerWidth <= 768) {
      setMobileLayoutToDetails()
    }
  }

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
  }

  const handleSettingsChange = (newSettings: UserSettings) => {
    // Track view mode changes
    if (newSettings.layout !== settings?.layout) {
      trackViewModeChange(newSettings.layout)
    }

    updateSettings(() => newSettings)
  }

  const handleConsentChange = (_consent: Partial<ConsentSettings>) => {
    // Analytics tracking is handled internally by the analytics utils
    // This handler is available for future use if needed
  }

  const isLoading = courseLoading || progressLoading || settingsLoading

  if (isLoading) {
    return (
      <div className={loadingOverlay}>
        <div>{t.loading}</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className={appContainer}>
        <div className={errorMessage}>
          <h3>{t.error}</h3>
          <p>{queryError?.message || 'Failed to load course data'}</p>
          <button onClick={() => window.location.reload()}>{t.retry}</button>
        </div>
      </div>
    )
  }

  if (!courseData || !eligibilityEngine || !userProgress || !settings) {
    return (
      <div className={appContainer}>
        <div className={errorMessage}>{t.errors?.noDataAvailable || 'No data available'}</div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <SkipLinks
        targets={[
          { id: 'main-content', label: t.accessibility.skipToMainContent },
          { id: 'skill-tree', label: t.accessibility.skipToSkillTree },
          { id: 'sidebar', label: t.accessibility.skipToSidebar },
          { id: 'course-details', label: t.accessibility.skipToCourseDetails }
        ]}
      />
      <div className={appContainer}>
        <div
          className={`${mobileOverlay} ${mobileMenuOpen ? mobileOverlayVisible : ''}`}
          onClick={handleMobileOverlayClick}
        />

        <div className={`${sidebar} ${mobileMenuOpen ? sidebarMobileOpen : sidebarMobileClosed}`} id="sidebar">
          <button className={mobileCloseButton} onClick={closeMobileMenu} aria-label="Close menu">
            ✕
          </button>
          <ProgressPanel userProgress={userProgress} courseData={courseData} eligibilityEngine={eligibilityEngine} />
          <DebugPanel courseData={courseData} userProgress={userProgress} />
          <FilterPanel filters={filters} courseData={courseData} onFilterChange={handleFilterChange} />
          <SettingsPanel
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onImportMedusaCourses={handleImportMedusaCourses}
          />
        </div>

        <div className={mainContent} id="main-content">
          <header className={header}>
            <button className={mobileMenuButton} onClick={toggleMobileMenu} aria-label={t.accessibility.menuToggle}>
              ☰
            </button>
            <div className={headerContent}>
              <h1>{t.appTitle}</h1>
              <p>{t.appSubtitle}</p>
            </div>
          </header>

          <div className={contentArea}>
            <div
              className={`${skillTreeContainer} ${mobileLayout === 'details' ? skillTreeContainerMobileDetails : ''}`}
              id="skill-tree"
            >
              <SkillTreeView
                courseData={courseData}
                userProgress={userProgress}
                filters={filters}
                settings={settings}
                eligibilityEngine={eligibilityEngine}
                onCourseSelect={handleCourseSelect}
                onCourseToggle={toggleCourseCompletion}
                onCourseStatusChange={setCourseStatus}
              />
            </div>

            <div
              className={`${detailsPanel} ${mobileLayout === 'details' ? detailsPanelMobileVisible : detailsPanelMobileHidden}`}
              id="course-details"
            >
              <CourseDetails
                course={selectedCourse}
                userProgress={userProgress}
                eligibilityEngine={eligibilityEngine}
                onCourseToggle={toggleCourseCompletion}
                onCourseStatusChange={setCourseStatus}
                onCourseSelect={handleCourseSelect}
              />
            </div>
          </div>

          {selectedCourse && (
            <button
              className={mobileDetailsToggle}
              onClick={toggleMobileLayout}
              aria-label={mobileLayout === 'courses' ? 'Show course details' : 'Show course list'}
            >
              {mobileLayout === 'courses' ? '📋' : '📚'}
            </button>
          )}
        </div>

        <GDPRConsentBanner onConsentChange={handleConsentChange} />
      </div>
    </ErrorBoundary>
  )
}

export default App
