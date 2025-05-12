import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { generateUserInvite } from '@/lib/email-utils';

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

        const { name, email, password, phone, nic, organization, interests, facts } = await request.json();

        // Basic validation
        if (!name || !email || !password || !phone || !nic || !organization) {
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

        // Generate user invite with the PNG image first
        let inviteImageUrl = '';
        try {
            console.log('Generating invitation image for new user...');
            const inviteResult = await generateUserInvite(name, uniqueCode);
            inviteImageUrl = inviteResult.publicUrl;
            console.log('Successfully generated invitation image:', inviteImageUrl);
        } catch (inviteError) {
            console.error('Error generating invitation:', inviteError);
            // Continue with the registration even if invite generation fails
        }

        // Create new user with the invitation image URL
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            code: uniqueCode,
            phone,
            nic,
            organization,
            interests: interests || [],
            facts: facts || [],
            connections: [],
            inviteImageUrl: inviteImageUrl // Include the invitation image URL at creation time
        });

        await newUser.save();
        console.log('User saved with ID:', newUser._id, 'and invitation URL:', inviteImageUrl);

        return NextResponse.json({
            message: 'User registered successfully',
            inviteImageUrl: inviteImageUrl // Include the invitation URL in the response for client-side confirmation
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}