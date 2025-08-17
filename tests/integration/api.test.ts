import { createMocks } from 'node-mocks-http'
import sendOtpHandler from '@/pages/api/auth/send-otp'
import verifyOtpHandler from '@/pages/api/auth/verify-otp'

// Mock the auth functions
jest.mock('@/lib/auth', () => ({
  generateOTP: jest.fn(() => '123456'),
  storeOTP: jest.fn(),
  sendOTP: jest.fn(() => Promise.resolve(true)),
  verifyOTP: jest.fn(),
  findOrCreateUser: jest.fn(),
  generateJWT: jest.fn(() => 'mock-jwt-token')
}))

import { generateOTP, storeOTP, sendOTP, verifyOTP, findOrCreateUser, generateJWT } from '@/lib/auth'

const mockGenerateOTP = generateOTP as jest.MockedFunction<typeof generateOTP>
const mockStoreOTP = storeOTP as jest.MockedFunction<typeof storeOTP>
const mockSendOTP = sendOTP as jest.MockedFunction<typeof sendOTP>
const mockVerifyOTP = verifyOTP as jest.MockedFunction<typeof verifyOTP>
const mockFindOrCreateUser = findOrCreateUser as jest.MockedFunction<typeof findOrCreateUser>
const mockGenerateJWT = generateJWT as jest.MockedFunction<typeof generateJWT>

describe('/api/auth/send-otp', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('successfully sends OTP for valid email', async () => {
    mockGenerateOTP.mockReturnValue('123456')
    mockSendOTP.mockResolvedValue(true)

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com'
      }
    })

    await sendOtpHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      message: 'OTP sent successfully'
    })

    expect(mockGenerateOTP).toHaveBeenCalled()
    expect(mockStoreOTP).toHaveBeenCalledWith('test@example.com', '123456')
    expect(mockSendOTP).toHaveBeenCalledWith('test@example.com', '123456')
  })

  it('returns error for invalid email', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'invalid-email'
      }
    })

    await sendOtpHandler(req, res)

    expect(res._getStatusCode()).toBe(400)
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Valid email is required'
    })
  })

  it('returns error for missing email', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {}
    })

    await sendOtpHandler(req, res)

    expect(res._getStatusCode()).toBe(400)
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Valid email is required'
    })
  })

  it('returns error when OTP sending fails', async () => {
    mockSendOTP.mockResolvedValue(false)

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com'
      }
    })

    await sendOtpHandler(req, res)

    expect(res._getStatusCode()).toBe(500)
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Failed to send OTP email'
    })
  })

  it('returns error for invalid HTTP method', async () => {
    const { req, res } = createMocks({
      method: 'GET'
    })

    await sendOtpHandler(req, res)

    expect(res._getStatusCode()).toBe(405)
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Method not allowed'
    })
  })
})

describe('/api/auth/verify-otp', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2024-01-01T00:00:00Z',
    subscription_type: 'free' as const
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('successfully verifies OTP and returns user data', async () => {
    mockVerifyOTP.mockReturnValue(true)
    mockFindOrCreateUser.mockResolvedValue(mockUser)
    mockGenerateJWT.mockReturnValue('mock-jwt-token')

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        otp: '123456'
      }
    })

    await verifyOtpHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      message: 'Authentication successful',
      token: 'mock-jwt-token',
      user: mockUser
    })

    expect(mockVerifyOTP).toHaveBeenCalledWith('test@example.com', '123456')
    expect(mockFindOrCreateUser).toHaveBeenCalledWith('test@example.com')
    expect(mockGenerateJWT).toHaveBeenCalledWith(mockUser)
  })

  it('returns error for invalid OTP', async () => {
    mockVerifyOTP.mockReturnValue(false)

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        otp: '654321'
      }
    })

    await verifyOtpHandler(req, res)

    expect(res._getStatusCode()).toBe(400)
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      message: 'Invalid or expired OTP'
    })
  })

  it('returns error for missing email or OTP', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com'
        // Missing OTP
      }
    })

    await verifyOtpHandler(req, res)

    expect(res._getStatusCode()).toBe(400)
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      message: 'Email and OTP are required'
    })
  })

  it('handles database errors gracefully', async () => {
    mockVerifyOTP.mockReturnValue(true)
    mockFindOrCreateUser.mockRejectedValue(new Error('Database error'))

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        otp: '123456'
      }
    })

    await verifyOtpHandler(req, res)

    expect(res._getStatusCode()).toBe(500)
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      message: 'Internal server error'
    })
  })

  it('returns error for invalid HTTP method', async () => {
    const { req, res } = createMocks({
      method: 'GET'
    })

    await verifyOtpHandler(req, res)

    expect(res._getStatusCode()).toBe(405)
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      message: 'Method not allowed'
    })
  })
})