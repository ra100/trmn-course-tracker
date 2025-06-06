import React, { useState, useEffect } from 'react'
import styled, { ThemeProvider } from 'styled-components'
import { parseCourseData } from './utils/courseParser'
import { EligibilityEngine } from './utils/eligibilityEngine'
import { SkillTreeView } from './components/SkillTreeView'
import { CourseDetails } from './components/CourseDetails'
import { ProgressPanel } from './components/ProgressPanel'
import { FilterPanel } from './components/FilterPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { SpaceWarfarePinTracker } from './components/SpaceWarfarePinTracker'
import { DebugPanel } from './components/DebugPanel'
import { ParsedCourseData, UserProgress, Course, FilterOptions, UserSettings } from './types'
import { getTheme } from './theme'

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: ${(props) => props.theme.colors.background};
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: ${(props) => props.theme.colors.text};
`

const Sidebar = styled.div`
  width: 300px;
  background-color: ${(props) => props.theme.colors.backgroundSecondary};
  color: ${(props) => props.theme.colors.text};
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-right: 1px solid ${(props) => props.theme.colors.border};
`

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const Header = styled.header`
  background-color: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.text};
  padding: 1rem;
  box-shadow: ${(props) => props.theme.shadows.medium};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
`

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`

const SkillTreeContainer = styled.div`
  flex: 1;
  overflow: hidden;
  background-color: ${(props) => props.theme.colors.surface};
`

