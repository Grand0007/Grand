import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the main heading and call-to-action', async ({ page }) => {
    // Check main heading
    await expect(page.getByRole('heading', { name: /Transform Your Resume with AI Power/i })).toBeVisible()
    
    // Check description
    await expect(page.getByText(/Get matched with your dream job/i)).toBeVisible()
    
    // Check CTA buttons
    await expect(page.getByRole('link', { name: /Get Started Free/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Learn More/i })).toBeVisible()
  })

  test('should navigate to login page when clicking Get Started', async ({ page }) => {
    await page.getByRole('link', { name: /Get Started Free/i }).first().click()
    await expect(page).toHaveURL('/auth/login')
  })

  test('should display how it works section', async ({ page }) => {
    // Check section heading
    await expect(page.getByRole('heading', { name: /How It Works/i })).toBeVisible()
    
    // Check the three steps
    await expect(page.getByText('1. Upload Resume')).toBeVisible()
    await expect(page.getByText('2. Add Job Description')).toBeVisible()
    await expect(page.getByText('3. Download Enhanced Resume')).toBeVisible()
  })

  test('should display features section', async ({ page }) => {
    // Check features section
    await expect(page.getByRole('heading', { name: /Powerful AI Features/i })).toBeVisible()
    
    // Check individual features
    await expect(page.getByText('AI Content Enhancement')).toBeVisible()
    await expect(page.getByText('ATS Optimization')).toBeVisible()
    await expect(page.getByText('Job Matching')).toBeVisible()
    await expect(page.getByText('Professional Templates')).toBeVisible()
    await expect(page.getByText('Instant Feedback')).toBeVisible()
    await expect(page.getByText('Smart Suggestions')).toBeVisible()
  })

  test('should display footer with correct information', async ({ page }) => {
    // Scroll to footer
    await page.getByText('© 2024 AI Resume Builder').scrollIntoViewIfNeeded()
    
    // Check footer content
    await expect(page.getByText('© 2024 AI Resume Builder. Powered by Azure Cloud Services.')).toBeVisible()
    await expect(page.getByText('Features')).toBeVisible()
    await expect(page.getByText('Support')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check that content is still visible on mobile
    await expect(page.getByRole('heading', { name: /Transform Your Resume with AI Power/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Get Started Free/i })).toBeVisible()
  })

  test('should scroll smoothly to features section', async ({ page }) => {
    // Click "Learn More" button
    await page.getByRole('link', { name: /Learn More/i }).click()
    
    // Check that features section is in view
    await expect(page.getByRole('heading', { name: /Powerful AI Features/i })).toBeInViewport()
  })

  test('should display navigation header correctly', async ({ page }) => {
    // Check logo and brand name
    await expect(page.getByText('AI Resume Builder').first()).toBeVisible()
    
    // Check navigation links for non-authenticated users
    await expect(page.getByRole('link', { name: /Login/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Get Started/i })).toBeVisible()
  })
})

test.describe('Landing Page SEO and Accessibility', () => {
  test('should have proper page title and meta tags', async ({ page }) => {
    await page.goto('/')
    
    // Check page title (this would need to be set in _app.tsx or index.tsx)
    await expect(page).toHaveTitle(/AI Resume Builder/i)
  })

  test('should be accessible', async ({ page }) => {
    await page.goto('/')
    
    // Check for proper heading hierarchy
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toBeVisible()
    
    // Check for proper alt text on images (if any)
    const images = page.getByRole('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      await expect(img).toHaveAttribute('alt')
    }
    
    // Check for proper link text
    const links = page.getByRole('link')
    const linkCount = await links.count()
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i)
      const text = await link.textContent()
      expect(text?.trim()).toBeTruthy()
    }
  })

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/')
    
    // Tab through interactive elements
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: /Login/i })).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: /Get Started/i })).toBeFocused()
  })
})