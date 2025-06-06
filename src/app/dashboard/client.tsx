"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Session } from "next-auth";
import Swal from 'sweetalert2';
import InvitationView from '@/components/InvitationView';
import { formatAvatarUrl, getAvatarApiFallbackUrl } from '@/lib/avatar-utils';
import usePageViewTracking from '@/lib/tracking-hooks';
import useTrackClick from '@/lib/useTrackClick';
import Image from 'next/image';

interface Connection {
    _id: string;
    name: string;
    code: string;
    email: string;
    interests: string[];
    isDisconnected?: boolean;
    emailShared?: boolean;
}

interface ActiveConversationStarter {
    connectionId: string | null;
    text: string;
}

interface RankingInfo {
    rank: number;
    tier: string;
}

interface UserData {
    _id: string;
    name: string;
    email: string;
    inviteImageUrl?: string;
}

export default function DashboardClient({ session, userData }: { session: Session | null, userData: UserData | null }) {
    usePageViewTracking(); // <-- Call at the top level, not inside useEffect

    const [connections, setConnections] = useState<Connection[]>([]);
    const [totalConnections, setTotalConnections] = useState(0);
    const [rankingInfo, setRankingInfo] = useState<RankingInfo>({ rank: 0, tier: 'Newcomer' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [generatingStarter, setGeneratingStarter] = useState(false);
    const [activeConversationStarter, setActiveConversationStarter] = useState<ActiveConversationStarter>({ connectionId: null, text: '' });
    const [activeTab, setActiveTab] = useState('overview');
    const [seeYouSoonUsers, setSeeYouSoonUsers] = useState<any[]>([]);
    const [seeYouSoonCount, setSeeYouSoonCount] = useState(0);
    const [seeYouSoonLoading, setSeeYouSoonLoading] = useState(true);

    // --- Add state for 'People I Want to Meet' ---
    const [seeYouSoonIWantUsers, setSeeYouSoonIWantUsers] = useState<any[]>([]);
    const [seeYouSoonIWantCount, setSeeYouSoonIWantCount] = useState(0);
    const [seeYouSoonIWantLoading, setSeeYouSoonIWantLoading] = useState(true);

    const [conversationStarters, setConversationStarters] = useState<Record<string, string[]>>({});

    // Leaderboard state
    const [leaderboardUsers, setLeaderboardUsers] = useState<any[]>([]);
    const [leaderboardLoading, setLeaderboardLoading] = useState(true);
    const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

    const [sharedEmails, setSharedEmails] = useState<Record<string, boolean>>({});

    const trackClick = useTrackClick();

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
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to fetch your connections',
                    icon: 'error',
                    confirmButtonColor: '#2f78c2'
                });
            } finally {
                setLoading(false);
            }
        }
        fetchConnections();

        async function fetchSeeYouSoon() {
            setSeeYouSoonLoading(true);
            try {
                const res = await fetch('/api/user/see-you-soon');
                const data = await res.json();
                setSeeYouSoonUsers(data.users || []);
                setSeeYouSoonCount(data.count || 0);
            } catch (err) {
                setSeeYouSoonUsers([]);
                setSeeYouSoonCount(0);
            } finally {
                setSeeYouSoonLoading(false);
            }
        }
        fetchSeeYouSoon();

        async function fetchSeeYouSoonIWant() {
            setSeeYouSoonIWantLoading(true);
            try {
                const res = await fetch('/api/user/see-you-soon-i-want');
                const data = await res.json();
                setSeeYouSoonIWantUsers(data.users || []);
                setSeeYouSoonIWantCount(data.count || 0);
            } catch (err) {
                setSeeYouSoonIWantUsers([]);
                setSeeYouSoonIWantCount(0);
            } finally {
                setSeeYouSoonIWantLoading(false);
            }
        }
        fetchSeeYouSoonIWant();

        async function fetchLeaderboard() {
            setLeaderboardLoading(true);
            try {
                const res = await fetch('/api/leaderboard');
                if (!res.ok) throw new Error('Failed to fetch leaderboard');
                const data = await res.json();
                setLeaderboardUsers(data.users);
            } catch (err: any) {
                setLeaderboardError('Failed to load leaderboard');
            } finally {
                setLeaderboardLoading(false);
            }
        }
        fetchLeaderboard();
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
                throw new Error('Failed to generate conversation starters');
            }

            const data = await response.json();
            setConversationStarters(prev => ({
                ...prev,
                [connection._id]: data.starters || [],
            }));
            setActiveConversationStarter({ connectionId: connection._id, text: '' });

            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Conversation starters generated!',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (err) {
            console.error('Error generating conversation starters:', err);
            setActiveConversationStarter({
                connectionId: connection._id,
                text: 'Failed to generate conversation starters. Please try again.'
            });

            Swal.fire({
                title: 'Error',
                text: 'Failed to generate conversation starters',
                icon: 'error',
                confirmButtonColor: '#2f78c2'
            });
        } finally {
            setGeneratingStarter(false);
        }
    }

    const copyCode = () => {
        if (session?.user?.code) {
            navigator.clipboard.writeText(session.user.code);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Code copied to clipboard!',
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

    const activeConnections = connections.filter(conn => !conn.isDisconnected);

    // Update shareViaEmail function to set sharedEmails:
    function shareViaEmail(connectionId: string, connectionName: string) {
        fetch(`/api/connections/share-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ connectionId }),
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to share email');
                setSharedEmails(prev => ({ ...prev, [connectionId]: true }));
                Swal.fire({
                    title: 'Email Sent!',
                    text: `Your contact information has been shared with ${connectionName}.`,
                    icon: 'success',
                    confirmButtonColor: '#2f78c2'
                });
            })
            .catch(() => {
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to share via email',
                    icon: 'error',
                    confirmButtonColor: '#2f78c2'
                });
            });
    }

    return (
        <div className="space-y-8 lumo-fade-in">
            {/* Hero banner */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#2f78c2] to-[#31b3e3] text-white">
                <div className="absolute inset-0 opacity-10">
                    <Image
                        src="/grid-bg.svg"
                        alt="Grid background"
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                </div>
                <div className="relative p-8 md:p-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Welcome, {session?.user?.name?.split(' ')[0] || 'Friend'}!</h1>
                            <p className="text-white/80 max-w-lg">Your community dashboard gives you an overview of your connections and community standing.</p>
                        </div>
                        <Link
                            href="/connections"
                            className="lumo-btn bg-white text-[#2f78c2] py-3 px-6 rounded-full hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-md flex items-center justify-center whitespace-nowrap font-medium"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                            </svg>
                            Add Connection
                        </Link>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 border-b border-gray-200 mb-6">
                <button
                    className={`py-2 px-4 font-semibold ${activeTab === 'overview' ? 'border-b-4 border-[#2f78c2] text-[#2f78c2]' : 'text-gray-500'}`}
                    onClick={e => { trackClick(e); setActiveTab('overview'); }}
                    aria-label="Tab: Overview"
                >
                    Overview
                </button>
                <button
                    className={`py-2 px-4 font-semibold ${activeTab === 'seeYouThere' ? 'border-b-4 border-[#2f78c2] text-[#2f78c2]' : 'text-gray-500'}`}
                    onClick={e => { trackClick(e); setActiveTab('seeYouThere'); }}
                    aria-label="Tab: See You There"
                >
                    See You There {seeYouSoonCount > 0 ? `(${seeYouSoonCount})` : ''}
                </button>
                <button
                    className={`py-2 px-4 font-semibold ${activeTab === 'seeYouThereIWant' ? 'border-b-4 border-[#2f78c2] text-[#2f78c2]' : 'text-gray-500'}`}
                    onClick={e => { trackClick(e); setActiveTab('seeYouThereIWant'); }}
                    aria-label="Tab: People I Want to Meet"
                >
                    People I Want to Meet {seeYouSoonIWantCount > 0 ? `(${seeYouSoonIWantCount})` : ''}
                </button>
            </div>

            {activeTab === 'seeYouThere' && (
                <div className="lumo-card p-6">
                    <h2 className="text-2xl font-bold mb-4 text-[#2f78c2]">People Who Clicked "See You There"</h2>
                    {seeYouSoonLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#2f78c2]"></div>
                        </div>
                    ) : seeYouSoonUsers.length === 0 ? (
                        <div className="text-gray-500 text-center py-8">No one has clicked "See You There" for you yet.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {seeYouSoonUsers.map((user) => (
                                <div key={user._id} className="p-4 bg-[#f9f9f9] rounded-lg shadow hover:shadow-md transition-all hover:translate-y-[-4px] flex items-center gap-4">
                                    {user.avatarUrl ? (
                                        <img
                                            src={formatAvatarUrl(user.avatarUrl)}
                                            alt={user.name + "'s avatar"}
                                            className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                            onError={(e) => {
                                                const currentSrc = (e.currentTarget as HTMLImageElement).src;
                                                // If already using API fallback, show default
                                                if (currentSrc.includes('/api/user/avatar/')) {
                                                    e.currentTarget.src = '/userAvatar/default.png';
                                                    return;
                                                }
                                                // Try API fallback
                                                const fallbackUrl = getAvatarApiFallbackUrl(user.avatarUrl);
                                                if (fallbackUrl) {
                                                    (e.currentTarget as HTMLImageElement).src = fallbackUrl;
                                                } else {
                                                    e.currentTarget.src = '/userAvatar/default.png';
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-[#e6f2ff] flex items-center justify-center border border-gray-200">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2f78c2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-semibold text-[#333333]">{user.name}</div>
                                        <div className="text-sm text-[#2f78c2]">{user.organization}</div>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {user.interests?.slice(0, 2).map((interest: string, i: number) => (
                                                <span key={i} className="lumo-tag">{interest}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'seeYouThereIWant' && (
                <div className="lumo-card p-6">
                    <h2 className="text-2xl font-bold mb-4 text-[#2f78c2]">People I Want to Meet</h2>
                    {seeYouSoonIWantLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#2f78c2]"></div>
                        </div>
                    ) : seeYouSoonIWantUsers.length === 0 ? (
                        <div className="text-gray-500 text-center py-8">You haven't clicked "See You There" for anyone yet.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {seeYouSoonIWantUsers.map((user) => (
                                <div key={user._id} className="p-4 bg-[#f9f9f9] rounded-lg shadow hover:shadow-md transition-all hover:translate-y-[-4px] flex items-center gap-4">
                                    {user.avatarUrl ? (
                                        <img
                                            src={formatAvatarUrl(user.avatarUrl)}
                                            alt={user.name + "'s avatar"}
                                            className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                            onError={(e) => {
                                                const currentSrc = (e.currentTarget as HTMLImageElement).src;
                                                // If already using API fallback, show default
                                                if (currentSrc.includes('/api/user/avatar/')) {
                                                    e.currentTarget.src = '/userAvatar/default.png';
                                                    return;
                                                }
                                                // Try API fallback
                                                const fallbackUrl = getAvatarApiFallbackUrl(user.avatarUrl);
                                                if (fallbackUrl) {
                                                    (e.currentTarget as HTMLImageElement).src = fallbackUrl;
                                                } else {
                                                    e.currentTarget.src = '/userAvatar/default.png';
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-[#e6f2ff] flex items-center justify-center border border-gray-200">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2f78c2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-semibold text-[#333333]">{user.name}</div>
                                        <div className="text-sm text-[#2f78c2]">{user.organization}</div>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {user.interests?.slice(0, 2).map((interest: string, i: number) => (
                                                <span key={i} className="lumo-tag">{interest}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'overview' && (
                <>
                    {/* Stats cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="lumo-card p-6 border border-gray-100">
                            <div className="flex items-center mb-4">
                                <div className="bg-[#81b6f1]/20 p-3 rounded-full mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2f78c2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">My Network</div>
                                    <div className="flex items-baseline">
                                        <div className="text-3xl font-bold text-[#333333]">{totalConnections}</div>
                                        <div className="text-sm text-gray-500 ml-2">connections</div>
                                    </div>
                                    {totalConnections > activeConnections.length && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            ({activeConnections.length} active)
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-2">
                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                    <div
                                        className="bg-[#2f78c2] h-1.5 rounded-full"
                                        style={{ width: `${Math.min(100, (totalConnections / 20) * 100)}%` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1 text-right">
                                    {totalConnections}/20 to reach Platinum
                                </div>
                            </div>
                        </div>

                        <div className="lumo-card p-6 border border-gray-100">
                            <div className="flex items-center mb-4">
                                <div className="bg-[#a9e2f5]/20 p-3 rounded-full mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#31b3e3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Your Code</div>
                                    <div className="flex items-baseline">
                                        <div className="text-2xl font-mono font-bold text-[#333333]">{session?.user?.code ?? "-"}</div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">share to connect</div>
                                </div>
                            </div>
                            <button
                                className="mt-2 w-full py-2 border border-[#31b3e3] text-[#31b3e3] rounded-md text-sm hover:bg-[#a9e2f5]/20 transition-colors"
                                onClick={copyCode}
                            >
                                Copy Code
                            </button>
                        </div>

                        <div className="lumo-card p-6 border border-gray-100 sm:col-span-2 lg:col-span-1">
                            <div className="flex items-center mb-4">
                                <div className="bg-[#b0a7ec]/20 p-3 rounded-full mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#6a57d1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Community Rank</div>
                                    <div className="flex items-baseline">
                                        <div className="text-2xl font-bold text-[#333333]">
                                            {totalConnections > 0 ? rankingInfo.tier : 'Newcomer'}
                                        </div>
                                        {totalConnections > 0 && (
                                            <div className="text-sm text-gray-500 ml-2">#{rankingInfo.rank}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                                {totalConnections > 0
                                    ? `You're in the top ${rankingInfo.rank * 10}% of community members!`
                                    : 'Make connections to earn a rank!'}
                            </div>
                        </div>
                    </div>

                    {/* Daily Grind Invitation Section */}
                    {userData && (
                        <div className="mb-8">
                            <InvitationView user={userData} compact={true} />
                        </div>
                    )}

                    {/* Leaderboard Card */}
                    <div className="lumo-card p-6 border border-gray-100 mb-8">
                        <h2 className="text-xl font-bold text-[#2f78c2] mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#2f78c2]" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.049 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            Community Leaderboard
                        </h2>
                        {leaderboardLoading ? (
                            <div className="py-8 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2f78c2]"></div>
                                <p className="mt-4 text-[#777777]">Loading leaderboard...</p>
                            </div>
                        ) : leaderboardError ? (
                            <div className="bg-red-50 text-red-700 p-4 rounded-lg">{leaderboardError}</div>
                        ) : (
                            <ol className="divide-y divide-gray-100">
                                {leaderboardUsers.slice(0, 10).map((user, idx) => {
                                    const isCurrent = session?.user?.email === user.email;
                                    return (
                                        <li key={user._id} className={`flex items-center py-3 ${isCurrent ? 'bg-[#e6f2ff]' : ''} rounded-md px-2`}>
                                            <span className="text-lg font-bold w-8 text-center text-[#2f78c2]">{idx + 1}</span>
                                            {user.avatarUrl ? (
                                                <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 mx-2" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-[#e6f2ff] flex items-center justify-center border border-gray-200 mx-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#2f78c2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className={`font-semibold truncate ${isCurrent ? 'text-[#2f78c2]' : 'text-[#333333]'}`}>{user.name}</div>
                                                <div className="text-xs text-gray-500 truncate">
                                                    {user.emailShared ? user.email : <span className="italic text-gray-400">Contact info hidden</span>}
                                                </div>
                                            </div>
                                            <span className="ml-4 text-base font-mono text-[#2f78c2]">{user.totalConnections} <span className="text-xs text-gray-500">connections</span></span>
                                            {user.activeConnections !== user.totalConnections && (
                                                <span className="ml-2 text-xs text-gray-400">({user.activeConnections} active)</span>
                                            )}
                                            {isCurrent && <span className="ml-2 px-2 py-0.5 bg-[#2f78c2] text-white text-xs rounded-full">You</span>}
                                        </li>
                                    );
                                })}
                            </ol>
                        )}
                    </div>

                    {/* Connections section */}
                    <div className="lumo-card p-6 border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-[#2f78c2] flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#2f78c2]" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                </svg>
                                Your Connections
                            </h2>
                            <Link href="/connections" className="text-sm text-[#2f78c2] hover:underline">
                                View All
                            </Link>
                        </div>

                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2f78c2]"></div>
                                <p className="mt-4 text-[#777777]">Loading your connections...</p>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
                        ) : connections.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#81b6f1]/20 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#2f78c2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <p className="text-[#555555] mb-4">You haven&apos;t connected with anyone yet.</p>
                                <Link
                                    href="/connections"
                                    className="lumo-btn lumo-btn-primary py-3 px-6 rounded-full shadow-md inline-flex items-center justify-center"
                                >
                                    Make Your First Connection
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {connections.slice(0, 3).map((connection) => (
                                    <div
                                        key={connection._id}
                                        className={`p-5 border border-gray-100 rounded-lg hover:shadow-md transition-all hover:translate-y-[-4px] ${connection.isDisconnected ? 'opacity-70' : ''}`}
                                    >
                                        <div className="flex items-center mb-3">
                                            <div className="w-12 h-12 bg-[#81b6f1]/20 rounded-full flex items-center justify-center mr-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2f78c2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-[#333333]">{connection.name}</h3>
                                                <p className="text-[#777777] text-sm">
                                                    Code: {connection.code}
                                                    {sharedEmails[connection._id] ? (
                                                        <span className="ml-2">| Email: {connection.email}</span>
                                                    ) : (
                                                        <button className="ml-2 text-xs text-[#2f78c2] underline" onClick={() => shareViaEmail(connection._id, connection.name)} disabled={sharedEmails[connection._id]}>
                                                            {sharedEmails[connection._id] ? 'Shared' : 'Share Email'}
                                                        </button>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {connection.interests?.length > 0 && (
                                            <div className="mt-3">
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {connection.interests.slice(0, 3).map((interest: string, i: number) => (
                                                        <span
                                                            key={i}
                                                            className="lumo-tag"
                                                        >
                                                            {interest}
                                                        </span>
                                                    ))}
                                                    {connection.interests.length > 3 && (
                                                        <span className="text-xs text-gray-500">+{connection.interests.length - 3} more</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {!connection.isDisconnected && (
                                            <button
                                                className="mt-4 w-full text-center py-2 px-4 border border-[#2f78c2] text-[#2f78c2] rounded-md text-sm hover:bg-[#81b6f1]/20 transition-colors"
                                                onClick={() => generateConversationStarter(connection)}
                                                disabled={generatingStarter}
                                            >
                                                {generatingStarter && activeConversationStarter.connectionId === connection._id
                                                    ? 'Generating...'
                                                    : 'Start Conversation'}
                                            </button>
                                        )}

                                        {activeConversationStarter.connectionId === connection._id && activeConversationStarter.text && (
                                            <div className="mt-3 p-3 bg-[#81b6f1]/20 rounded-md">
                                                <p className="text-sm text-[#333333]">{activeConversationStarter.text}</p>
                                            </div>
                                        )}

                                        {conversationStarters[connection._id] && conversationStarters[connection._id].length > 0 && (
                                            <div className="mt-3 p-3 bg-[#81b6f1]/20 rounded-md">
                                                <ul className="list-decimal list-inside space-y-1">
                                                    {conversationStarters[connection._id].map((starter, idx) => (
                                                        <li key={idx} className="text-sm text-[#333333]">{starter}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {connections.length > 3 && (
                                    <Link
                                        href="/connections"
                                        className="flex flex-col items-center justify-center p-5 border border-dashed border-gray-200 rounded-lg hover:bg-gray-50 transition-colors hover:translate-y-[-4px]"
                                    >
                                        <div className="w-12 h-12 bg-[#81b6f1]/20 rounded-full flex items-center justify-center mb-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2f78c2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                        <p className="text-[#2f78c2] font-medium">View All {connections.length} Connections</p>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
