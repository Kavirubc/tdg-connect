import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.email !== 'hapuarachchikaviru@gmail.com') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        // Verify admin password as an additional security layer
        const adminPassword = process.env.ADMIN_PASS;

        if (!adminPassword) {
            return NextResponse.json({ error: 'Admin password not configured' }, { status: 500 });
        }

        // Connect to the database
        await connectToDatabase();

        // Fetch all users with their connections information
        const users = await User.find({})
            .populate({
                path: 'connections.user',
                select: 'name email code interests facts _id',
            })
            .select('name email code interests facts connections createdAt');

        // Format the response
        const formattedUsers = users.map(user => {
            // Convert Mongoose document to plain object
            const userObj = user.toObject();

            // Format connections for easier consumption by the client
            const formattedConnections = (userObj.connections as Array<any>).map((conn: any) => {
                // Sometimes user might be null if it was deleted
                if (!conn.user) {
                    return {
                        _id: conn._id,
                        name: 'Deleted User',
                        email: 'deleted@example.com',
                        code: 'N/A',
                        isDisconnected: true
                    };
                }

                return {
                    _id: conn.user._id,
                    name: conn.user.name,
                    email: conn.user.email,
                    code: conn.user.code,
                    interests: conn.user.interests,
                    facts: conn.user.facts,
                    isDisconnected: conn.isDisconnected
                };
            });

            return {
                ...userObj,
                connections: formattedConnections
            };
        });

        return NextResponse.json({ users: formattedUsers });
    } catch (error) {
        console.error('Error in admin users API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}