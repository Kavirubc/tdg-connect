import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';

interface Connection {
    user: string;
    isDisconnected: boolean;
}

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const { userCode, connectionCode } = await req.json();

        if (userCode === connectionCode) {
            return NextResponse.json({ error: 'You cannot connect with yourself' }, { status: 400 });
        }

        const user = await User.findOne({ code: userCode });
        const connection = await User.findOne({ code: connectionCode });

        if (!user || !connection) {
            return NextResponse.json({ error: 'Invalid user or connection code' }, { status: 404 });
        }

        // Check if connection already exists
        const existingConnection = user.connections?.find(
            (c: Connection) => c.user.toString() === connection._id.toString()
        );

        if (existingConnection) {
            if (existingConnection.isDisconnected) {
                // If they were disconnected before, reconnect them
                existingConnection.isDisconnected = false;
                const otherConnection = connection.connections?.find(
                    (c: Connection) => c.user.toString() === user._id.toString()
                );
                if (otherConnection) {
                    otherConnection.isDisconnected = false;
                }
            } else {
                return NextResponse.json({ error: 'Connection already exists' }, { status: 400 });
            }
        } else {
            // Add new connection to both users
            user.connections.push({
                user: mongoose.Types.ObjectId.createFromHexString(connection._id.toString()),
                isDisconnected: false
            });

            connection.connections.push({
                user: mongoose.Types.ObjectId.createFromHexString(user._id.toString()),
                isDisconnected: false
            });
        }

        await user.save();
        await connection.save();

        // Return the connected user's public data for client use
        return NextResponse.json({
            message: 'Connection recorded successfully',
            connection: {
                _id: connection._id,
                name: connection.name,
                code: connection.code,
                email: connection.email,
                interests: connection.interests,
                isDisconnected: false
            }
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await connectToDatabase();

        // Get the authenticated user from the session
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { connectionId } = await req.json();
        if (!connectionId) {
            return NextResponse.json({ error: 'Connection ID is required' }, { status: 400 });
        }

        // Find the current user
        const currentUser = await User.findById(session.user.id);
        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Find the connection in the user's connections
        const userConnection = currentUser.connections.find(
            (conn: Connection) => conn.user.toString() === connectionId && !conn.isDisconnected
        );

        if (!userConnection) {
            return NextResponse.json({ error: 'Active connection not found' }, { status: 404 });
        }

        // Find the connection user
        const connectionUser = await User.findById(connectionId);
        if (!connectionUser) {
            return NextResponse.json({ error: 'Connection user not found' }, { status: 404 });
        }

        // Set isDisconnected to true for both users
        userConnection.isDisconnected = true;

        const otherConnection = connectionUser.connections.find(
            (conn: Connection) => conn.user.toString() === session.user.id && !conn.isDisconnected
        );

        if (otherConnection) {
            otherConnection.isDisconnected = true;
        }

        await currentUser.save();
        await connectionUser.save();

        return NextResponse.json({ message: 'Connection disconnected successfully' });
    } catch (error) {
        console.error('Error disconnecting connection:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}