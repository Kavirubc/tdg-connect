import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// Function to generate a unique 4-digit code
async function generateUniqueCode(): Promise<string> {
    let code = '';
    let isUnique = false;
    while (!isUnique) {
        code = Math.floor(1000 + Math.random() * 9000).toString();
        const existingUser = await User.findOne({ code });
        if (!existingUser) {
            isUnique = true;
        }
    }
    return code;
}

export async function POST(request: Request) {
    try {
        await connectToDatabase();

        const { name, email, password, phone, interests, facts } = await request.json();

        // Basic validation
        if (!name || !email || !password || !phone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate unique code
        const uniqueCode = await generateUniqueCode();

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            code: uniqueCode,
            phone,
            interests: interests || [],
            facts: facts || [],
            connections: []
        });

        await newUser.save();

        return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}