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
  jsxFramework: 'react',

  // Theme configuration to add additional colors
  theme: {
    extend: {
      tokens: {
        colors: {
          // Green colors for completed courses
          green: {
            6: { value: '#16a34a' },
            9: { value: '#15803d' },
            11: { value: '#14532d' }
          },
          // Amber colors for waiting grade
          amber: {
            6: { value: '#d97706' },
            9: { value: '#b45309' },
            11: { value: '#92400e' }
          },
          // Cyan colors for in progress
          cyan: {
            6: { value: '#0891b2' },
            9: { value: '#0e7490' },
            11: { value: '#164e63' }
          },
          // Red colors for errors
          red: {
            6: { value: '#dc2626' },
            9: { value: '#b91c1c' },
            11: { value: '#991b1b' }
          },
          // Accent color mapping
          accent: {
            default: { value: '{colors.iris.9}' },
            emphasized: { value: '{colors.iris.10}' },
            fg: { value: 'white' },
            text: { value: '{colors.iris.11}' },
            a11y: { value: '{colors.iris.11}' },
            100: { value: '{colors.iris.3}' },
            200: { value: '{colors.iris.4}' },
            300: { value: '{colors.iris.5}' },
            400: { value: '{colors.iris.6}' },
            500: { value: '{colors.iris.7}' },
            600: { value: '{colors.iris.8}' },
            700: { value: '{colors.iris.9}' },
            800: { value: '{colors.iris.10}' },
            900: { value: '{colors.iris.11}' }
          }
        }
      }
    }
  }
})
