import React from 'react'
import { importSteps } from './MedusaImport.styles'
import { ImportInstructionsProps } from './types'

export const ImportInstructions: React.FC<ImportInstructionsProps> = React.memo(() => (
  <ol className={importSteps}>
    <li>Log in to medusa.trmn.org</li>
    <li>Go to your user page (/user)</li>
    <li>Click the &quot;Academic Record&quot; tab</li>
    <li>Right-click → &quot;View Page Source&quot; or press Ctrl+U</li>
    <li>Copy all the HTML and paste it below</li>
  </ol>
))

ImportInstructions.displayName = 'ImportInstructions'
