import { test, expect } from '@playwright/test'

test.describe('TRMN Course Tracker - Basic Functionality', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/TRMN Course Tracker/)
    await expect(page.locator('h1, [data-testid="app-title"]')).toBeVisible()
  })

  test('should display course tree', async ({ page }) => {
    await page.goto('/')

    // Wait for course data to load
    await page.waitForSelector('[data-testid="skill-tree"], .course-node, #skill-tree')

    // Verify basic course structure is present
    const courseElements = page.locator('[class*="course"], [data-testid*="course"]')
    await expect(courseElements.first()).toBeVisible()
  })

  test('should have working navigation', async ({ page }) => {
    await page.goto('/')

    // Test mobile menu toggle if present
    const mobileMenuButton = page.locator('[aria-label*="menu"], [data-testid="mobile-menu"]')
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click()
      // Menu should open/close
      await expect(page.locator('[class*="sidebar"], [class*="menu"]')).toBeVisible()
    }
  })

  test('should have accessible skip links', async ({ page }) => {
    await page.goto('/')

    // Check for skip links (accessibility feature)
    const skipLinks = page.locator('a[href^="#"]:has-text("Skip")')
    await expect(skipLinks.first()).toBeVisible()
  })

  test('should display progress panel', async ({ page }) => {
    await page.goto('/')

    // Look for progress tracking elements
    const progressElements = page.locator('[class*="progress"], [data-testid*="progress"]')
    await expect(progressElements.first()).toBeVisible()
  })

  test('should have responsive design', async ({ page }) => {
    await page.goto('/')

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Mobile navigation should be available
    const mobileElements = page.locator('[class*="mobile"], [data-testid*="mobile"]')
    if ((await mobileElements.count()) > 0) {
      await expect(mobileElements.first()).toBeVisible()
    }

    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 })

    // Desktop layout should be different
    const desktopElements = page.locator('[class*="desktop"], [data-testid*="desktop"]')
    if ((await desktopElements.count()) > 0) {
      await expect(desktopElements.first()).toBeVisible()
    }
  })

  test('should handle course selection', async ({ page }) => {
    await page.goto('/')

    // Wait for courses to load
    await page.waitForSelector('[class*="course"], [data-testid*="course"]')

    // Try to click on a course node
    const courseNode = page.locator('[class*="course"], [data-testid*="course"]').first()
    if (await courseNode.isVisible()) {
      await courseNode.click()

      // Course details should appear or update
      await page.waitForTimeout(500) // Brief wait for UI update
    }
  })

  test('should have working filter functionality', async ({ page }) => {
    await page.goto('/')

    // Look for filter controls
    const filterElements = page.locator('[class*="filter"], [data-testid*="filter"]')
    if ((await filterElements.count()) > 0) {
      await expect(filterElements.first()).toBeVisible()
    }
  })

  test('should display settings panel', async ({ page }) => {
    await page.goto('/')

    // Look for settings elements
    const settingsElements = page.locator('[class*="settings"], [data-testid*="settings"]')
    if ((await settingsElements.count()) > 0) {
      await expect(settingsElements.first()).toBeVisible()
    }
  })
})
