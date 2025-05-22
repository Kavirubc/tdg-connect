import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';
import { authOptions } from '@/lib/auth';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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

        // Prepare context for OpenAI prompt
        let prompt = `Generate 5 brief conversation starter questions (5-20 words each) for ${connectionUser.name}`;

        // Add interests and fun facts to the prompt if available
        const allTopics = [];
        if (connectionUser.interests && connectionUser.interests.length > 0) {
            allTopics.push(`interests: ${connectionUser.interests.join(', ')}`);
        }
        if (connectionUser.facts && connectionUser.facts.length > 0) {
            allTopics.push(`fun facts: ${connectionUser.facts.join(', ')}`);
        }
        if (allTopics.length > 0) {
            prompt += ` based on their ${allTopics.join(' and ')}`;
        }

        // Add shared interests if available
        if (user.interests && connectionUser.interests) {
            const commonInterests = user.interests.filter((interest: string) =>
                connectionUser.interests.includes(interest)
            );
            if (commonInterests.length > 0) {
                prompt += `. Include a reference to your shared interests: ${commonInterests.join(', ')}`;
            }
        }

        // Generate the conversation starters using OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You generate 5 brief, engaging conversation starters between 5-20 words each. Return them as a numbered list. Make them personal and specific to the recipient's interests and fun facts."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 200,
            temperature: 0.7,
        });

        // Parse the generated starters as a list
        const content = completion.choices[0]?.message?.content?.trim() || "1. How's your day going?";
        const starters = content.split(/\n\s*\d+\.\s*/).filter(Boolean);
        // If the first item still has a number, remove it
        if (starters.length && /^\d+\./.test(starters[0])) {
            starters[0] = starters[0].replace(/^\d+\.\s*/, '');
        }

        return NextResponse.json({
            starters: starters.slice(0, 5),
            connectionName: connectionUser.name
        });

    } catch (error) {
        console.error("Error generating conversation starter:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        // Get the connectionId from the request body
        const { connectionId } = await request.json();

        if (!connectionId) {
            return NextResponse.json({ error: 'Connection ID is required' }, { status: 400 });
        }

        // Find the user and populate their connections
        const user = await User.findById(session.user.id).populate('connections.user');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Find the specific connection
        const connection = user.connections.find(
            (conn: any) => conn.user._id.toString() === connectionId && !conn.isDisconnected
        );

        if (!connection) {
            return NextResponse.json({ error: 'Connection not found or inactive' }, { status: 404 });
        }

        const connectionUser = connection.user;

        // Prepare context for OpenAI prompt
        let prompt = `Generate 5 brief conversation starter questions (5-20 words each) for ${connectionUser.name}`;

        // Add interests and fun facts to the prompt if available
        const allTopics = [];
        if (connectionUser.interests && connectionUser.interests.length > 0) {
            allTopics.push(`interests: ${connectionUser.interests.join(', ')}`);
        }
        if (connectionUser.facts && connectionUser.facts.length > 0) {
            allTopics.push(`fun facts: ${connectionUser.facts.join(', ')}`);
        }
        if (allTopics.length > 0) {
            prompt += ` based on their ${allTopics.join(' and ')}`;
        }

        // Add shared interests if available
        if (user.interests && connectionUser.interests) {
            const commonInterests = user.interests.filter((interest: string) =>
                connectionUser.interests.includes(interest)
            );

            if (commonInterests.length > 0) {
                prompt += `. Include a reference to your shared interests: ${commonInterests.join(', ')}`;
            }
        }

        // Generate the conversation starters using OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You generate 5 brief, engaging conversation starters between 5-20 words each. Return them as a numbered list. Make them personal and specific to the recipient's interests and fun facts."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 200,
            temperature: 0.7,
        });

        // Parse the generated starters as a list
        const content = completion.choices[0]?.message?.content?.trim() || "1. How's your day going?";
        const starters = content.split(/\n\s*\d+\.\s*/).filter(Boolean);
        // If the first item still has a number, remove it
        if (starters.length && /^\d+\./.test(starters[0])) {
            starters[0] = starters[0].replace(/^\d+\.\s*/, '');
        }

        return NextResponse.json({
            starters: starters.slice(0, 5)
        });

    } catch (error) {
        console.error("Error generating conversation starter:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}