import jwt from 'jsonwebtoken';
import { getEmailClient, getCosmosContainer, CONTAINERS } from './azure';
import { User } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET!;
const OTP_EXPIRY_MINUTES = 10;

// In-memory OTP storage (in production, use Redis or Cosmos DB)
const otpStorage = new Map<string, { otp: string; expires: number }>();

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOTP = (email: string, otp: string): void => {
  const expires = Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000);
  otpStorage.set(email, { otp, expires });
};

export const verifyOTP = (email: string, providedOTP: string): boolean => {
  const stored = otpStorage.get(email);
  if (!stored) return false;
  
  if (Date.now() > stored.expires) {
    otpStorage.delete(email);
    return false;
  }
  
  const isValid = stored.otp === providedOTP;
  if (isValid) {
    otpStorage.delete(email);
  }
  
  return isValid;
};

export const sendOTP = async (email: string, otp: string): Promise<boolean> => {
  try {
    const emailClient = getEmailClient();
    
    const emailMessage = {
      senderAddress: "noreply@airesume.com",
      content: {
        subject: "Your AI Resume Builder Login Code",
        plainText: `Your login code is: ${otp}\n\nThis code will expire in ${OTP_EXPIRY_MINUTES} minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">AI Resume Builder</h2>
            <p>Your login code is:</p>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">
              ${otp}
            </div>
            <p style="color: #6b7280;">This code will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>
            <p style="color: #6b7280;">If you didn't request this code, please ignore this email.</p>
          </div>
        `
      },
      recipients: {
        to: [{ address: email }]
      }
    };
    
    await emailClient.beginSend(emailMessage);
    return true;
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return false;
  }
};

export const generateJWT = (user: User): string => {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      subscription: user.subscription_type 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyJWT = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const findOrCreateUser = async (email: string): Promise<User> => {
  const container = getCosmosContainer(CONTAINERS.USERS);
  
  try {
    // Try to find existing user
    const { resources } = await container.items
      .query({
        query: 'SELECT * FROM c WHERE c.email = @email',
        parameters: [{ name: '@email', value: email }]
      })
      .fetchAll();
    
    if (resources.length > 0) {
      // Update last login
      const user = resources[0] as User;
      user.last_login = new Date().toISOString();
      await container.item(user.id).replace(user);
      return user;
    }
    
    // Create new user
    const newUser: User = {
      id: uuidv4(),
      email,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      subscription_type: 'free'
    };
    
    await container.items.create(newUser);
    return newUser;
    
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to find or create user');
  }
};

export const getUserFromToken = async (token: string): Promise<User | null> => {
  const decoded = verifyJWT(token);
  if (!decoded) return null;
  
  try {
    const container = getCosmosContainer(CONTAINERS.USERS);
    const { resource } = await container.item(decoded.userId).read<User>();
    return resource || null;
  } catch (error) {
    return null;
  }
};