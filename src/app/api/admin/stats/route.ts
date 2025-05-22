import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function GET() {
    // Only allow the admin email and admin pass
    const session = await getServerSession(authOptions);
    const adminPassword = process.env.ADMIN_PASS;
    if (!session || session.user?.email !== 'hapuarachchikaviru@gmail.com' || !adminPassword) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Optionally, you can require the admin pass to be sent as a query param or header for extra security
    // For now, just check that it's set

    await connectToDatabase();

    // User stats
    const users = await User.find({}).lean();
    const totalUsers = users.length;
    let totalConnections = 0;
    let activeConnections = 0;
    let totalFacts = 0;
    let totalInterests = 0;
    let usersWithAvatar = 0;
    let usersWithInvites = 0;
    let earliestUser: string | null = null;
    let latestUser: string | null = null;

    // Per-user stats
    let avatarGenerationsByUser: Record<string, number> = {};
    let conversationStartersByUser: Record<string, number> = {};

    users.forEach(user => {
        const userId = typeof user._id === 'string' ? user._id : user._id?.toString?.() || '';
        totalConnections += (user.connections?.length || 0);
        activeConnections += (user.connections?.filter((c: any) => !c.isDisconnected).length || 0);
        totalFacts += (user.facts?.length || 0);
        totalInterests += (user.interests?.length || 0);
        if (user.avatarUrl) usersWithAvatar++;
        if (user.inviteImageUrl) usersWithInvites++;
        if (!earliestUser || user.createdAt < earliestUser) earliestUser = user.createdAt as string;
        if (!latestUser || user.createdAt > latestUser) latestUser = user.createdAt as string;
        // Avatar generations: tracked as avatarPromptAttempts
        avatarGenerationsByUser[userId] = user.avatarPromptAttempts || 0;
        // Conversation starters: count how many times this user has generated starters
        conversationStartersByUser[userId] = user.conversationStartersGenerated || 0;
    });

    // Count invites in public/invites
    let inviteImageCount = 0;
    try {
        const invitesDir = path.join(process.cwd(), 'public', 'invites');
        if (fs.existsSync(invitesDir)) {
            inviteImageCount = fs.readdirSync(invitesDir).length;
        }
    } catch { }

    // No event model, so skip eventCount
    // No ConversationStarter model, so use per-user field
    // No global conversationStarterCount, sum per-user
    const conversationStarterCount = Object.values(conversationStartersByUser).reduce((a, b) => a + b, 0);

    return NextResponse.json({
        totalUsers,
        totalConnections,
        activeConnections: activeConnections / 2, // counted twice
        totalFacts,
        totalInterests,
        usersWithAvatar,
        usersWithInvites,
        inviteImageCount,
        conversationStarterCount,
        conversationStartersByUser,
        avatarGenerationsByUser,
        earliestUser,
        latestUser
    });
}
