import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { I18nProvider } from './context'
import { darkTheme } from '../theme'
import { useT } from './hooks'

// Test component that uses translations
const TestComponent = () => {
  const t = useT()
  return (
    <div>
      <h1>{t.appTitle}</h1>
      <p>{t.appSubtitle}</p>
      <span>{t.courseStatus.completed}</span>
    </div>
  )
}

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={darkTheme}>
      <I18nProvider>{component}</I18nProvider>
    </ThemeProvider>
  )
}

describe('I18n Context', () => {
  it('provides English translations by default', () => {
    renderWithProviders(<TestComponent />)

    expect(screen.getByText('TRMN Course Tracker')).toBeInTheDocument()
    expect(screen.getByText('Track your progress through The Royal Manticoran Navy course system')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('loads translations without errors', () => {
    expect(() => {
      renderWithProviders(<TestComponent />)
    }).not.toThrow()
  })
})
