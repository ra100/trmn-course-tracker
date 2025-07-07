#!/usr/bin/env tsx

import { execSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { logger } from '../src/utils/logger'

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
    logger.warn(`Could not get gzip size for ${filePath}:`, error)
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
    logger.error('Error finding asset files:', error)
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
    logger.error('❌ Build directory not found. Run "npm run build" first.')
    process.exit(1)
  }

  logger.log('📦 Bundle Size Analysis')
  logger.log('='.repeat(50))

  const { js: jsFiles, css: cssFiles } = findAssetFiles(buildDir)

  // Calculate JS sizes
  let totalJsSize = 0
  let totalJsGzipSize = 0

  logger.log('\n📄 JavaScript Files:')
  jsFiles.forEach((file) => {
    const size = getFileSize(file)
    const gzipSize = getGzipSize(file)
    totalJsSize += size
    totalJsGzipSize += gzipSize

    const filename = file.split('/').pop() || file
    logger.log(`  ${filename}: ${formatSize(size)} (${formatSize(gzipSize)} gzipped)`)
  })

  // Calculate CSS sizes
  let totalCssSize = 0
  let totalCssGzipSize = 0

  logger.log('\n🎨 CSS Files:')
  cssFiles.forEach((file) => {
    const size = getFileSize(file)
    const gzipSize = getGzipSize(file)
    totalCssSize += size
    totalCssGzipSize += gzipSize

    const filename = file.split('/').pop() || file
    logger.log(`  ${filename}: ${formatSize(size)} (${formatSize(gzipSize)} gzipped)`)
  })

  // Summary
  const totalSize = totalJsSize + totalCssSize
  const totalGzipSize = totalJsGzipSize + totalCssGzipSize

  logger.log('\n📊 Summary:')
  logger.log('='.repeat(30))

  const jsIcon = getStatusIcon(totalJsSize, config.maxJsSize, config.warnThreshold)
  const cssIcon = getStatusIcon(totalCssSize, config.maxCssSize, config.warnThreshold)
  const totalIcon = getStatusIcon(totalSize, config.maxTotalSize, config.warnThreshold)

  logger.log(
    `${jsIcon} JavaScript: ${formatSize(totalJsSize)} / ${formatSize(config.maxJsSize)} (${formatSize(
      totalJsGzipSize
    )} gzipped)`
  )
  logger.log(
    `${cssIcon} CSS: ${formatSize(totalCssSize)} / ${formatSize(config.maxCssSize)} (${formatSize(
      totalCssGzipSize
    )} gzipped)`
  )
  logger.log(
    `${totalIcon} Total: ${formatSize(totalSize)} / ${formatSize(config.maxTotalSize)} (${formatSize(
      totalGzipSize
    )} gzipped)`
  )

  // Check thresholds and provide warnings/errors
  let hasWarnings = false
  let hasErrors = false

  if (totalJsSize > config.maxJsSize) {
    logger.log(
      `\n🔴 ERROR: JavaScript bundle size (${formatSize(totalJsSize)}) exceeds limit (${formatSize(config.maxJsSize)})`
    )
    hasErrors = true
  } else if (totalJsSize > config.maxJsSize * (config.warnThreshold / 100)) {
    logger.log(
      `\n🟡 WARNING: JavaScript bundle size (${formatSize(totalJsSize)}) is approaching limit (${formatSize(
        config.maxJsSize
      )})`
    )
    hasWarnings = true
  }

  if (totalCssSize > config.maxCssSize) {
    logger.log(
      `\n🔴 ERROR: CSS bundle size (${formatSize(totalCssSize)}) exceeds limit (${formatSize(config.maxCssSize)})`
    )
    hasErrors = true
  } else if (totalCssSize > config.maxCssSize * (config.warnThreshold / 100)) {
    logger.log(
      `\n🟡 WARNING: CSS bundle size (${formatSize(totalCssSize)}) is approaching limit (${formatSize(
        config.maxCssSize
      )})`
    )
    hasWarnings = true
  }

  if (totalSize > config.maxTotalSize) {
    logger.log(
      `\n🔴 ERROR: Total bundle size (${formatSize(totalSize)}) exceeds limit (${formatSize(config.maxTotalSize)})`
    )
    hasErrors = true
  } else if (totalSize > config.maxTotalSize * (config.warnThreshold / 100)) {
    logger.log(
      `\n🟡 WARNING: Total bundle size (${formatSize(totalSize)}) is approaching limit (${formatSize(
        config.maxTotalSize
      )})`
    )
    hasWarnings = true
  }

  // Recommendations
  if (hasErrors || hasWarnings) {
    logger.log('\n💡 Optimization Suggestions:')
    logger.log('  • Run "npm run bundle:analyze" to see detailed bundle composition')
    logger.log('  • Consider code splitting with React.lazy()')
    logger.log('  • Check for duplicate dependencies')
    logger.log('  • Optimize images and assets')
    logger.log('  • Remove unused code and dependencies')
  }

  if (hasErrors) {
    logger.log('\n❌ Bundle size check failed!')
    process.exit(1)
  } else if (hasWarnings) {
    logger.log('\n⚠️  Bundle size check passed with warnings.')
    process.exit(0)
  } else {
    logger.log('\n✅ Bundle size check passed!')
    process.exit(0)
  }
}

// Run the check
checkBundleSize()
