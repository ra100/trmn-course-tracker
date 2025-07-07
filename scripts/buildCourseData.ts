#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { parseCourseData } from '../src/utils/courseParser'
import { logger } from '../src/utils/logger'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

async function buildCourseData() {
  try {
    logger.log('🔨 Building course data...')

    // Read the markdown file
    const markdownPath = join(projectRoot, 'public', 'courses.md')
    const markdownContent = readFileSync(markdownPath, 'utf-8')

    logger.log(`📄 Read markdown file: ${markdownContent.length} characters`)

    // Parse the course data
    const parsedData = parseCourseData(markdownContent)

    // Convert Maps to Objects for JSON serialization
    const jsonData = {
      courses: parsedData.courses,
      categories: parsedData.categories,
      specialRules: parsedData.specialRules,
      departmentMappings: parsedData.departmentMappings ? Object.fromEntries(parsedData.departmentMappings) : {},
      // Include the processed maps as arrays for easy reconstruction
      courseMap: Array.from(parsedData.courseMap.entries()),
      categoryMap: Array.from(parsedData.categoryMap.entries()),
      dependencyGraph: Array.from(parsedData.dependencyGraph.entries()),
      seriesMappings: Array.from(parsedData.seriesMappings.entries()),
      buildTimestamp: new Date().toISOString()
    }

    // Write the JSON file
    const jsonPath = join(projectRoot, 'public', 'courses.json')
    writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2))

    logger.log('✅ Course data built successfully!')
    logger.log(`📚 Total courses: ${parsedData.courses.length}`)
    logger.log(`📋 Categories: ${parsedData.categories.length}`)
    logger.log(`⚡ Special rules: ${parsedData.specialRules.length}`)
    logger.log(`🗂️ Department mappings: ${parsedData.departmentMappings?.size || 0}`)
    logger.log(`📺 Series mappings: ${parsedData.seriesMappings?.size || 0}`)
    logger.log(`💾 JSON file written to: ${jsonPath}`)
  } catch (error) {
    logger.error('❌ Error building course data:', error)
    process.exit(1)
  }
}

buildCourseData()
