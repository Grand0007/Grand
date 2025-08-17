import type { NextApiRequest, NextApiResponse } from 'next';
import { generateOTP, storeOTP, sendOTP } from '@/lib/auth';
import { ApiResponse, OTPRequest } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { email }: OTPRequest = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Valid email is required'
      });
    }

    const otp = generateOTP();
    storeOTP(email, otp);
    
    const emailSent = await sendOTP(email, otp);
    
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        error: 'Failed to send OTP email'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}