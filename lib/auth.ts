import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'editor' | 'user';
}

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

export const extractTokenFromRequest = (request: NextRequest): string | null => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
};

export const authenticateRequest = (request: NextRequest): JWTPayload | null => {
  const token = extractTokenFromRequest(request);
  if (!token) {
    return null;
  }
  return verifyToken(token);
};

export const requireAuth = (
  request: NextRequest,
  requiredRole?: 'admin' | 'editor'
): { success: true; user: JWTPayload } | { success: false; error: string } => {
  const user = authenticateRequest(request);
  
  if (!user) {
    return { success: false, error: 'Authentication required' };
  }
  
  if (requiredRole) {
    const roleHierarchy = { admin: 3, editor: 2, user: 1 };
    const userLevel = roleHierarchy[user.role];
    const requiredLevel = roleHierarchy[requiredRole];
    
    if (userLevel < requiredLevel) {
      return { success: false, error: 'Insufficient permissions' };
    }
  }
  
  return { success: true, user };
};

export const generateAccessCode = (): string => {
  return Math.random().toString(36).substring(2, 10);
};