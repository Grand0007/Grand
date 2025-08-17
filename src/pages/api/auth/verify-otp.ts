import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyOTP, findOrCreateUser, generateJWT } from '@/lib/auth';
import { AuthResponse, OTPVerification } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AuthResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { email, otp }: OTPVerification = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const isValidOTP = verifyOTP(email, otp);
    
    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Find or create user
    const user = await findOrCreateUser(email);
    
    // Generate JWT token
    const token = generateJWT(user);

    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token,
      user
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}