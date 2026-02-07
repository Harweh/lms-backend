import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';
import { extractToken, verifyToken } from '../utils/jwt';

/**
 * MIDDLEWARE: Protect routes - verify JWT token
 * This middleware checks if the user is authenticated
 * Usage: Add this middleware to any route that requires authentication
 */
export const protect = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
    ): Promise<void> => {
    try {
        // 1. Extract token from Authorization header
        const token = extractToken(req.headers.authorization);

    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Not authorized. Please login to access this resource.'
        });
        return;
    }

    // 2. Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please login again.'
        });
        return;
    }

    // 3. Attach user info to request object
    req.user = decoded;
    
    next(); // Proceed to next middleware or route handler
    } catch (error) {
        res.status(401).json({
        success: false,
        message: 'Authentication failed'
        });
    }
};

/**
 * MIDDLEWARE: Check if user has required role(s)
 * This creates a middleware that checks if the authenticated user has one of the allowed roles
 * @param roles - Array of allowed roles
 * @returns Middleware function
 * 
 * Usage Example:
 * router.post('/courses', protect, authorize([UserRole.INSTRUCTOR, UserRole.ADMIN]), createCourse);
 */
export const authorize = (...roles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        // Check if user exists on request (should be set by protect middleware)
        if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Not authenticated'
        });
        return;
    }

    // Check if user's role is in the allowed roles
    if (!roles.includes(req.user.role)) {
        res.status(403).json({
            success: false,
            message: `Access denied. This resource is only accessible to ${roles.join(', ')} users.`
        });
        return;
        }

        next(); // User has required role, proceed
    };
};

/**
 * MIDDLEWARE: Optional authentication
 * Checks for token but doesn't require it
 * Useful for routes that have different behavior for authenticated vs unauthenticated users
 */
export const optionalAuth = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token = extractToken(req.headers.authorization);

        if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
            req.user = decoded;
        }
    }

    next(); // Proceed regardless of authentication status
    } catch (error) {
        // If there's an error, just proceed without user
        next();
    }
};