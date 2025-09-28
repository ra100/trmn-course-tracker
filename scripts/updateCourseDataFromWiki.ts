#!/usr/bin/env tsx

/**
 * Script to update course data from TRMN wiki
 * This script scrapes the latest course information from the BuTrain category
 * and updates the local courses.md file
 */

import { writeFileSync } from 'fs'
import { join } from 'path'
import { trmnWikiUtils } from '../src/utils/trmnWikiScraper'
import { logger } from '../src/utils/logger'

async function main() {
  try {
    logger.log('🚀 Starting course data update from TRMN wiki...')

    // Scrape course data from wiki
    const courseData = await trmnWikiUtils.scrapeAllCourses()

    // Write to courses.md file
    const coursesFilePath = join(process.cwd(), 'public', 'courses.md')
    writeFileSync(coursesFilePath, courseData, 'utf-8')

    logger.log('✅ Course data updated successfully!')
    logger.log('📁 Updated file:', coursesFilePath)
  } catch (error) {
    logger.error('❌ Failed to update course data:', error)
    process.exit(1)
  }
}

// Run the script
main()
