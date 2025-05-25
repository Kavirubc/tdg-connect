import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (id) {
        // Return a single user by id
        const user = await User.findById(id, {
            name: 1,
            organization: 1,
            interests: 1,
            facts: 1,
            avatarUrl: 1,
            _id: 1
        }).lean();
        if (!user) return NextResponse.json({ user: null }, { status: 404 });
        return NextResponse.json({ user });
    }
    // Only select public fields
    const users = await User.find({}, {
        name: 1,
        organization: 1,
        interests: 1,
        facts: 1,
        avatarUrl: 1,
        _id: 1
    }).lean();
    return NextResponse.json({ users });
}
