import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
    await connectToDatabase();
    // Only select public fields and connection counts
    const users = await User.find({}, {
        name: 1,
        code: 1,
        avatarUrl: 1,
        interests: 1,
        facts: 1,
        connections: 1,
        createdAt: 1
    }).lean();

    // Format leaderboard: sort by total connections (descending)
    const leaderboard = users.map(user => ({
        _id: user._id,
        name: user.name,
        code: user.code,
        avatarUrl: user.avatarUrl,
        interests: user.interests,
        facts: user.facts,
        totalConnections: (user.connections || []).length,
        activeConnections: (user.connections || []).filter((c: any) => !c.isDisconnected).length,
        createdAt: user.createdAt
    })).sort((a, b) => b.totalConnections - a.totalConnections);

    return NextResponse.json({ users: leaderboard });
}
