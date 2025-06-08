import React, { useState } from 'react'
import styled from 'styled-components'
import {
  parseMedusaHTML,
  validateMedusaHTML,
  extractCompletedCourseCodes,
  MedusaParseResult
} from '../utils/medusaParser'
import { trackFileImport } from '../utils/analytics'

const ImportSection = styled.div`
  margin-bottom: 1.5rem;
`

const ImportSteps = styled.ol`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.textMuted};
  margin: 0.5rem 0;
  padding-left: 1.2rem;
  line-height: 1.4;
`

const ImportResults = styled.div<{ type: 'success' | 'error' }>`
  background: ${(props) => (props.type === 'success' ? props.theme.colors.success : props.theme.colors.error)};
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

const ImportStats = styled.div`
  margin-top: 0.5rem;
  font-size: 0.75rem;
`

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 0.5rem;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  background-color: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.text};
  font-size: 0.8rem;
  font-family: monospace;
  resize: vertical;
  margin-top: 0.5rem;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
  }

  &::placeholder {
    color: ${(props) => props.theme.colors.textMuted};
  }
`

const ImportButton = styled.button`
  background: ${(props) => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  margin-top: 1rem;
  width: 100%;

  &:hover {
    background: ${(props) => props.theme.colors.primaryHover};
  }

  &:disabled {
    background: ${(props) => props.theme.colors.secondary};
    cursor: not-allowed;
  }
`

const ClearButton = styled(ImportButton)`
  background: #95a5a6;
  margin-top: 0.5rem;
`

interface MedusaImportProps {
  onImportMedusaCourses: (courseCodes: string[]) => { imported: number; trackable: number; alreadyCompleted: number }
}

export const MedusaImport: React.FC<MedusaImportProps> = ({ onImportMedusaCourses }) => {
  const [importHtml, setImportHtml] = useState('')
  const [importResult, setImportResult] = useState<MedusaParseResult | null>(null)
  const [isImporting, setIsImporting] = useState(false)

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
      const validation = await validateMedusaHTML(importHtml)
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
      if (result.courses.length > 0 && result.errors.length === 0) {
        const courseCodes = extractCompletedCourseCodes(result.courses)
        const importStats = onImportMedusaCourses(courseCodes)

        // Update result with import statistics
        result.importStats = importStats

        // Track successful import
        trackFileImport('medusa_html', importHtml.length, true)
      } else {
        // Track failed import
        trackFileImport('medusa_html', importHtml.length, false, result.errors.join(', '))
      }
    } catch (error) {
      const errorMessage = `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
      setImportResult({
        courses: [],
        parseDate: new Date(),
        errors: [errorMessage]
      })

      // Track failed import
      trackFileImport('medusa_html', importHtml.length, false, errorMessage)
    } finally {
      setIsImporting(false)
    }
  }

  const handleClearImport = () => {
    setImportHtml('')
    setImportResult(null)
  }

  return (
    <ImportSection>
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

      {importHtml && <ClearButton onClick={handleClearImport}>Clear</ClearButton>}

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
                <ImportStats>
                  • {importResult.importStats.trackable} courses are trackable in TRMN system
                  <br />• {importResult.importStats.trackable - importResult.importStats.alreadyCompleted} new courses
                  added
                  <br />• {importResult.importStats.alreadyCompleted} courses were already completed
                  <br />• {importResult.importStats.imported - importResult.importStats.trackable} courses from Medusa
                  are not tracked by this app
                </ImportStats>
              )}
            </>
          )}
        </ImportResults>
      )}
    </ImportSection>
  )
}
