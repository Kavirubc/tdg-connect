"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Session } from "next-auth";

interface Connection {
    _id: string;
    name: string;
    code: string;
    email: string;
    interests: string[];
    isDisconnected?: boolean;
}

interface ActiveConversationStarter {
    connectionId: string | null;
    text: string;
}

export default function DashboardClient({ session }: { session: Session | null }) {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [totalConnections, setTotalConnections] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [generatingStarter, setGeneratingStarter] = useState(false);
    const [activeConversationStarter, setActiveConversationStarter] = useState<ActiveConversationStarter>({ connectionId: null, text: '' });

    useEffect(() => {
        async function fetchConnections() {
            try {
                const response = await fetch('/api/user/connections');
                if (!response.ok) {
                    throw new Error('Failed to fetch connections');
                }
                const data = await response.json();
                setConnections(data.connections);
                setTotalConnections(data.totalConnections);
            } catch (err) {
                setError('Failed to fetch your connections');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchConnections();
    }, []);

    async function generateConversationStarter(connection: Connection) {
        if (generatingStarter) return;

        setGeneratingStarter(true);
        setActiveConversationStarter({ connectionId: connection._id, text: '' });

        try {
            const response = await fetch('/api/conversation-starter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ connectionId: connection._id }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate conversation starter');
            }

            const data = await response.json();
            setActiveConversationStarter({
                connectionId: connection._id,
                text: data.conversationStarter
            });
        } catch (err) {
            console.error('Error generating conversation starter:', err);
            setActiveConversationStarter({
                connectionId: connection._id,
                text: 'Failed to generate a conversation starter. Please try again.'
            });
        } finally {
            setGeneratingStarter(false);
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Your Dashboard</h1>
                    <Link
                        href="/connections"
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Add Connection
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-blue-50 p-4 rounded-lg shadow text-center">
                        <p className="text-gray-600">Total Connections</p>
                        <p className="text-3xl font-bold text-blue-600">{totalConnections}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg shadow text-center">
                        <p className="text-gray-600">Your Code</p>
                        <p className="text-3xl font-bold text-green-600">{session?.user?.code ?? "-"}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg shadow text-center">
                        <p className="text-gray-600">Event Ranking</p>
                        <p className="text-3xl font-bold text-purple-600">
                            {totalConnections > 0 ? '#' + (Math.floor(Math.random() * 10) + 1) : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Your Connections</h2>

                {loading ? (
                    <p className="text-center py-4">Loading your connections...</p>
                ) : error ? (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
                ) : connections.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="text-gray-500 mb-4">You haven&apos;t made any connections yet.</p>
                        <Link
                            href="/connections"
                            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Make Your First Connection
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y">
                        {connections.map((connection) => (
                            <div key={connection._id} className="py-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold text-lg">{connection.name}</h3>
                                        <p className="text-gray-600">Code: {connection.code}</p>
                                    </div>
                                    <button
                                        className={`py-1 px-3 rounded-lg transition-colors ${generatingStarter && activeConversationStarter.connectionId === connection._id
                                                ? 'bg-gray-100 text-gray-500 cursor-wait'
                                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                            }`}
                                        onClick={() => generateConversationStarter(connection)}
                                        disabled={generatingStarter}
                                    >
                                        {generatingStarter && activeConversationStarter.connectionId === connection._id
                                            ? 'Generating...'
                                            : 'Generate Conversation Starter'}
                                    </button>
                                </div>

                                {connection.interests?.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-700">Interests:</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {connection.interests.map((interest: string, i: number) => (
                                                <span
                                                    key={i}
                                                    className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded"
                                                >
                                                    {interest}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeConversationStarter.connectionId === connection._id &&
                                    activeConversationStarter.text && (
                                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <p className="text-sm font-semibold text-gray-700">Conversation Starter:</p>
                                            <p className="text-gray-800 mt-1">{activeConversationStarter.text}</p>
                                        </div>
                                    )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
