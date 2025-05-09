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
        let prompt = `Generate a brief conversation starter question (5-20 words) for ${connectionUser.name}`;

        // Add interests to the prompt if available
        if (connectionUser.interests && connectionUser.interests.length > 0) {
            prompt += ` based on their interests: ${connectionUser.interests.join(', ')}`;
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

        // Generate the conversation starter using OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You generate brief, engaging conversation starters between 5-20 words. Make them personal and specific to the recipient's interests."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 50,
            temperature: 0.7,
        });

        // Get the generated starter
        const generatedStarter = completion.choices[0]?.message?.content?.trim() || "How's your day going?";

        // Format the final starter
        const personalizedStarter = `Ask ${connectionUser.name}: ${generatedStarter}`;

        return NextResponse.json({
            starter: personalizedStarter,
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
        let prompt = `Generate a brief conversation starter question (5-20 words) for ${connectionUser.name}`;

        // Add interests to the prompt if available
        if (connectionUser.interests && connectionUser.interests.length > 0) {
            prompt += ` based on their interests: ${connectionUser.interests.join(', ')}`;
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

        // Generate the conversation starter using OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You generate brief, engaging conversation starters between 5-20 words. Make them personal and specific to the recipient's interests."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 50,
            temperature: 0.7,
        });

        // Get the generated starter
        const generatedStarter = completion.choices[0]?.message?.content?.trim() || "How's your day going?";

        // Format the final starter
        const personalizedStarter = `Ask ${connectionUser.name}: ${generatedStarter}`;

        return NextResponse.json({
            conversationStarter: personalizedStarter
        });

    } catch (error) {
        console.error("Error generating conversation starter:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}