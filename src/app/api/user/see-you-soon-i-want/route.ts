import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        // Find the user
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Find all users whose _id is in the current user's seeYouSoon array
        const usersIWantToMeet = await User.find(
            { _id: { $in: user.seeYouSoon || [] } },
            { name: 1, organization: 1, interests: 1, avatarUrl: 1 }
        );

        return NextResponse.json({
            users: usersIWantToMeet,
            count: usersIWantToMeet.length
        });
    } catch (error) {
        console.error('Error fetching users I want to meet:', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}
