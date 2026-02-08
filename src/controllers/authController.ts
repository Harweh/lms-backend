import { Request, Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../types';

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * 
 * This is the BACKEND endpoint that receives registration data from the frontend
 */
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
    const { firstName, lastName, email, password, role } = req.body;

    // 1. Validate input
    if (!firstName || !lastName || !email || !password) {
        res.status(400).json({
            success: false,
            message: 'Please provide all required fields'
        });
        return;
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
        res.status(400).json({
            success: false,
            message: 'User with this email already exists'
        });
        return;
    }

    // 3. Create new user (password will be hashed automatically by the User model middleware)
    const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        role: role || 'student' // Default to student if no role specified
    });

    // 4. Generate JWT token
    const token = user.getSignedJwtToken();

    // 5. Send response (don't send password back)
    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            avatar: user.avatar
            },
            token // Frontend will store this token for future requests
        }
        });

    } catch (error: any) {
        console.error('Registration error:', error);
        res.status(500).json({
        success: false,
        message: 'Error registering user',
        error: error.message
        });
    }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 * 
 * This endpoint verifies credentials and returns a JWT token
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
        res.status(400).json({
            success: false,
            message: 'Please provide email and password'
        });
        return;
    }

    // 2. Find user and include password (it's excluded by default in the schema)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
        return;
    }

    // 3. Check if password matches
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
        res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
        return;
    }

    // 4. Generate token
    const token = user.getSignedJwtToken();

    // 5. Send response
    res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
            user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            bio: user.bio
            },
            token
        }
        });

    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({
        success: false,
        message: 'Error logging in',
        error: error.message
        });
    }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 * 
 * This endpoint returns the current user's information
 * The protect middleware ensures only authenticated users can access this
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user?.id);

    if (!user) {
        res.status(404).json({
            success: false,
            message: 'User not found'
        });
        return;
        }

        res.status(200).json({
        success: true,
        data: {
            user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            bio: user.bio,
            enrolledCourses: user.enrolledCourses,
            createdCourses: user.createdCourses,
            createdAt: user.createdAt
            }
        }
        });

    } catch (error: any) {
        res.status(500).json({
        success: false,
        message: 'Error fetching user data',
        error: error.message
        });
    }
};

/**
 * @route   PUT /api/auth/update-profile
 * @desc    Update user profile
 * @access  Private
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
    const { firstName, lastName, bio, avatar } = req.body;

    const user = await User.findById(req.user?.id);

    if (!user) {
        res.status(404).json({
            success: false,
            message: 'User not found'
        });
        return;
    }

    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
        });

    } catch (error: any) {
        res.status(500).json({
        success: false,
        message: 'Error updating profile',
        error: error.message
        });
    }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  // With JWT, logout is handled client-side by removing the token
  // This endpoint exists for consistency and future server-side token blacklisting
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};