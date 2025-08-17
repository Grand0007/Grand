import { generateOTP, storeOTP, verifyOTP, generateJWT, verifyJWT } from '../auth'
import jwt from 'jsonwebtoken'

// Mock JWT
jest.mock('jsonwebtoken')
const mockJwt = jwt as jest.Mocked<typeof jwt>

describe('Auth Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateOTP', () => {
    it('generates a 6-digit OTP', () => {
      const otp = generateOTP()
      expect(otp).toMatch(/^\d{6}$/)
      expect(otp.length).toBe(6)
    })

    it('generates different OTPs on multiple calls', () => {
      const otp1 = generateOTP()
      const otp2 = generateOTP()
      // While it's possible they could be the same, it's extremely unlikely
      expect(otp1).not.toBe(otp2)
    })
  })

  describe('storeOTP and verifyOTP', () => {
    const email = 'test@example.com'
    const otp = '123456'

    it('stores and verifies OTP correctly', () => {
      storeOTP(email, otp)
      const isValid = verifyOTP(email, otp)
      expect(isValid).toBe(true)
    })

    it('returns false for invalid OTP', () => {
      storeOTP(email, otp)
      const isValid = verifyOTP(email, '654321')
      expect(isValid).toBe(false)
    })

    it('returns false for non-existent email', () => {
      const isValid = verifyOTP('nonexistent@example.com', otp)
      expect(isValid).toBe(false)
    })

    it('removes OTP after successful verification', () => {
      storeOTP(email, otp)
      verifyOTP(email, otp) // First verification should work
      const secondVerification = verifyOTP(email, otp)
      expect(secondVerification).toBe(false)
    })

    it('handles expired OTPs', () => {
      // Mock Date.now to simulate time passing
      const originalDateNow = Date.now
      Date.now = jest.fn(() => 1000000) // Initial time

      storeOTP(email, otp)

      // Fast forward 11 minutes (OTP expires after 10 minutes)
      Date.now = jest.fn(() => 1000000 + (11 * 60 * 1000))

      const isValid = verifyOTP(email, otp)
      expect(isValid).toBe(false)

      // Restore original Date.now
      Date.now = originalDateNow
    })
  })

  describe('generateJWT', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      created_at: '2024-01-01T00:00:00Z',
      last_login: '2024-01-01T00:00:00Z',
      subscription_type: 'free' as const
    }

    it('generates JWT with correct payload', () => {
      const mockToken = 'mock-jwt-token'
      mockJwt.sign.mockReturnValue(mockToken as any)

      const token = generateJWT(mockUser)

      expect(mockJwt.sign).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          email: mockUser.email,
          subscription: mockUser.subscription_type
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      )
      expect(token).toBe(mockToken)
    })
  })

  describe('verifyJWT', () => {
    it('verifies valid JWT token', () => {
      const mockPayload = { userId: 'user-123', email: 'test@example.com' }
      mockJwt.verify.mockReturnValue(mockPayload as any)

      const result = verifyJWT('valid-token')

      expect(mockJwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET)
      expect(result).toEqual(mockPayload)
    })

    it('returns null for invalid JWT token', () => {
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const result = verifyJWT('invalid-token')

      expect(result).toBeNull()
    })

    it('returns null for expired JWT token', () => {
      mockJwt.verify.mockImplementation(() => {
        const error = new Error('Token expired')
        error.name = 'TokenExpiredError'
        throw error
      })

      const result = verifyJWT('expired-token')

      expect(result).toBeNull()
    })
  })
})