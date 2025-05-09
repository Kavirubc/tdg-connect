import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

// Define a type for the cached mongoose instance
type MongooseCache = {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
};

// Global type augmentation for the mongoose cache
declare global {
    var mongoose: MongooseCache | undefined;
}

// Initialize and access the global mongoose instance with proper null checking
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

export async function connectToDatabase() {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
        }).then((mongoose) => mongoose);
    }
    cached.conn = await cached.promise;
    global.mongoose = cached;
    return cached.conn;
}
