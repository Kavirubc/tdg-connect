import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import {connectToDatabase} from '@/lib/mongodb';
import Question from '@/models/Question';

export async function GET() {
    await connectToDatabase();
    const questions = await Question.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ questions });
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { heading, question, anonymous } = await req.json();
    if (!heading || !question) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    await connectToDatabase();
    const newQuestion = await Question.create({
        heading,
        question,
        userId: session.user.id,
        userName: session.user.name,
        anonymous: !!anonymous,
    });
    return NextResponse.json({ question: newQuestion });
}
