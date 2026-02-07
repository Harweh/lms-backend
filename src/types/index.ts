import { Request } from "express";
import { Document } from "mongoose";
import { Interface } from "node:readline";

export enum UserRole {
    STUDENT = 'student',
    INSTRUCTOR = 'instructor',
    ADMIN = 'admin'
}

export enum CourseLevel {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced'
}

// User interface

export interface IUser extends Document {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
    avatar?: string;
    bio?: string;
    createdAt: Date;
    updatedAt: Date;
    enrolledCourses?: string[];
    createdCourses?: string[];
    isVerified: boolean;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;

    
    comparePassword(candidatePassword: string): Promise<boolean>;
    getSignedJwtToken(): string;
}

// Course Interface

export interface ICourse extends Document {
    _id: string;
    title: string;
    description: string;
    instructor: string;
    category: string;
    level: CourseLevel;
    price: number;
    thumbnail?: string;
    previewVideo?: string;
    lessons?: string[];
    requirements?: string[];
    whatYouWillLearn?: string[];
    enrolledStudents?: string[];
    rating?: IRating[];
    averageRating?: number;
    totalEnrollments: number;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}


// Rating Interface

export interface IRating {
    user: string;
    rating: number;
    review: string;
    createdAt: Date;
}

// Lesson Interface

export interface ILesson extends Document {
    _id: string;
    course: string | ICourse;
    title: string;
    description: string;
    videoUrl: string;
    duration: number;
    order: number;
    resources: IResource[];
    isPreview: boolean;
    createdAt: Date;
}

// Resource Interface

export interface IResource {
    title: string;
    fileUrl: string;
    fileType: string;
}

// Enrollment Interface

export interface IEnrollment extends Document {
    _id: string;
    student: string | IUser;
    course: string | ICourse;
    progress: IProgress[];
    enrolledAt: Date;
    completedAt?: Date;
    certificateIssued: boolean;
    certificateUrl?: string;
}

// Progress Interface

export interface IProgress {
    lesson: string;
    completed: boolean;
    completedAt?: Date;
    watchTime: number;
}

// Extend Exress Request with authenticated user

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: UserRole;
        email: string;
    };
}

// JWT Payload Interface

export interface JWTPayload {
    id: string;
    role: UserRole;
    email: string;
}