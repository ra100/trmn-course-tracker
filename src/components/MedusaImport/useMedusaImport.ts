import { useState } from 'react'
import {
  parseMedusaHTML,
  validateMedusaHTML,
  extractCompletedCourseCodes,
  extractCompletionDates,
  MedusaParseResult
} from '../../utils/medusaParser'
import { trackFileImport } from '../../utils/analytics'
import { UseMedusaImportProps, UseMedusaImportReturn } from './types'
import { logger } from '~/utils/logger'

export const useMedusaImport = ({ onImportMedusaCourses }: UseMedusaImportProps): UseMedusaImportReturn => {
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
        const completionDates = extractCompletionDates(result.courses)

        // Debug completion dates during import
        logger.log('📅 Medusa import completion dates:', {
          totalCourses: result.courses.length,
          courseCodes,
          completionDates: Array.from(completionDates.entries()),
          sampleCourses: result.courses.slice(0, 3)
        })

        const importStats = onImportMedusaCourses(courseCodes, completionDates)

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

  return {
    importHtml,
    importResult,
    isImporting,
    setImportHtml,
    handleImportMedusa,
    handleClearImport
  }
}
