#!/usr/bin/env tsx

import { execSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

interface BundleSizeConfig {
  maxJsSize: number // in KB
  maxCssSize: number // in KB
  maxTotalSize: number // in KB
  warnThreshold: number // percentage (e.g., 80 means warn at 80% of max)
}

const config: BundleSizeConfig = {
  maxJsSize: 500, // 500KB for JS
  maxCssSize: 50, // 50KB for CSS
  maxTotalSize: 550, // 550KB total
  warnThreshold: 80 // Warn at 80% of limits
}

function getFileSize(filePath: string): number {
  if (!existsSync(filePath)) {
    return 0
  }
  const stats = readFileSync(filePath)
  return Math.round(stats.length / 1024) // Convert to KB
}

function getGzipSize(filePath: string): number {
  if (!existsSync(filePath)) {
    return 0
  }
  try {
    const result = execSync(`gzip -c "${filePath}" | wc -c`, { encoding: 'utf8' })
    return Math.round(parseInt(result.trim()) / 1024) // Convert to KB
  } catch (error) {
    console.warn(`Could not get gzip size for ${filePath}:`, error)
    return 0
  }
}

function findAssetFiles(buildDir: string): { js: string[]; css: string[] } {
  try {
    const assetsDir = join(buildDir, 'assets')
    const files = execSync(`find "${assetsDir}" -name "*.js" -o -name "*.css"`, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean)

    return {
      js: files.filter((f) => f.endsWith('.js')),
      css: files.filter((f) => f.endsWith('.css'))
    }
  } catch (error) {
    console.error('Error finding asset files:', error)
    return { js: [], css: [] }
  }
}

function formatSize(sizeKB: number): string {
  if (sizeKB < 1024) {
    return `${sizeKB}KB`
  }
  return `${(sizeKB / 1024).toFixed(1)}MB`
}

function getStatusIcon(current: number, max: number, warnThreshold: number): string {
  const percentage = (current / max) * 100
  if (percentage >= 100) {
    return '🔴'
  }
  if (percentage >= warnThreshold) {
    return '🟡'
  }
  return '✅'
}

function checkBundleSize(): void {
  const buildDir = join(process.cwd(), 'build')

  if (!existsSync(buildDir)) {
    console.error('❌ Build directory not found. Run "npm run build" first.')
    process.exit(1)
  }

  console.log('📦 Bundle Size Analysis')
  console.log('='.repeat(50))

  const { js: jsFiles, css: cssFiles } = findAssetFiles(buildDir)

  // Calculate JS sizes
  let totalJsSize = 0
  let totalJsGzipSize = 0

  console.log('\n📄 JavaScript Files:')
  jsFiles.forEach((file) => {
    const size = getFileSize(file)
    const gzipSize = getGzipSize(file)
    totalJsSize += size
    totalJsGzipSize += gzipSize

    const filename = file.split('/').pop() || file
    console.log(`  ${filename}: ${formatSize(size)} (${formatSize(gzipSize)} gzipped)`)
  })

  // Calculate CSS sizes
  let totalCssSize = 0
  let totalCssGzipSize = 0

  console.log('\n🎨 CSS Files:')
  cssFiles.forEach((file) => {
    const size = getFileSize(file)
    const gzipSize = getGzipSize(file)
    totalCssSize += size
    totalCssGzipSize += gzipSize

    const filename = file.split('/').pop() || file
    console.log(`  ${filename}: ${formatSize(size)} (${formatSize(gzipSize)} gzipped)`)
  })

  // Summary
  const totalSize = totalJsSize + totalCssSize
  const totalGzipSize = totalJsGzipSize + totalCssGzipSize

  console.log('\n📊 Summary:')
  console.log('='.repeat(30))

  const jsIcon = getStatusIcon(totalJsSize, config.maxJsSize, config.warnThreshold)
  const cssIcon = getStatusIcon(totalCssSize, config.maxCssSize, config.warnThreshold)
  const totalIcon = getStatusIcon(totalSize, config.maxTotalSize, config.warnThreshold)

  console.log(
    `${jsIcon} JavaScript: ${formatSize(totalJsSize)} / ${formatSize(config.maxJsSize)} (${formatSize(
      totalJsGzipSize
    )} gzipped)`
  )
  console.log(
    `${cssIcon} CSS: ${formatSize(totalCssSize)} / ${formatSize(config.maxCssSize)} (${formatSize(
      totalCssGzipSize
    )} gzipped)`
  )
  console.log(
    `${totalIcon} Total: ${formatSize(totalSize)} / ${formatSize(config.maxTotalSize)} (${formatSize(
      totalGzipSize
    )} gzipped)`
  )

  // Check thresholds and provide warnings/errors
  let hasWarnings = false
  let hasErrors = false

  if (totalJsSize > config.maxJsSize) {
    console.log(
      `\n🔴 ERROR: JavaScript bundle size (${formatSize(totalJsSize)}) exceeds limit (${formatSize(config.maxJsSize)})`
    )
    hasErrors = true
  } else if (totalJsSize > config.maxJsSize * (config.warnThreshold / 100)) {
    console.log(
      `\n🟡 WARNING: JavaScript bundle size (${formatSize(totalJsSize)}) is approaching limit (${formatSize(
        config.maxJsSize
      )})`
    )
    hasWarnings = true
  }

  if (totalCssSize > config.maxCssSize) {
    console.log(
      `\n🔴 ERROR: CSS bundle size (${formatSize(totalCssSize)}) exceeds limit (${formatSize(config.maxCssSize)})`
    )
    hasErrors = true
  } else if (totalCssSize > config.maxCssSize * (config.warnThreshold / 100)) {
    console.log(
      `\n🟡 WARNING: CSS bundle size (${formatSize(totalCssSize)}) is approaching limit (${formatSize(
        config.maxCssSize
      )})`
    )
    hasWarnings = true
  }

  if (totalSize > config.maxTotalSize) {
    console.log(
      `\n🔴 ERROR: Total bundle size (${formatSize(totalSize)}) exceeds limit (${formatSize(config.maxTotalSize)})`
    )
    hasErrors = true
  } else if (totalSize > config.maxTotalSize * (config.warnThreshold / 100)) {
    console.log(
      `\n🟡 WARNING: Total bundle size (${formatSize(totalSize)}) is approaching limit (${formatSize(
        config.maxTotalSize
      )})`
    )
    hasWarnings = true
  }

  // Recommendations
  if (hasErrors || hasWarnings) {
    console.log('\n💡 Optimization Suggestions:')
    console.log('  • Run "npm run bundle:analyze" to see detailed bundle composition')
    console.log('  • Consider code splitting with React.lazy()')
    console.log('  • Check for duplicate dependencies')
    console.log('  • Optimize images and assets')
    console.log('  • Remove unused code and dependencies')
  }

  if (hasErrors) {
    console.log('\n❌ Bundle size check failed!')
    process.exit(1)
  } else if (hasWarnings) {
    console.log('\n⚠️  Bundle size check passed with warnings.')
    process.exit(0)
  } else {
    console.log('\n✅ Bundle size check passed!')
    process.exit(0)
  }
}

// Run the check
checkBundleSize()
