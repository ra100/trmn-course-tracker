import { MedusaParseResult } from '../../utils/medusaParser'

export interface MedusaImportProps {
  onImportMedusaCourses: (
    courseCodes: string[],
    completionDates?: Map<string, Date>
  ) => {
    imported: number
    trackable: number
    alreadyCompleted: number
    newCourses: string[]
    untrackedCourses: string[]
  }
}

export type ImportInstructionsProps = Record<string, never>

export interface ImportFormProps {
  importHtml: string
  isImporting: boolean
  onHtmlChange: (html: string) => void
  onImport: () => void
  onClear: () => void
}

export interface ImportResultsProps {
  result: MedusaParseResult | null
}

export interface ImportSuccessDisplayProps {
  result: MedusaParseResult
}

export interface ImportErrorDisplayProps {
  errors: string[]
}

export interface ImportStatsDisplayProps {
  stats: {
    trackable: number
    imported: number
    alreadyCompleted: number
    newCourses: string[]
    untrackedCourses: string[]
  }
}

export interface UseMedusaImportProps {
  onImportMedusaCourses: (
    courseCodes: string[],
    completionDates?: Map<string, Date>
  ) => {
    imported: number
    trackable: number
    alreadyCompleted: number
    newCourses: string[]
    untrackedCourses: string[]
  }
}

export interface UseMedusaImportReturn {
  importHtml: string
  importResult: MedusaParseResult | null
  isImporting: boolean
  setImportHtml: (html: string) => void
  handleImportMedusa: () => Promise<void>
  handleClearImport: () => void
}
