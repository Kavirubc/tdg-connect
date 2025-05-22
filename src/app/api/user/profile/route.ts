import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';

export async function PATCH(req: NextRequest) {
    try {
        await connectToDatabase();
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { name, email, interests, facts } = await req.json();
        if (!name || !email) {
            return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
        }
        const update = {
            name,
            email,
            interests: Array.isArray(interests) ? interests : [],
            facts: Array.isArray(facts) ? facts : [],
        };
        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            { $set: update },
            { new: true, runValidators: true, fields: { password: 0 } }
        );
        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({
            message: 'Profile updated successfully', user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                code: updatedUser.code,
                nic: updatedUser.nic,
                organization: updatedUser.organization,
                inviteImageUrl: updatedUser.inviteImageUrl,
                interests: updatedUser.interests,
                facts: updatedUser.facts,
                connections: updatedUser.connections
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}