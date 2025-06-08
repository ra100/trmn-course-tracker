import React, { useState, useEffect } from 'react'
import styled, { ThemeProvider } from 'styled-components'
import { EligibilityEngine } from './utils/eligibilityEngine'
import { useCourseData } from './hooks/useCourseData'
import { useUserProgress, useOptimisticUserProgress } from './hooks/useUserProgress'
import { useUserSettings, useOptimisticUserSettings } from './hooks/useUserSettings'
import { SkillTreeView } from './components/SkillTreeView'
import { CourseDetails } from './components/CourseDetails'
import { ProgressPanel } from './components/ProgressPanel'
import { FilterPanel } from './components/FilterPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { GDPRConsentBanner } from './components/GDPRConsentBanner'
import { ErrorBoundary } from './components/ErrorBoundary'
import { DebugPanel } from './components/DebugPanel'
import { SkipLinks } from './components/SkipLinks'
import { UserProgress, Course, FilterOptions, UserSettings } from './types'
import { getTheme } from './theme'
import { useT, useTranslation } from './i18n'
import {
  initializeAnalytics,
  trackPageView,
  trackCourseCompletion,
  trackSearch,
  trackViewModeChange,
  ConsentSettings
} from './utils/analytics'

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: ${(props) => props.theme.colors.background};
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: ${(props) => props.theme.colors.text};

  @media (max-width: 768px) {
    flex-direction: column;
    height: 100vh;
  }
`

const Sidebar = styled.div<{ $mobileOpen?: boolean }>`
  width: 350px;
  background-color: ${(props) => props.theme.colors.backgroundSecondary};
  color: ${(props) => props.theme.colors.text};
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-right: 1px solid ${(props) => props.theme.colors.border};

  @media (max-width: 1024px) {
    width: 300px;
  }

  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 1000;
    transform: translateX(${(props) => (props.$mobileOpen ? '0' : '-100%')});
    transition: transform 0.3s ease;
    border-right: none;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
  }
`

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100%;
  }
`

const Header = styled.header`
  background-color: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.text};
  padding: 1rem;
  box-shadow: ${(props) => props.theme.shadows.medium};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    padding: 0.8rem;

    h1 {
      font-size: 1.2rem;
      margin: 0;
    }

    p {
      font-size: 0.9rem;
      margin: 0;
    }
  }
`

const ContentArea = styled.div<{ $mobileLayout?: string }>`
  flex: 1;
  display: flex;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: ${(props) => (props.$mobileLayout === 'details' ? 'column-reverse' : 'column')};
  }
`

const SkillTreeContainer = styled.div<{ $mobileLayout?: string }>`
  flex: 1;
  overflow: hidden;
  background-color: ${(props) => props.theme.colors.surface};

  @media (max-width: 768px) {
    height: ${(props) => (props.$mobileLayout === 'details' ? '50vh' : '100vh')};
    display: ${(props) => (props.$mobileLayout === 'details' ? 'block' : 'block')};
  }
`

const DetailsPanel = styled.div<{ $mobileLayout?: string }>`
  width: 350px;
  background-color: ${(props) => props.theme.colors.surface};
  border-left: 1px solid ${(props) => props.theme.colors.border};
  overflow-y: auto;

  @media (max-width: 1024px) {
    width: 300px;
  }

  @media (max-width: 768px) {
    width: 100%;
    height: ${(props) => (props.$mobileLayout === 'details' ? '50vh' : '0')};
    overflow: ${(props) => (props.$mobileLayout === 'details' ? 'auto' : 'hidden')};
    border-left: none;
    border-top: 1px solid ${(props) => props.theme.colors.border};
    transform: translateY(${(props) => (props.$mobileLayout === 'details' ? '0' : '100%')});
    transition: all 0.3s ease;
  }
`

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${(props) => props.theme.colors.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.theme.colors.text};
  font-size: 1.2rem;
  z-index: 1000;
`

const ErrorMessage = styled.div`
  background-color: ${(props) => props.theme.colors.error};
  color: white;
  padding: 1rem;
  margin: 1rem;
  border-radius: 4px;
