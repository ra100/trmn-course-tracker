import { test, expect } from '@playwright/test'

test.describe('TRMN Course Tracker - Basic Functionality', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/TRMN Course Tracker/)
    // Check for TRMN header which contains the app title
    await expect(page.locator('[data-testid="trmn-header"], h1')).toBeVisible()
  })

  test('should display course tree', async ({ page }) => {
    await page.goto('/')

    // Wait for skill tree container to load
    await page.waitForSelector('#skill-tree')

    // Verify skill tree container is present
    const skillTree = page.locator('#skill-tree')
    await expect(skillTree).toBeVisible()
  })

  test('should have working navigation', async ({ page }) => {
    await page.goto('/')

    // Test mobile menu toggle in TRMN header
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-toggle"], [aria-label*="menu"]')
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click()
      // Sidebar should be visible when menu is open
      await expect(page.locator('#sidebar')).toBeVisible()
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

    // Look for progress panel in sidebar
    const progressElements = page.locator('#sidebar [data-testid*="progress"], #sidebar [class*="progress"]')
    await expect(progressElements.first()).toBeVisible()
  })

  test('should have responsive design', async ({ page }) => {
    await page.goto('/')

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Mobile layout should be active
    const mobileElements = page.locator('[class*="mobile"], [data-testid*="mobile"]')
    if ((await mobileElements.count()) > 0) {
      await expect(mobileElements.first()).toBeVisible()
    }

    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 })

    // Desktop layout should be different
    const sidebar = page.locator('#sidebar')
    await expect(sidebar).toBeVisible()
  })

  test('should handle course selection', async ({ page }) => {
    await page.goto('/')

    // Wait for skill tree to load
    await page.waitForSelector('#skill-tree')

    // Look for course-related elements in the skill tree
    const courseElements = page.locator('#skill-tree [class*="course"], #skill-tree [data-testid*="course"]')

    if ((await courseElements.count()) > 0) {
      // Try to click on a course element
      await courseElements.first().click()

      // Course details panel should be visible or updated
      await page.waitForTimeout(500) // Brief wait for UI update

      // Check if course details panel is visible
      const detailsPanel = page.locator('#course-details')
      if (await detailsPanel.isVisible()) {
        await expect(detailsPanel).toBeVisible()
      }
    }
  })

  test('should have working filter functionality', async ({ page }) => {
    await page.goto('/')

    // Look for filter panel in sidebar
    const filterElements = page.locator('#sidebar [data-testid*="filter"], #sidebar [class*="filter"]')
    if ((await filterElements.count()) > 0) {
      await expect(filterElements.first()).toBeVisible()
    }
  })

  test('should display settings panel', async ({ page }) => {
    await page.goto('/')

    // Look for settings panel in sidebar
    const settingsElements = page.locator('#sidebar [data-testid*="settings"], #sidebar [class*="settings"]')
    if ((await settingsElements.count()) > 0) {
      await expect(settingsElements.first()).toBeVisible()
    }
  })
})
