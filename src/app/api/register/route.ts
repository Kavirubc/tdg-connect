import { NextResponse, NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';

function generateUniqueCode(existingCodes: string[]) {
    let code;
    do {
        code = Math.floor(1000 + Math.random() * 9000).toString(); // Generate 4-digit code
    } while (existingCodes.includes(code));
    return code;
}

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const { name, email, password, interests, facts } = await req.json();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const existingCodes = (await User.find({}, 'code')).map((user) => user.code);
        const uniqueCode = generateUniqueCode(existingCodes);

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            code: uniqueCode,
            interests,
            facts,
        });

        await newUser.save();

        return NextResponse.json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}