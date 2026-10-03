import { defineConfig } from '@pandacss/dev'
import { createPreset } from '@park-ui/panda-preset'
import blue from '@park-ui/panda-preset/colors/blue'
import sand from '@park-ui/panda-preset/colors/sand'

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  presets: [
    createPreset({
      accentColor: blue,
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
        fonts: {
          // TRMN Typography based on organizational style guide
          // Cinzel approximates the formal serif style of Incised 901 Nord BT
          heading: { value: "'Cinzel', 'Times New Roman', Georgia, serif" },
          body: { value: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
          mono: {
            value: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
          }
        },
        colors: {
          blue: {
            light: {
              9: { value: '#18354b' },
              10: { value: '#24475f' },
              11: { value: '#18354b' }
            },
            dark: {
              9: { value: '#18354b' },
              10: { value: '#24475f' },
              11: { value: '#18354b' }
            }
          },
          // TRMN Official Brand Colors from RMN-4-40 Style Guide
          trmn: {
            red: { value: '#BE2F26' }, // PMS 1805 - Official TRMN Red
            yellow: { value: '#FAE924' }, // PMS 604 - Official TRMN Yellow
            black: { value: '#010101' }, // Rich Black for deep space appearance
            gold: { value: '#D4AF37' } // For accents and highlights
          },

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
          // Red colors for errors (using TRMN red)
          red: {
            6: { value: '#BE2F26' },
            9: { value: '#BE2F26' },
            11: { value: '#8B2119' }
          },

          // Updated accent color mapping to use TRMN red
          accent: {
            9: { value: '#18354b' },
            10: { value: '#24475f' },
            11: { value: '#18354b' },
            default: { value: '{colors.trmn.red}' },
            emphasized: { value: '#8B2119' },
            fg: { value: 'white' },
            text: { value: '{colors.trmn.red}' },
            a11y: { value: '{colors.trmn.red}' },
            100: { value: '#F8E8E6' },
            200: { value: '#F1D1CE' },
            300: { value: '#E9BBB7' },
            400: { value: '#E2A49F' },
            500: { value: '#DA8E88' },
            600: { value: '#D37770' },
            700: { value: '#CB6059' },
            800: { value: '#C44941' },
            900: { value: '{colors.trmn.red}' }
          }
        }
      },
      semanticTokens: {
        colors: {
          'blue.9': { value: { base: '#18354b', _light: '#18354b', _dark: '#18354b' } },
          'blue.10': { value: { base: '#24475f', _light: '#24475f', _dark: '#24475f' } },
          'blue.11': { value: { base: '#18354b', _light: '#18354b', _dark: '#18354b' } },
          'accent.9': { value: { base: '#18354b', _light: '#18354b', _dark: '#18354b' } },
          'accent.10': { value: { base: '#24475f', _light: '#24475f', _dark: '#24475f' } },
          'accent.11': { value: { base: '#18354b', _light: '#18354b', _dark: '#18354b' } },
          'bg.default': { value: { base: '#f4f0e7', _light: '#f4f0e7', _dark: '#f4f0e7' } },
          'bg.canvas': { value: { base: '#f4f0e7', _light: '#f4f0e7', _dark: '#f4f0e7' } },
          'bg.surface': { value: { base: '#fffcf6', _light: '#fffcf6', _dark: '#fffcf6' } },
          'bg.subtle': { value: { base: '#eae5da', _light: '#eae5da', _dark: '#eae5da' } },
          'fg.default': { value: { base: '#18354b', _light: '#18354b', _dark: '#18354b' } },
          'fg.muted': { value: { base: '#56616a', _light: '#56616a', _dark: '#56616a' } },
          'fg.subtle': { value: { base: '#56616a', _light: '#56616a', _dark: '#56616a' } },
          'border.default': { value: '#b4b0a6' },
          'border.subtle': { value: '#d3cec3' },
          // Primary branding colors
          'brand.primary': {
            value: '#18354b'
          },
          'brand.secondary': {
            value: { _light: '{colors.trmn.yellow}', _dark: '{colors.trmn.yellow}' }
          },
          'brand.accent': {
            value: { _light: '{colors.trmn.gold}', _dark: '{colors.trmn.gold}' }
          },

          // Custom colors with dark mode support
          'course.completed': {
            value: { _light: '{colors.green.9}', _dark: '#4ade80' }
          },
          'course.waiting': {
            value: { _light: '{colors.amber.9}', _dark: '#fbbf24' }
          },
          'course.progress': {
            value: { _light: '{colors.cyan.9}', _dark: '#22d3ee' }
          },
          'course.error': {
            value: { _light: '{colors.trmn.red}', _dark: '#f87171' }
          },
          // Border colors
          'course.completed.border': {
            value: { _light: '{colors.green.6}', _dark: '#22c55e' }
          },
          'course.waiting.border': {
            value: { _light: '{colors.amber.6}', _dark: '#f59e0b' }
          },
          'course.progress.border': {
            value: { _light: '{colors.cyan.6}', _dark: '#06b6d4' }
          },
          'course.error.border': {
            value: { _light: '{colors.trmn.red}', _dark: '#ef4444' }
          }
        }
      }
    }
  }
})
