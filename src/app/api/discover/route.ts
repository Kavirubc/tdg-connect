import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
    await connectToDatabase();
    // Only select public fields
    const users = await User.find({}, {
        name: 1,
        organization: 1,
        interests: 1,
        facts: 1,
        _id: 1
    }).lean();
    return NextResponse.json({ users });
}
