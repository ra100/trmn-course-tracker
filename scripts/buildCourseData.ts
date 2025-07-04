#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { parseCourseData } from '../src/utils/courseParser'
import { getLogger } from '../src/utils/logger'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

async function buildCourseData() {
  try {
    getLogger().log('🔨 Building course data...')

    // Read the markdown file
    const markdownPath = join(projectRoot, 'public', 'courses.md')
    const markdownContent = readFileSync(markdownPath, 'utf-8')

    getLogger().log(`📄 Read markdown file: ${markdownContent.length} characters`)

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

    getLogger().log('✅ Course data built successfully!')
    getLogger().log(`📚 Total courses: ${parsedData.courses.length}`)
    getLogger().log(`📋 Categories: ${parsedData.categories.length}`)
    getLogger().log(`⚡ Special rules: ${parsedData.specialRules.length}`)
    getLogger().log(`🗂️ Department mappings: ${parsedData.departmentMappings?.size || 0}`)
    getLogger().log(`📺 Series mappings: ${parsedData.seriesMappings?.size || 0}`)
    getLogger().log(`💾 JSON file written to: ${jsonPath}`)
  } catch (error) {
    getLogger().error('❌ Error building course data:', error)
    process.exit(1)
  }
}

buildCourseData()