const DetailsPanel = styled.div`
  width: 350px;
  background-color: ${(props) => props.theme.colors.surface};
  border-left: 1px solid ${(props) => props.theme.colors.border};
  overflow-y: auto;
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

function App() {
  const [courseData, setCourseData] = useState<ParsedCourseData | null>(null)
  const [userProgress, setUserProgress] = useState<UserProgress>({
    userId: 'default-user',
    completedCourses: new Set<string>(),
    availableCourses: new Set<string>(),
    specialRulesProgress: new Map(),
    lastUpdated: new Date()
  })
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [filters, setFilters] = useState<FilterOptions>({})
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'light',
    layout: 'tree',
    showCompleted: true,
    showUnavailable: true,
    autoSave: true
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [eligibilityEngine, setEligibilityEngine] = useState<EligibilityEngine | null>(null)

  useEffect(() => {
    loadCourseData()
    loadUserProgress()
    loadSettings()
  }, [])

  const loadCourseData = async () => {
    try {
      setLoading(true)
      setError(null)

      // In a real app, this would be an API call
      const response = await fetch('./courses.md')
      if (!response.ok) {
        throw new Error('Failed to load course data')
      }

      const markdownContent = await response.text()
      const parsedData = parseCourseData(markdownContent)

      setCourseData(parsedData)
      setEligibilityEngine(new EligibilityEngine(parsedData))
    } catch (err) {
      console.error('Error loading course data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load course data')
    } finally {
      setLoading(false)
    }
  }

  const loadUserProgress = () => {
    try {
      const saved = localStorage.getItem('trmn-user-progress')
      if (saved) {
        const parsed = JSON.parse(saved)
        setUserProgress({
          ...parsed,
          completedCourses: new Set(parsed.completedCourses || []),
          availableCourses: new Set(parsed.availableCourses || []),
          specialRulesProgress: new Map(parsed.specialRulesProgress || []),
          lastUpdated: new Date(parsed.lastUpdated || Date.now())
        })
      }
    } catch (err) {
      console.error('Error loading user progress:', err)
    }
  }

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('trmn-user-settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        setSettings({
          theme: 'light',
          layout: 'tree',
          showCompleted: true,
          showUnavailable: true,
          autoSave: true,
          ...parsed
        })
      }
    } catch (err) {
      console.error('Error loading settings:', err)
    }
  }

  const saveUserProgress = (progress: UserProgress) => {
    try {
      if (settings.autoSave) {
        const serializable = {
          ...progress,
          completedCourses: Array.from(progress.completedCourses),
          availableCourses: Array.from(progress.availableCourses),
          specialRulesProgress: Array.from(progress.specialRulesProgress.entries()),
          lastUpdated: progress.lastUpdated.toISOString()
        }
        localStorage.setItem('trmn-user-progress', JSON.stringify(serializable))
      }
    } catch (err) {
      console.error('Error saving user progress:', err)
    }
  }

  const toggleCourseCompletion = (courseCode: string) => {
    if (!courseData || !eligibilityEngine) return

    const newCompleted = new Set(userProgress.completedCourses)

    if (newCompleted.has(courseCode)) {
      newCompleted.delete(courseCode)
    } else {
      newCompleted.add(courseCode)
    }

    const newProgress: UserProgress = {
      ...userProgress,
      completedCourses: newCompleted,
      lastUpdated: new Date()
    }

    // Update available courses based on new completion status
    const updatedCourses = eligibilityEngine.updateCourseAvailability(newProgress)
    const newAvailable = new Set(updatedCourses.filter((course) => course.available).map((course) => course.code))

    const finalProgress = {
      ...newProgress,
      availableCourses: newAvailable
    }

    setUserProgress(finalProgress)
    saveUserProgress(finalProgress)
  }

  const handleImportMedusaCourses = (
    courseCodes: string[]
  ): { imported: number; trackable: number; alreadyCompleted: number } => {
    if (!courseData || !eligibilityEngine) return { imported: 0, trackable: 0, alreadyCompleted: 0 }

    // Get all trackable course codes from our course data
    const trackableCourses = new Set(courseData.courses.map((course) => course.code))

    // Filter imported courses to only include trackable ones
    const trackableImportedCourses = courseCodes.filter((code) => trackableCourses.has(code))

    // Check which courses are already completed
    const existingCourses = userProgress.completedCourses
    const alreadyCompleted = trackableImportedCourses.filter((code) => existingCourses.has(code))
    const newCourses = trackableImportedCourses.filter((code) => !existingCourses.has(code))

    // Add only new trackable courses to completed courses
    const newCompleted = new Set([...Array.from(existingCourses), ...newCourses])

    const newProgress: UserProgress = {
      ...userProgress,
      completedCourses: newCompleted,
      lastUpdated: new Date()
    }

    // Update available courses based on new completion status
    const updatedCourses = eligibilityEngine.updateCourseAvailability(newProgress)
    const newAvailable = new Set(updatedCourses.filter((course) => course.available).map((course) => course.code))

    const finalProgress = {
      ...newProgress,
      availableCourses: newAvailable
    }

    setUserProgress(finalProgress)
    saveUserProgress(finalProgress)

    return {
      imported: courseCodes.length,
      trackable: trackableImportedCourses.length,
      alreadyCompleted: alreadyCompleted.length
    }
  }

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course)
  }

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
  }

  const handleSettingsChange = (newSettings: UserSettings) => {
    setSettings(newSettings)
    // Save settings to localStorage
    try {
      localStorage.setItem('trmn-user-settings', JSON.stringify(newSettings))
    } catch (err) {
      console.error('Error saving settings:', err)
    }
  }

  const currentTheme = getTheme(settings.theme)

  if (loading) {
    return (
      <ThemeProvider theme={currentTheme}>
        <LoadingOverlay>
          <div>Loading TRMN Course Data...</div>
        </LoadingOverlay>
      </ThemeProvider>
    )
  }

  if (error) {
    return (
      <ThemeProvider theme={currentTheme}>
        <AppContainer>
          <ErrorMessage>
            <h3>Error Loading Application</h3>
            <p>{error}</p>
            <button onClick={loadCourseData}>Retry</button>
          </ErrorMessage>
        </AppContainer>
      </ThemeProvider>
    )
  }

  if (!courseData || !eligibilityEngine) {
    return (
      <ThemeProvider theme={currentTheme}>
        <AppContainer>
          <ErrorMessage>No course data available. Please check your connection and try again.</ErrorMessage>
        </AppContainer>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={currentTheme}>
      <AppContainer>
        <Sidebar>
          <ProgressPanel userProgress={userProgress} courseData={courseData} eligibilityEngine={eligibilityEngine} />
          <SpaceWarfarePinTracker courseData={courseData} userProgress={userProgress} />
          <DebugPanel courseData={courseData} userProgress={userProgress} />
          <FilterPanel filters={filters} courseData={courseData} onFilterChange={handleFilterChange} />
          <SettingsPanel
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onImportMedusaCourses={handleImportMedusaCourses}
          />
        </Sidebar>

        <MainContent>
          <Header>
            <h1>TRMN Course Tracker</h1>
            <p>Track your progress through The Royal Manticoran Navy course system</p>
          </Header>

          <ContentArea>
            <SkillTreeContainer>
              <SkillTreeView
                courseData={courseData}
                userProgress={userProgress}
                filters={filters}
                settings={settings}
                eligibilityEngine={eligibilityEngine}
                onCourseSelect={handleCourseSelect}
                onCourseToggle={toggleCourseCompletion}
              />
            </SkillTreeContainer>

            <DetailsPanel>
              <CourseDetails
                course={selectedCourse}
                userProgress={userProgress}
                eligibilityEngine={eligibilityEngine}
                onCourseToggle={toggleCourseCompletion}
              />
            </DetailsPanel>
          </ContentArea>
        </MainContent>
      </AppContainer>
    </ThemeProvider>
  )
}

export default App
