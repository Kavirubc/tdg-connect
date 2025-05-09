import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

interface Connection {
    user: string;
    isDisconnected: boolean;
}

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        // Get the authenticated user from the session
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { connectionId } = await req.json();
        if (!connectionId) {
            return NextResponse.json({ error: 'Connection ID is required' }, { status: 400 });
        }

        // Find the current user
        const currentUser = await User.findById(session.user.id);
        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if connectionId is in the user's connections
        const isConnected = currentUser.connections.some(
            (conn: Connection) => conn.user.toString() === connectionId && !conn.isDisconnected
        );

        if (!isConnected) {
            return NextResponse.json({ error: 'Not connected to this user' }, { status: 403 });
        }

        // In a real app, you might want to implement a more complex system where 
        // the other user gets notified and needs to accept your request to share emails
        // For now, we'll just return success to indicate emails can be shared
        return NextResponse.json({
            message: 'Email shared successfully',
            success: true
        });
    } catch (error) {
        console.error('Error sharing email:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}