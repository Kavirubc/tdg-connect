import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { userId } = await req.json();
    await connectToDatabase();
    const me = await User.findOne({ email: session.user.email });
    if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (!me.seeYouSoon) me.seeYouSoon = [];
    if (!me.seeYouSoon.includes(userId)) {
        me.seeYouSoon.push(userId);
        await me.save();
    }
    return NextResponse.json({ message: 'Marked as see you soon' });
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { userId } = await req.json();
    await connectToDatabase();
    const me = await User.findOne({ email: session.user.email });
    if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (!me.seeYouSoon) me.seeYouSoon = [];
    const idx = me.seeYouSoon.indexOf(userId);
    if (idx !== -1) {
        me.seeYouSoon.splice(idx, 1);
        await me.save();
    }
    return NextResponse.json({ message: 'See you soon undone' });
}