`

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.text};
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) => props.theme.colors.border};
  }

  @media (max-width: 768px) {
    display: block;
  }
`

const MobileOverlay = styled.div<{ $visible: boolean }>`
  display: none;

  @media (max-width: 768px) {
    display: ${(props) => (props.$visible ? 'block' : 'none')};
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
`

const HeaderContent = styled.div`
  @media (max-width: 768px) {
    flex: 1;
  }
`

const MobileDetailsToggle = styled.button`
  display: none;
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: ${(props) => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: ${(props) => props.theme.shadows.large};
  z-index: 100;
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) => props.theme.colors.primaryHover};
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    display: block;
  }
`

const MobileCloseButton = styled.button`
  display: none;
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.text};
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  z-index: 1001;

  &:hover {
    background-color: ${(props) => props.theme.colors.border};
  }

  @media (max-width: 768px) {
    display: block;
  }
`

function App() {
  const t = useT()
  const { setLanguage } = useTranslation()

  // Use React Query for all data
  const { data: courseData, isLoading: courseLoading, error: queryError, isError } = useCourseData()
  const { data: userProgress, isLoading: progressLoading } = useUserProgress()
  const { data: settings, isLoading: settingsLoading } = useUserSettings()
  const { updateOptimistically: updateUserProgress } = useOptimisticUserProgress()
  const { updateOptimistically: updateSettings } = useOptimisticUserSettings()

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [filters, setFilters] = useState<FilterOptions>({})
  const [eligibilityEngine, setEligibilityEngine] = useState<EligibilityEngine | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileLayout, setMobileLayout] = useState<'courses' | 'details'>('courses')

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

  // Initialize analytics on app load
  useEffect(() => {
    initializeAnalytics()
  }, [])

  // Track page views on route changes (for future SPA navigation)
  useEffect(() => {
    trackPageView()
  }, [])

  const toggleCourseCompletion = (courseCode: string) => {
    if (!courseData || !eligibilityEngine || !userProgress) {
      return
    }

    const newCompleted = new Set(userProgress.completedCourses)
    const newInProgress = new Set(userProgress.inProgressCourses)
    const newWaitingGrade = new Set(userProgress.waitingGradeCourses)

    const wasCompleted = newCompleted.has(courseCode)
    if (wasCompleted) {
      newCompleted.delete(courseCode)
    } else {
      newCompleted.add(courseCode)
      // Remove from other statuses when marking as completed
      newInProgress.delete(courseCode)
      newWaitingGrade.delete(courseCode)

      // Track course completion for analytics
      const course = courseData.courses.find((c) => c.code === courseCode)
      if (course) {
        trackCourseCompletion(courseCode, course.name)
      }
    }

    const newProgress: UserProgress = {
      ...userProgress,
      completedCourses: newCompleted,
      inProgressCourses: newInProgress,
      waitingGradeCourses: newWaitingGrade,
      lastUpdated: new Date()
    }

    // Update available courses based on new completion status
    const updatedCourses = eligibilityEngine.updateCourseAvailability(newProgress)
    const newAvailable = new Set(updatedCourses.filter((course) => course.available).map((course) => course.code))

    const finalProgress = {
      ...newProgress,
      availableCourses: newAvailable
    }

    updateUserProgress(() => finalProgress)

    // Update selectedCourse if it's the course that was toggled
    if (selectedCourse && selectedCourse.code === courseCode) {
      const updatedSelectedCourse = updatedCourses.find((c) => c.code === courseCode)
      if (updatedSelectedCourse) {
        setSelectedCourse(updatedSelectedCourse)
      }
    }
  }

  const setCourseStatus = (courseCode: string, status: 'available' | 'in_progress' | 'waiting_grade' | 'completed') => {
    if (!courseData || !eligibilityEngine || !userProgress) {
      return
    }

    const newCompleted = new Set(userProgress.completedCourses)
    const newInProgress = new Set(userProgress.inProgressCourses)
    const newWaitingGrade = new Set(userProgress.waitingGradeCourses)

    // Remove from all status sets first
    newCompleted.delete(courseCode)
    newInProgress.delete(courseCode)
    newWaitingGrade.delete(courseCode)

    // Add to appropriate set based on new status
    switch (status) {
      case 'completed':
        newCompleted.add(courseCode)
        break
      case 'in_progress':
        newInProgress.add(courseCode)
        break
      case 'waiting_grade':
        newWaitingGrade.add(courseCode)
        break
      case 'available':
        // Do nothing - already removed from all sets
        break
    }

    const newProgress: UserProgress = {
      ...userProgress,
      completedCourses: newCompleted,
      inProgressCourses: newInProgress,
      waitingGradeCourses: newWaitingGrade,
      lastUpdated: new Date()
    }

    // Update available courses based on new completion status
    const updatedCourses = eligibilityEngine.updateCourseAvailability(newProgress)
    const newAvailable = new Set(updatedCourses.filter((course) => course.available).map((course) => course.code))

    const finalProgress = {
      ...newProgress,
      availableCourses: newAvailable
    }

    updateUserProgress(() => finalProgress)

    // Update selectedCourse if it's the course that was status changed
    if (selectedCourse && selectedCourse.code === courseCode) {
      const updatedSelectedCourse = updatedCourses.find((c) => c.code === courseCode)
      if (updatedSelectedCourse) {
        setSelectedCourse(updatedSelectedCourse)
      }
    }
  }

  const handleImportMedusaCourses = (
    courseCodes: string[]
  ): { imported: number; trackable: number; alreadyCompleted: number } => {
    if (!courseData || !eligibilityEngine || !userProgress) {
      return { imported: 0, trackable: 0, alreadyCompleted: 0 }
    }

    // Get all trackable course codes from our course data
    const trackableCourses = new Set(courseData.courses.map((course) => course.code))

    // Filter imported courses to only include trackable ones
    const trackableImportedCourses = courseCodes.filter((code) => trackableCourses.has(code))

    // Check which courses are already completed
    const existingCourses = userProgress.completedCourses
    const alreadyCompleted = trackableImportedCourses.filter((code) => existingCourses.has(code))
    const newCourses = trackableImportedCourses.filter((code) => !existingCourses.has(code))

    // Create new status sets - remove imported courses from in-progress and waiting-grade
    const newCompleted = new Set([...Array.from(existingCourses), ...newCourses])
    const newInProgress = new Set(userProgress.inProgressCourses)
    const newWaitingGrade = new Set(userProgress.waitingGradeCourses)

    // Remove all imported trackable courses from other status sets (Medusa import overrides manual status)
    trackableImportedCourses.forEach((courseCode) => {
      newInProgress.delete(courseCode)
      newWaitingGrade.delete(courseCode)
    })

    const newProgress: UserProgress = {
      ...userProgress,
      completedCourses: newCompleted,
      inProgressCourses: newInProgress,
      waitingGradeCourses: newWaitingGrade,
      lastUpdated: new Date()
    }

    // Update available courses based on new completion status
    const updatedCourses = eligibilityEngine.updateCourseAvailability(newProgress)
    const newAvailable = new Set(updatedCourses.filter((course) => course.available).map((course) => course.code))

    const finalProgress = {
      ...newProgress,
      availableCourses: newAvailable
    }

    updateUserProgress(() => finalProgress)

    // Update selectedCourse if it's affected by the import
    if (selectedCourse && trackableImportedCourses.includes(selectedCourse.code)) {
      const updatedSelectedCourse = updatedCourses.find((c) => c.code === selectedCourse.code)
      if (updatedSelectedCourse) {
        setSelectedCourse(updatedSelectedCourse)
      }
    }

    return {
      imported: courseCodes.length,
      trackable: trackableImportedCourses.length,
      alreadyCompleted: alreadyCompleted.length
    }
  }

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course)
    // On mobile, switch to details view when a course is selected
    if (window.innerWidth <= 768) {
      setMobileLayout('details')
    }
  }

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const handleMobileOverlayClick = () => {
    setMobileMenuOpen(false)
  }

  const handleMobileDetailsToggle = () => {
    setMobileLayout(mobileLayout === 'courses' ? 'details' : 'courses')
  }

  const handleFilterChange = (newFilters: FilterOptions) => {
    // Track search usage if search term changed
    if (newFilters.search !== filters.search && newFilters.search) {
      // Count filtered courses for search results
      const filteredCourses =
        courseData?.courses.filter((course) => {
          const searchTerm = newFilters.search?.toLowerCase() || ''
          return (
            course.name.toLowerCase().includes(searchTerm) ||
            course.code.toLowerCase().includes(searchTerm) ||
            course.section.toLowerCase().includes(searchTerm)
          )
        }) || []

      trackSearch(newFilters.search, filteredCourses.length)
    }

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

  const currentTheme = getTheme(settings?.theme || 'light')
  const isLoading = courseLoading || progressLoading || settingsLoading

  if (isLoading) {
    return (
      <ThemeProvider theme={currentTheme}>
        <LoadingOverlay>
          <div>{t.loading}</div>
        </LoadingOverlay>
      </ThemeProvider>
    )
  }

  if (isError) {
    return (
      <ThemeProvider theme={currentTheme}>
        <AppContainer>
          <ErrorMessage>
            <h3>{t.error}</h3>
            <p>{queryError?.message || 'Failed to load course data'}</p>
            <button onClick={() => window.location.reload()}>{t.retry}</button>
          </ErrorMessage>
        </AppContainer>
      </ThemeProvider>
    )
  }

  if (!courseData || !eligibilityEngine || !userProgress || !settings) {
    return (
      <ThemeProvider theme={currentTheme}>
        <AppContainer>
          <ErrorMessage>{t.errors?.noDataAvailable || 'No data available'}</ErrorMessage>
        </AppContainer>
      </ThemeProvider>
    )
  }

  return (
    <ErrorBoundary>
      <ThemeProvider theme={currentTheme}>
        <SkipLinks />
        <AppContainer>
          <MobileOverlay $visible={mobileMenuOpen} onClick={handleMobileOverlayClick} />

          <Sidebar $mobileOpen={mobileMenuOpen} id="sidebar">
            <MobileCloseButton onClick={handleMobileOverlayClick} aria-label="Close menu">
              ✕
            </MobileCloseButton>
            <ProgressPanel userProgress={userProgress} courseData={courseData} eligibilityEngine={eligibilityEngine} />
            <DebugPanel courseData={courseData} userProgress={userProgress} />
            <FilterPanel filters={filters} courseData={courseData} onFilterChange={handleFilterChange} />
            <SettingsPanel
              settings={settings}
              onSettingsChange={handleSettingsChange}
              onImportMedusaCourses={handleImportMedusaCourses}
            />
          </Sidebar>

          <MainContent id="main-content">
            <Header>
              <MobileMenuButton onClick={handleMobileMenuToggle} aria-label={t.accessibility.menuToggle}>
                ☰
              </MobileMenuButton>
              <HeaderContent>
                <h1>{t.appTitle}</h1>
                <p>{t.appSubtitle}</p>
              </HeaderContent>
            </Header>

            <ContentArea $mobileLayout={mobileLayout}>
              <SkillTreeContainer $mobileLayout={mobileLayout} id="skill-tree">
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
              </SkillTreeContainer>

              <DetailsPanel $mobileLayout={mobileLayout} id="course-details">
                <CourseDetails
                  course={selectedCourse}
                  userProgress={userProgress}
                  eligibilityEngine={eligibilityEngine}
                  onCourseToggle={toggleCourseCompletion}
                  onCourseStatusChange={setCourseStatus}
                  onCourseSelect={handleCourseSelect}
                />
              </DetailsPanel>
            </ContentArea>

            {selectedCourse && (
              <MobileDetailsToggle
                onClick={handleMobileDetailsToggle}
                aria-label={mobileLayout === 'courses' ? 'Show course details' : 'Show course list'}
              >
                {mobileLayout === 'courses' ? '📋' : '📚'}
              </MobileDetailsToggle>
            )}
          </MainContent>

          <GDPRConsentBanner onConsentChange={handleConsentChange} />
        </AppContainer>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
