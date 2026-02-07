import mongoose from 'mongoose';

const connectDatabase = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(process.env.DATABASE_URL as string);
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);
    } catch (error) {
        console.error(' MongoDB Connection Error:', error);
        process.exit(1);
    }
};


mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err);
    });

export default connectDatabase;