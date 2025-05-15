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

        // Find all users who have the current user in their seeYouSoon array
        const friendsWhoClickedSeeYouSoon = await User.find(
            { seeYouSoon: { $in: [user._id.toString()] } },
            { name: 1, organization: 1, interests: 1, avatarUrl: 1 }
        );

        return NextResponse.json({
            users: friendsWhoClickedSeeYouSoon,
            count: friendsWhoClickedSeeYouSoon.length
        });
    } catch (error) {
        console.error('Error fetching see you soon connections:', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}
