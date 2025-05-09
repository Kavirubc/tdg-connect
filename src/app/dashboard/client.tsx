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

interface RankingInfo {
    rank: number;
    tier: string;
}

export default function DashboardClient({ session }: { session: Session | null }) {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [totalConnections, setTotalConnections] = useState(0);
    const [rankingInfo, setRankingInfo] = useState<RankingInfo>({ rank: 0, tier: 'Newcomer' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [generatingStarter, setGeneratingStarter] = useState(false);
    const [activeConversationStarter, setActiveConversationStarter] = useState<ActiveConversationStarter>({ connectionId: null, text: '' });

    // Calculate ranking based on total connections
    const calculateRanking = (connectionCount: number): RankingInfo => {
        if (connectionCount === 0) return { rank: 0, tier: 'Newcomer' };

        // Define tiers based on connection count
        if (connectionCount >= 20) return { rank: 1, tier: 'Platinum Networker' };
        if (connectionCount >= 15) return { rank: 2, tier: 'Gold Networker' };
        if (connectionCount >= 10) return { rank: 3, tier: 'Silver Networker' };
        if (connectionCount >= 7) return { rank: 4, tier: 'Bronze Networker' };
        if (connectionCount >= 5) return { rank: 5, tier: 'Connector' };
        if (connectionCount >= 3) return { rank: 6, tier: 'Socializer' };

        return { rank: 7, tier: 'Beginner' };
    };

    useEffect(() => {
        async function fetchConnections() {
            try {
                const response = await fetch('/api/user/connections');
                if (!response.ok) {
                    throw new Error('Failed to fetch connections');
                }
                const data = await response.json();
                setConnections(data.allConnections || []);
                setTotalConnections(data.totalConnections);
                setRankingInfo(calculateRanking(data.totalConnections));
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

    const activeConnections = connections.filter(conn => !conn.isDisconnected);

    return (
        <div className="space-y-6">
            {/* Welcome banner */}
            <div className="community-card p-6 bg-gradient-to-r from-[#c2e0f0] to-[#e6d7c4]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#333333] mb-2">Welcome to Your Community</h1>
                        <p className="text-[#555555]">Connect with others and build meaningful relationships</p>
                    </div>
                    <Link
                        href="/connections"
                        className="community-btn community-btn-primary w-full md:w-auto whitespace-nowrap"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        Add Connection
                    </Link>
                </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="community-card p-5 text-center">
                    <div className="mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-[#7bb5d3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div className="text-sm text-[#777777] uppercase tracking-wide">My Network</div>
                    <div className="text-3xl font-bold text-[#333333] mt-1">{totalConnections}</div>
                    <div className="text-sm text-[#777777] mt-1">
                        connections
                        {totalConnections > activeConnections.length &&
                            <span> ({activeConnections.length} active)</span>}
                    </div>
                </div>

                <div className="community-card p-5 text-center">
                    <div className="mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-[#d1b89c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                    </div>
                    <div className="text-sm text-[#777777] uppercase tracking-wide">Your Code</div>
                    <div className="text-3xl font-mono font-bold text-[#333333] mt-1">{session?.user?.code ?? "-"}</div>
                    <div className="text-sm text-[#777777] mt-1">share to connect</div>
                </div>

                <div className="community-card p-5 text-center sm:col-span-2 lg:col-span-1">
                    <div className="mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-[#7bb5d3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                    </div>
                    <div className="text-sm text-[#777777] uppercase tracking-wide">Event Ranking</div>
                    <div className="text-3xl font-bold text-[#333333] mt-1">
                        {totalConnections > 0 ? '#' + rankingInfo.rank : 'N/A'}
                    </div>
                    <div className="text-sm text-[#777777] mt-1">
                        {totalConnections > 0 ? rankingInfo.tier : 'Make connections to earn a rank!'}
                    </div>
                </div>
            </div>

            {/* Connections section */}
            <div className="community-card p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[#333333] flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#7bb5d3]" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                        Your Connections
                    </h2>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7bb5d3]"></div>
                        <p className="mt-4 text-[#777777]">Loading your connections...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
                ) : connections.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#c2e0f0] flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#7bb5d3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <p className="text-[#555555] mb-4">You haven&apos;t connected with anyone yet.</p>
                        <Link
                            href="/connections"
                            className="community-btn community-btn-primary"
                        >
                            Make Your First Connection
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-[#f0f0f0]">
                        {connections.map((connection) => (
                            <div
                                key={connection._id}
                                className={`py-5 first:pt-0 last:pb-0 ${connection.isDisconnected ? 'opacity-70' : ''}`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <div className="flex items-center">
                                            <h3 className="font-semibold text-lg text-[#333333]">{connection.name}</h3>
                                            {connection.isDisconnected && (
                                                <span className="ml-2 text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded-full">
                                                    Disconnected
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[#777777] text-sm mt-1">Code: {connection.code}</p>

                                        {connection.interests?.length > 0 && (
                                            <div className="mt-3">
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {connection.interests.map((interest: string, i: number) => (
                                                        <span
                                                            key={i}
                                                            className="community-tag"
                                                        >
                                                            {interest}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {!connection.isDisconnected && (
                                        <button
                                            className={`community-btn text-sm py-2 px-4 transition-colors rounded-full 
                                                ${generatingStarter && activeConversationStarter.connectionId === connection._id
                                                    ? 'bg-gray-100 text-gray-500 cursor-wait'
                                                    : 'bg-[#e6d7c4] text-[#b29777] hover:bg-[#d1b89c] hover:text-white'
                                                }`}
                                            onClick={() => generateConversationStarter(connection)}
                                            disabled={generatingStarter}
                                        >
                                            {generatingStarter && activeConversationStarter.connectionId === connection._id
                                                ? 'Generating...'
                                                : 'Get Conversation Starter'}
                                        </button>
                                    )}
                                </div>

                                {activeConversationStarter.connectionId === connection._id &&
                                    activeConversationStarter.text && (
                                        <div className="mt-4 p-4 bg-[#f8f7f4] border border-[#e6d7c4] rounded-lg">
                                            <p className="text-sm font-semibold text-[#b29777] mb-2">Conversation Starter:</p>
                                            <p className="text-[#555555]">{activeConversationStarter.text}</p>
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
