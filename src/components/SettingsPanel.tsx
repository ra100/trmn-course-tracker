import React, { useState } from 'react'
import styled from 'styled-components'
import { UserSettings } from '../types'
import {
  parseMedusaHTML,
  validateMedusaHTML,
  extractCompletedCourseCodes,
  MedusaParseResult
} from '../utils/medusaParser'

const PanelContainer = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #34495e;
`

const PanelTitle = styled.h3`
  color: #ecf0f1;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
`

const SettingSection = styled.div`
  margin-bottom: 1.5rem;
`

const SettingLabel = styled.label`
  display: block;
  color: #bdc3c7;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
`

const ToggleGroup = styled.div`
  display: flex;
  flex-direction: column;
`

const ToggleItem = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  color: #ecf0f1;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.6rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }
`

const ToggleContent = styled.div`
  flex: 1;
  margin-right: 1rem;
`

const ToggleLabel = styled.div`
  font-weight: 500;
  margin-bottom: 0.2rem;
`

const ToggleSwitch = styled.div<{ checked: boolean }>`
  position: relative;
  width: 48px;
  height: 26px;
  background-color: ${(props) => (props.checked ? '#27ae60' : '#525862')};
  border-radius: 13px;
  transition: all 0.3s ease;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);

  &:hover {
    background-color: ${(props) => (props.checked ? '#2ecc71' : '#5a6270')};
  }

  &:before {
    content: '';
    position: absolute;
    top: 2px;
    left: ${(props) => (props.checked ? '24px' : '2px')};
    width: 22px;
    height: 22px;
    background-color: white;
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  display: none;
`

const SettingDescription = styled.div`
  font-size: 0.75rem;
  color: #95a5a6;
  margin-top: 0.2rem;
  line-height: 1.3;
`

const ResetButton = styled.button`
  background: #e67e22;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  margin-top: 1rem;
  width: 100%;

  &:hover {
    background: #d35400;
  }
`

const ImportButton = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  margin-top: 1rem;
  width: 100%;

  &:hover {
    background: #2980b9;
  }

  &:disabled {
    background: #7f8c8d;
    cursor: not-allowed;
  }
`

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 0.5rem;
  border: 1px solid #525862;
  border-radius: 4px;
  background-color: #34495e;
  color: #ecf0f1;
  font-size: 0.8rem;
  font-family: monospace;
  resize: vertical;
  margin-top: 0.5rem;

  &:focus {
    outline: none;
    border-color: #3498db;
  }

  &::placeholder {
    color: #95a5a6;
  }
`

const ImportSection = styled.div`
  margin-bottom: 1.5rem;
`

const ImportSteps = styled.ol`
  font-size: 0.75rem;
  color: #95a5a6;
  margin: 0.5rem 0;
  padding-left: 1.2rem;
  line-height: 1.4;
`

const ImportResults = styled.div<{ type: 'success' | 'error' }>`
  background: ${(props) => (props.type === 'success' ? '#27ae60' : '#e74c3c')};
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-top: 0.5rem;
`

const ErrorList = styled.ul`
  margin: 0.5rem 0 0 1rem;
  padding: 0;
`

