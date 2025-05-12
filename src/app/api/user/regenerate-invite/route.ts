import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';
import { generateUserInvite } from '@/lib/email-utils';

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user from database
        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Generate new invite image
        const inviteResult = await generateUserInvite(user.name, user.code);
        const { publicUrl } = inviteResult;

        // Update user with new image URL (store the public URL in the database)
        user.inviteImageUrl = publicUrl;
        await user.save();

        return NextResponse.json({
            message: 'Invitation image regenerated successfully',
            inviteImageUrl: publicUrl
        });
    } catch (error) {
        console.error('Error regenerating invitation image:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
