import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database';
import { log } from 'console';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Route
app.get('/', (req: Request, res: Response) => {
    res.json({ 
        message: '🚀 LMS API is running!',
        status: 'success' 
    });
    });

    // Server Port
//     const PORT = process.env.PORT || 5100;

//     app.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
//     console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
// });

app.listen(5100, ()=>{
    console.log("🚀 Server is running on http://[localhost:5100");
})