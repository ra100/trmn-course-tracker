import React from 'react'
import { importSection } from './MedusaImport/MedusaImport.styles'
import { ImportInstructions } from './MedusaImport/ImportInstructions'
import { ImportForm } from './MedusaImport/ImportForm'
import { ImportResults } from './MedusaImport/ImportResults'
import { useMedusaImport } from './MedusaImport/useMedusaImport'
import { MedusaImportProps } from './MedusaImport/types'

export const MedusaImport: React.FC<MedusaImportProps> = React.memo(({ onImportMedusaCourses }) => {
  const { importHtml, importResult, isImporting, setImportHtml, handleImportMedusa, handleClearImport } =
    useMedusaImport({ onImportMedusaCourses })

  return (
    <div className={importSection}>
      <ImportInstructions />

      <ImportForm
        importHtml={importHtml}
        isImporting={isImporting}
        onHtmlChange={setImportHtml}
        onImport={handleImportMedusa}
        onClear={handleClearImport}
      />

      <ImportResults result={importResult} />
    </div>
  )
})

MedusaImport.displayName = 'MedusaImport'
