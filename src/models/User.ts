import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUser, UserRole } from '../types';

/**
 * User Schema - defines the structure of user documents in MongoDB
 * This includes all user information, authentication, and relationships
 */
const UserSchema: Schema = new Schema(
    {
        firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
        },
        lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
        },
        email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email address'
        ]
        },
        password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't return password in queries by default
        },
        role: {
        type: String,
        enum: Object.values(UserRole),
        default: UserRole.STUDENT
        },
        avatar: {
        type: String,
        default: 'https://via.placeholder.com/150'
        },
        bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters']
        },
        enrolledCourses: [{
        type: Schema.Types.ObjectId,
        ref: 'Course'
        }],
        createdCourses: [{
        type: Schema.Types.ObjectId,
        ref: 'Course'
        }],
        isVerified: {
        type: Boolean,
        default: false
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date
    },
    {
        timestamps: true // Automatically adds createdAt and updatedAt fields
    }
);


UserSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generate salt (random data added to password before hashing)
        const salt = await bcrypt.genSalt(10);
        
        // Hash the password with the salt
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

/**
 * METHOD: Compare entered password with hashed password in database
 * @param candidatePassword - The password to check
 * @returns Promise<boolean> - true if passwords match
 */
UserSchema.methods.comparePassword = async function (
    candidatePassword: string
    ): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
    };

/**
 * METHOD: Generate JWT Token for authentication
 * @returns string - JWT token
 */
UserSchema.methods.getSignedJwtToken = function (): string {
    return jwt.sign(
        { 
        id: this._id,
        role: this.role,
        email: this.email
        },
        process.env.JWT_SECRET || 'default-secret-key',
        {
        expiresIn: process.env.JWT_EXPIRE || '7d'
        }
    );
};

// Create and export the User model
const User = mongoose.model<IUser>('User', UserSchema);

export default User;