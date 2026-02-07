import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

/**
 * Generate JWT Token
 * @param payload - Data to encode in the token
 * @returns JWT token string
 */
export const generateToken = (payload: JWTPayload): string => {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET || 'default-secret-key',
        {
        expiresIn: process.env.JWT_EXPIRE || '7d'
        }
    );
};

/**
 * Verify JWT Token
 * @param token - JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export const verifyToken = (token: string): JWTPayload | null => {
    try {
        const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'default-secret-key'
        ) as JWTPayload;
        
        return decoded;
    } catch (error) {
        return null;
    }
};

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value
 * @returns Token string or null
 */
export const extractToken = (authHeader: string | undefined): string | null => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

  return authHeader.substring(7); // Remove 'Bearer ' prefix
};