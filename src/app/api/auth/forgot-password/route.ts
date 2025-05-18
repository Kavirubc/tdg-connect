import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
    try {
        await connectToDatabase();

        const { email, code, newPassword } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // If only email is provided, check if user exists
        if (!code && !newPassword) {
            const user = await User.findOne({ email });
            if (!user) {
                // For security reasons, don't reveal that the email doesn't exist
                return NextResponse.json({
                    message: 'If your email is registered, you will need your 4-digit registration code to reset your password'
                });
            }

            return NextResponse.json({
                message: 'If your email is registered, you will need your 4-digit registration code to reset your password',
                userExists: true
            });
        }

        // If code and new password are provided, reset the password
        if (code && newPassword) {
            // Validate password strength
            const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
            if (!passwordRegex.test(newPassword)) {
                return NextResponse.json({
                    error: 'Password must be at least 8 characters with at least one uppercase letter, one number, and one special character'
                }, { status: 400 });
            }

            const user = await User.findOne({ email, code });
            if (!user) {
                return NextResponse.json({ error: 'Invalid email or code' }, { status: 400 });
            }

            // Hash the new password
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update user's password
            user.password = hashedPassword;
            await user.save();

            return NextResponse.json({ message: 'Password has been reset successfully' });
        }

        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    // This handler is for password reset (code + newPassword)
    return POST(request);
}
