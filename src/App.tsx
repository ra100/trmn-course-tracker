import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { parseCourseData } from './utils/courseParser'
import { EligibilityEngine } from './utils/eligibilityEngine'
import { SkillTreeView } from './components/SkillTreeView'
import { CourseDetails } from './components/CourseDetails'
import { ProgressPanel } from './components/ProgressPanel'
import { FilterPanel } from './components/FilterPanel'
import { ParsedCourseData, UserProgress, Course, FilterOptions, UserSettings } from './types'

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`

const Sidebar = styled.div`
  width: 300px;
  background-color: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const Header = styled.header`
  background-color: #34495e;
  color: white;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`

const SkillTreeContainer = styled.div`
  flex: 1;
  overflow: hidden;
`

const DetailsPanel = styled.div`
  width: 350px;
  background-color: white;
  border-left: 1px solid #ddd;
  overflow-y: auto;
`

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  z-index: 1000;
`

const ErrorMessage = styled.div`
  background-color: #e74c3c;
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
    showUnavailable: false,
    autoSave: true
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [eligibilityEngine, setEligibilityEngine] = useState<EligibilityEngine | null>(null)

  useEffect(() => {
    loadCourseData()
    loadUserProgress()
  }, [])

  const loadCourseData = async () => {
    try {
      setLoading(true)
      setError(null)

      // In a real app, this would be an API call
      const response = await fetch('/Courses.md')
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

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course)
  }

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
  }

  if (loading) {
    return (
      <LoadingOverlay>
        <div>Loading TRMN Course Data...</div>
      </LoadingOverlay>
    )
  }

  if (error) {
    return (
      <AppContainer>
        <ErrorMessage>
          <h3>Error Loading Application</h3>
          <p>{error}</p>
          <button onClick={loadCourseData}>Retry</button>
        </ErrorMessage>
      </AppContainer>
    )
  }

  if (!courseData || !eligibilityEngine) {
    return (
      <AppContainer>
        <ErrorMessage>No course data available. Please check your connection and try again.</ErrorMessage>
      </AppContainer>
    )
  }

  return (
    <AppContainer>
      <Sidebar>
        <ProgressPanel userProgress={userProgress} courseData={courseData} eligibilityEngine={eligibilityEngine} />
        <FilterPanel filters={filters} courseData={courseData} onFilterChange={handleFilterChange} />
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
  )
}

export default App
