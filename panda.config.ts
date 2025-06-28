import { defineConfig } from '@pandacss/dev'
import { createPreset } from '@park-ui/panda-preset'
import iris from '@park-ui/panda-preset/colors/iris'
import sand from '@park-ui/panda-preset/colors/sand'

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  presets: [
    createPreset({
      accentColor: iris,
      grayColor: sand,
      radius: 'sm'
    })
  ],

  // Where to look for your css declarations
  include: ['./src/**/*.{js,jsx,ts,tsx}'],

  // Files to exclude
  exclude: [],

  // The output directory for your css system
  outdir: 'src/styled-system',

  // The framework to use for generating JSX
  jsxFramework: 'react'
})
