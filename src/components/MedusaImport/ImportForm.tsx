import React from 'react'
import { Textarea } from '~/components/ui/textarea'
import { Button } from '~/components/ui/button'
import { ImportFormProps } from './types'
import { importButton, clearButton } from './MedusaImport.styles'

export const ImportForm: React.FC<ImportFormProps> = React.memo(
  ({ importHtml, isImporting, onHtmlChange, onImport, onClear }) => {
    return (
      <>
        <Textarea
          value={importHtml}
          onChange={(e) => onHtmlChange(e.target.value)}
          placeholder="Paste the complete HTML source from your medusa.trmn.org user page here..."
        />

        <Button onClick={onImport} disabled={isImporting || !importHtml.trim()} className={importButton}>
          {isImporting ? 'Importing...' : 'Import Courses'}
        </Button>

        {importHtml && (
          <Button variant="outline" onClick={onClear} className={clearButton}>
            Clear
          </Button>
        )}
      </>
    )
  }
)

ImportForm.displayName = 'ImportForm'
