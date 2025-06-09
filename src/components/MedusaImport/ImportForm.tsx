import React from 'react'
import { TextArea, ImportButton, ClearButton } from './MedusaImport.styles'
import { ImportFormProps } from './types'

export const ImportForm: React.FC<ImportFormProps> = React.memo(
  ({ importHtml, isImporting, onHtmlChange, onImport, onClear }) => (
    <>
      <TextArea
        value={importHtml}
        onChange={(e) => onHtmlChange(e.target.value)}
        placeholder="Paste the complete HTML source from your medusa.trmn.org user page here..."
      />

      <ImportButton onClick={onImport} disabled={isImporting || !importHtml.trim()}>
        {isImporting ? 'Importing...' : 'Import Courses'}
      </ImportButton>

      {importHtml && <ClearButton onClick={onClear}>Clear</ClearButton>}
    </>
  )
)

ImportForm.displayName = 'ImportForm'