interface SettingsPanelProps {
  settings: UserSettings
  onSettingsChange: (settings: UserSettings) => void
  onImportMedusaCourses?: (courseCodes: string[]) => { imported: number; trackable: number; alreadyCompleted: number }
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange, onImportMedusaCourses }) => {
  const [importHtml, setImportHtml] = useState('')
  const [importResult, setImportResult] = useState<MedusaParseResult | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  const handleToggle = (key: keyof UserSettings, value: boolean) => {
    onSettingsChange({
      ...settings,
      [key]: value
    })
  }

  const handleReset = () => {
    onSettingsChange({
      theme: 'light',
      layout: 'tree',
      showCompleted: true,
      showUnavailable: true,
      autoSave: true
    })
  }

  const handleImportMedusa = async () => {
    if (!importHtml.trim()) {
      setImportResult({
        courses: [],
        parseDate: new Date(),
        errors: ['Please paste the HTML content from your medusa.trmn.org user page.']
      })
      return
    }

    setIsImporting(true)

    try {
      // Validate HTML first
      const validation = validateMedusaHTML(importHtml)
      if (!validation.valid) {
        setImportResult({
          courses: [],
          parseDate: new Date(),
          errors: [validation.reason || 'Invalid HTML format']
        })
        return
      }

      // Parse the HTML
      const result = parseMedusaHTML(importHtml)
      setImportResult(result)

      // If parsing was successful and we have courses, import them
      if (result.courses.length > 0 && result.errors.length === 0 && onImportMedusaCourses) {
        const courseCodes = extractCompletedCourseCodes(result.courses)
        const importStats = onImportMedusaCourses(courseCodes)

        // Update result with import statistics
        result.importStats = importStats
      }
    } catch (error) {
      setImportResult({
        courses: [],
        parseDate: new Date(),
        errors: [`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleClearImport = () => {
    setImportHtml('')
    setImportResult(null)
  }

  return (
    <PanelContainer>
      <PanelTitle>Display Settings</PanelTitle>

      <SettingSection>
        <SettingLabel>Course Visibility</SettingLabel>
        <ToggleGroup>
          <ToggleItem onClick={() => handleToggle('showCompleted', !settings.showCompleted)}>
            <ToggleContent>
              <ToggleLabel>Show Completed Courses</ToggleLabel>
              <SettingDescription>Display courses you've already completed</SettingDescription>
            </ToggleContent>
            <HiddenCheckbox
              checked={settings.showCompleted}
              onChange={(e) => handleToggle('showCompleted', e.target.checked)}
            />
            <ToggleSwitch checked={settings.showCompleted} />
          </ToggleItem>

          <ToggleItem onClick={() => handleToggle('showUnavailable', !settings.showUnavailable)}>
            <ToggleContent>
              <ToggleLabel>Show Locked Courses</ToggleLabel>
              <SettingDescription>Display courses that are locked due to unmet prerequisites</SettingDescription>
            </ToggleContent>
            <HiddenCheckbox
              checked={settings.showUnavailable}
              onChange={(e) => handleToggle('showUnavailable', e.target.checked)}
            />
            <ToggleSwitch checked={settings.showUnavailable} />
          </ToggleItem>
        </ToggleGroup>
      </SettingSection>

      <SettingSection>
        <SettingLabel>Application</SettingLabel>
        <ToggleGroup>
          <ToggleItem onClick={() => handleToggle('autoSave', !settings.autoSave)}>
            <ToggleContent>
              <ToggleLabel>Auto-save Progress</ToggleLabel>
              <SettingDescription>Automatically save your course completion progress</SettingDescription>
            </ToggleContent>
            <HiddenCheckbox checked={settings.autoSave} onChange={(e) => handleToggle('autoSave', e.target.checked)} />
            <ToggleSwitch checked={settings.autoSave} />
          </ToggleItem>
        </ToggleGroup>
      </SettingSection>

      {onImportMedusaCourses && (
        <ImportSection>
          <SettingLabel>Import from Medusa</SettingLabel>
          <SettingDescription>Import your completed courses from medusa.trmn.org</SettingDescription>
          <ImportSteps>
            <li>Log in to medusa.trmn.org</li>
            <li>Go to your user page (/user)</li>
            <li>Click the "Academic Record" tab</li>
            <li>Right-click → "View Page Source" or press Ctrl+U</li>
            <li>Copy all the HTML and paste it below</li>
          </ImportSteps>

          <TextArea
            value={importHtml}
            onChange={(e) => setImportHtml(e.target.value)}
            placeholder="Paste the complete HTML source from your medusa.trmn.org user page here..."
          />

          <ImportButton onClick={handleImportMedusa} disabled={isImporting || !importHtml.trim()}>
            {isImporting ? 'Importing...' : 'Import Courses'}
          </ImportButton>

          {importHtml && (
            <ImportButton onClick={handleClearImport} style={{ background: '#95a5a6', marginTop: '0.5rem' }}>
              Clear
            </ImportButton>
          )}

          {importResult && (
            <ImportResults type={importResult.errors.length > 0 ? 'error' : 'success'}>
              {importResult.errors.length > 0 ? (
                <>
                  <strong>Import Failed:</strong>
                  <ErrorList>
                    {importResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ErrorList>
                </>
              ) : (
                <>
                  <strong>Success!</strong> Found {importResult.courses.length} completed courses in Medusa.
                  {importResult.importStats && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                      • {importResult.importStats.trackable} courses are trackable in TRMN system
                      <br />• {importResult.importStats.trackable - importResult.importStats.alreadyCompleted} new
                      courses added
                      <br />• {importResult.importStats.alreadyCompleted} courses were already completed
                      <br />• {importResult.importStats.imported - importResult.importStats.trackable} courses from
                      Medusa are not tracked by this app
                    </div>
                  )}
                </>
              )}
            </ImportResults>
          )}
        </ImportSection>
      )}

      <ResetButton onClick={handleReset}>Reset to Defaults</ResetButton>
    </PanelContainer>
  )
}
