#!/usr/bin/env node
/* eslint-disable no-console */
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { parseCourseData } from '../src/utils/courseParser'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

async function buildCourseData() {
  try {
    console.log('🔨 Building course data...')

    // Read the markdown file
    const markdownPath = join(projectRoot, 'public', 'courses.md')
    const markdownContent = readFileSync(markdownPath, 'utf-8')

    console.log(`📄 Read markdown file: ${markdownContent.length} characters`)

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
      buildTimestamp: new Date().toISOString()
    }

    // Write the JSON file
    const jsonPath = join(projectRoot, 'public', 'courses.json')
    writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2))

    console.log('✅ Course data built successfully!')
    console.log(`📚 Total courses: ${parsedData.courses.length}`)
    console.log(`📋 Categories: ${parsedData.categories.length}`)
    console.log(`⚡ Special rules: ${parsedData.specialRules.length}`)
    console.log(`🗂️ Department mappings: ${parsedData.departmentMappings?.size || 0}`)
    console.log(`💾 JSON file written to: ${jsonPath}`)
  } catch (error) {
    console.error('❌ Error building course data:', error)
    process.exit(1)
  }
}

buildCourseData()
