import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
  })

  test('should display login form correctly', async ({ page }) => {
    // Check page heading
    await expect(page.getByRole('heading', { name: /Sign in to your account/i })).toBeVisible()
    
    // Check form elements
    await expect(page.getByLabel(/Email address/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Send verification code/i })).toBeVisible()
    
    // Check description
    await expect(page.getByText(/Enter your email to receive a login code/i)).toBeVisible()
  })

  test('should validate email input', async ({ page }) => {
    const emailInput = page.getByLabel(/Email address/i)
    const submitButton = page.getByRole('button', { name: /Send verification code/i })
    
    // Initially button should be disabled for empty email
    await expect(submitButton).toBeDisabled()
    
    // Enter invalid email
    await emailInput.fill('invalid-email')
    await expect(submitButton).toBeEnabled()
    
    // Enter valid email
    await emailInput.fill('test@example.com')
    await expect(submitButton).toBeEnabled()
  })

  test('should show OTP form after email submission', async ({ page }) => {
    // Mock the API response
    await page.route('/api/auth/send-otp', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'OTP sent successfully' })
      })
    })

    // Fill email and submit
    await page.getByLabel(/Email address/i).fill('test@example.com')
    await page.getByRole('button', { name: /Send verification code/i }).click()

    // Wait for OTP form to appear
    await expect(page.getByRole('heading', { name: /Enter verification code/i })).toBeVisible()
    await expect(page.getByLabel(/Verification code/i)).toBeVisible()
    await expect(page.getByText(/We sent a 6-digit code to test@example.com/i)).toBeVisible()
  })

  test('should validate OTP input', async ({ page }) => {
    // Mock the send OTP API
    await page.route('/api/auth/send-otp', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'OTP sent successfully' })
      })
    })

    // Get to OTP step
    await page.getByLabel(/Email address/i).fill('test@example.com')
    await page.getByRole('button', { name: /Send verification code/i }).click()
    await expect(page.getByLabel(/Verification code/i)).toBeVisible()

    const otpInput = page.getByLabel(/Verification code/i)
    const verifyButton = page.getByRole('button', { name: /Verify and sign in/i })

    // Initially button should be disabled
    await expect(verifyButton).toBeDisabled()

    // Enter partial OTP
    await otpInput.fill('123')
    await expect(verifyButton).toBeDisabled()

    // Enter complete OTP
    await otpInput.fill('123456')
    await expect(verifyButton).toBeEnabled()
  })

  test('should complete authentication flow successfully', async ({ page }) => {
    // Mock API responses
    await page.route('/api/auth/send-otp', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'OTP sent successfully' })
      })
    })

    await page.route('/api/auth/verify-otp', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Authentication successful',
          token: 'mock-jwt-token',
          user: {
            id: 'user-123',
            email: 'test@example.com',
            subscription_type: 'free'
          }
        })
      })
    })

    // Complete authentication flow
    await page.getByLabel(/Email address/i).fill('test@example.com')
    await page.getByRole('button', { name: /Send verification code/i }).click()
    
    await expect(page.getByLabel(/Verification code/i)).toBeVisible()
    await page.getByLabel(/Verification code/i).fill('123456')
    await page.getByRole('button', { name: /Verify and sign in/i }).click()

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
  })

  test('should handle OTP sending error', async ({ page }) => {
    // Mock API error response
    await page.route('/api/auth/send-otp', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Invalid email address' })
      })
    })

    await page.getByLabel(/Email address/i).fill('invalid@example.com')
    await page.getByRole('button', { name: /Send verification code/i }).click()

    // Should show error message
    await expect(page.getByText(/Invalid email address/i)).toBeVisible()
  })

  test('should handle OTP verification error', async ({ page }) => {
    // Mock successful send OTP
    await page.route('/api/auth/send-otp', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'OTP sent successfully' })
      })
    })

    // Mock failed verify OTP
    await page.route('/api/auth/verify-otp', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Invalid or expired OTP' })
      })
    })

    // Complete flow with invalid OTP
    await page.getByLabel(/Email address/i).fill('test@example.com')
    await page.getByRole('button', { name: /Send verification code/i }).click()
    
    await expect(page.getByLabel(/Verification code/i)).toBeVisible()
    await page.getByLabel(/Verification code/i).fill('000000')
    await page.getByRole('button', { name: /Verify and sign in/i }).click()

    // Should show error message
    await expect(page.getByText(/Invalid or expired OTP/i)).toBeVisible()
  })

  test('should allow going back to email step', async ({ page }) => {
    // Mock the send OTP API
    await page.route('/api/auth/send-otp', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'OTP sent successfully' })
      })
    })

    // Get to OTP step
    await page.getByLabel(/Email address/i).fill('test@example.com')
    await page.getByRole('button', { name: /Send verification code/i }).click()
    await expect(page.getByLabel(/Verification code/i)).toBeVisible()

    // Click back button
    await page.getByRole('button', { name: /Back to email/i }).click()

    // Should return to email step
    await expect(page.getByRole('heading', { name: /Sign in to your account/i })).toBeVisible()
    await expect(page.getByLabel(/Email address/i)).toBeVisible()
  })

  test('should allow resending OTP', async ({ page }) => {
    let otpRequestCount = 0

    // Mock the send OTP API
    await page.route('/api/auth/send-otp', async (route) => {
      otpRequestCount++
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'OTP sent successfully' })
      })
    })

    // Get to OTP step
    await page.getByLabel(/Email address/i).fill('test@example.com')
    await page.getByRole('button', { name: /Send verification code/i }).click()
    await expect(page.getByLabel(/Verification code/i)).toBeVisible()

    // Click resend
    await page.getByRole('button', { name: /Didn't receive the code\? Resend/i }).click()

    // Should have made two API calls
    expect(otpRequestCount).toBe(2)
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check that form is still usable on mobile
    await expect(page.getByRole('heading', { name: /Sign in to your account/i })).toBeVisible()
    await expect(page.getByLabel(/Email address/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Send verification code/i })).toBeVisible()
  })
})