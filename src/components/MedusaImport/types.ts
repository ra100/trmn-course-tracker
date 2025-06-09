import { MedusaParseResult } from '../../utils/medusaParser'

export interface MedusaImportProps {
  onImportMedusaCourses: (courseCodes: string[]) => {
    imported: number
    trackable: number
    alreadyCompleted: number
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
  }
}

export interface UseMedusaImportProps {
  onImportMedusaCourses: (courseCodes: string[]) => {
    imported: number
    trackable: number
    alreadyCompleted: number
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
