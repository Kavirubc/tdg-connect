import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

interface Connection {
    user: Record<string, unknown>; // Use a more specific type instead of any
    isDisconnected: boolean;
}

export async function GET() {
    try {
        await connectToDatabase();

        // Get the authenticated user from the session
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Find the user and populate their active connections
        const user = await User.findById(session.user.id)
            .populate({
                path: 'connections.user',
                select: 'name code interests facts email _id'
            });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Filter out disconnected connections and transform the data structure
        const activeConnections = user.connections
            .filter((conn: Connection) => !conn.isDisconnected)
            .map((conn: Connection) => ({
                _id: conn.user._id,
                name: conn.user.name,
                code: conn.user.code,
                email: conn.user.email,
                interests: conn.user.interests,
                facts: conn.user.facts
            }));

        return NextResponse.json({
            connections: activeConnections,
            totalConnections: activeConnections.length
        });
    } catch (error) {
        console.error('Error fetching connections:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}