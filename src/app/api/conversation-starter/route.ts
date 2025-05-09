import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';
import { authOptions } from '@/lib/auth';

const conversationStarters = [
    "What is your favorite hobby and why?",
    "If you could travel anywhere in the world, where would you go?",
    "What is a skill you'd like to learn or improve?",
    "What is your favorite book or movie and what do you love about it?",
    "What is something you're passionate about?",
    "What is a goal you're currently working towards?",
    "What is your favorite type of music?",
    "If you could have any superpower, what would it be?",
    "What is your favorite way to relax and unwind?",
    "What is something that always makes you laugh?"
];

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        const user = await User.findById(session.user.id).populate('connections.user');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const activeConnections = user.connections.filter((conn: { isDisconnected: boolean }) => !conn.isDisconnected);

        if (activeConnections.length === 0) {
            return NextResponse.json({ starter: "You don't have any active connections yet. Connect with someone to start a conversation!" });
        }

        // Get a random active connection
        const randomConnection = activeConnections[Math.floor(Math.random() * activeConnections.length)];
        const connectionUser = randomConnection.user; // This is the populated user object

        // Get a random conversation starter
        const randomStarter = conversationStarters[Math.floor(Math.random() * conversationStarters.length)];

        // Personalize the starter if possible
        let personalizedStarter = `Ask ${connectionUser.name}: ${randomStarter}`;

        // Example of further personalization based on shared interests (if available)
        if (user.interests && connectionUser.interests) {
            const commonInterests = user.interests.filter((interest: string) => connectionUser.interests.includes(interest));
            if (commonInterests.length > 0) {
                personalizedStarter += ` You both like ${commonInterests.join(', ')}.`;
            }
        }

        return NextResponse.json({ starter: personalizedStarter, connectionName: connectionUser.name });

    } catch (error) {
        console.error("Error fetching conversation starter:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}