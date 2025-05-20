"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatAvatarUrl, getAvatarApiFallbackUrl } from "@/lib/avatar-utils";
import { trackDiscoverView, trackSeeYouSoon } from "@/lib/posthog";
import useTrackClick from '@/lib/useTrackClick';

// Add a type for User
interface DiscoverUser {
    _id: string;
    name: string;
    organization: string;
    interests: string[];
    facts: string[];
    avatarUrl?: string;
}

export default function DiscoverPage() {
    const { data: session } = useSession();
    const currentUserId = session?.user?.id;

    const [users, setUsers] = useState<DiscoverUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<DiscoverUser | null>(null);
    const [seeYouSoon, setSeeYouSoon] = useState<{ [userId: string]: boolean }>({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const trackClick = useTrackClick();

    useEffect(() => {
        setLoading(true);
        // Track discover page view
        trackDiscoverView();

        fetch("/api/discover")
            .then((res) => res.json())
            .then((data) => {
                setUsers(data.users || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching users:", err);
                setLoading(false);
            });
    }, []);

    const handleSeeYouSoon = async (userId: string) => {
        if (!users.length) return;
        if (userId === currentUserId) return; // Prevent clicking for yourself
        await fetch(`/api/connections/see-you-soon`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
        });
        // Track "See You Soon" action
        trackSeeYouSoon(currentUserId || 'anonymous');
        setSeeYouSoon((prev) => ({ ...prev, [userId]: true }));
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.interests.some(interest => interest.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (selectedUser) {
        return (
            <div className="max-w-lg mx-auto mt-8 lumo-card p-6">
                <button
                    className="mb-4 lumo-btn text-[#7bb5d3] hover:text-[#5a9cbf] flex items-center font-medium bg-white"
                    onClick={trackClick}
                    aria-label="Back to Discover"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Discover
                </button>
                <div className="text-center">
                    {selectedUser.avatarUrl ? (
                        <img
                            src={formatAvatarUrl(selectedUser.avatarUrl)}
                            alt={selectedUser.name + "'s avatar"}
                            className="w-24 h-24 rounded-full object-cover mb-4 mx-auto border-2 border-[#7bb5d3]"
                            onError={(e) => {
                                const currentSrc = (e.currentTarget as HTMLImageElement).src;
                                // If already using API fallback, show default
                                if (currentSrc.includes('/api/user/avatar/')) {
                                    e.currentTarget.src = '/userAvatar/default.png';
                                    return;
                                }
                                // Try API fallback
                                const fallbackUrl = getAvatarApiFallbackUrl(selectedUser.avatarUrl);
                                if (fallbackUrl) {
                                    (e.currentTarget as HTMLImageElement).src = fallbackUrl;
                                } else {
                                    e.currentTarget.src = '/userAvatar/default.png';
                                }
                            }}
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-[#e6f2ff] flex items-center justify-center mb-4 mx-auto border-2 border-[#7bb5d3]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#7bb5d3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    )}
                    <h2 className="text-2xl font-bold mb-2 text-[#333333]">{selectedUser.name}</h2>
                    <p className="mb-4 text-[#5a95b5] font-medium">{selectedUser.organization}</p>
                </div>

                <div className="bg-[#f9f9f9] p-4 rounded-lg mb-4">
                    <h3 className="font-bold text-[#333333] mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#d1b89c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Fun Facts
                    </h3>
                    <ul className="list-disc ml-6 space-y-1 text-[#555555]">
                        {selectedUser.facts?.map((fact, i) => (
                            <li key={i}>{fact}</li>
                        ))}
                    </ul>
                </div>

                <div className="bg-[#f9f9f9] p-4 rounded-lg mb-6">
                    <h3 className="font-bold text-[#333333] mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#d1b89c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Interests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {selectedUser.interests?.map((interest, i) => (
                            <span key={i} className="lumo-tag">
                                {interest}
                            </span>
                        ))}
                    </div>
                </div>

                {selectedUser._id !== currentUserId ? (
                    <button
                        className="lumo-btn lumo-btn-primary w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors"
                        onClick={e => { trackClick(e); handleSeeYouSoon(selectedUser._id); }}
                        disabled={seeYouSoon[selectedUser._id]}
                        aria-label="See You There"
                    >
                        {seeYouSoon[selectedUser._id] ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                See you there!
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                                See you there
                            </>
                        )}
                    </button>
                ) : null}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 pb-12 pt-8">
            {/* Hero banner - new UI design */}
            <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#2f78c2] to-[#31b3e3] text-white shadow-lg mb-8">
                <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
                    <img src="/grid-bg.svg" alt="Grid background" className="w-full h-full object-cover" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 md:p-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight drop-shadow">Discover People</h1>
                        <p className="text-white/90 max-w-lg text-lg md:text-xl font-medium drop-shadow">Connect with other attendees before the event.</p>
                    </div>
                </div>
            </section>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7bb5d3]"></div>
                </div>
            ) : filteredUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.map((user) => (
                        <div
                            key={user._id}
                            className="lumo-card p-4 bg-white rounded-lg shadow hover:shadow-lg cursor-pointer transition-shadow"
                            onClick={e => { trackClick(e); setSelectedUser(user); }}
                            aria-label={`User Card: ${user.name}`}
                        >
                            <div className="flex items-center mb-3">
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
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#7bb5d3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="ml-3">
                                    <h2 className="text-lg font-semibold text-[#333333]">{user.name}</h2>
                                    <p className="text-sm text-[#5a95b5]">{user.organization}</p>
                                </div>
                            </div>
                            {user.interests.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {user.interests.slice(0, 3).map((interest, i) => (
                                        <span key={i} className="lumo-tag">
                                            {interest}
                                        </span>
                                    ))}
                                    {user.interests.length > 3 && (
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                                            +{user.interests.length - 3} more
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className="mt-3 text-right">
                                <span className="text-[#7bb5d3] text-sm inline-flex items-center">
                                    View Profile
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 lumo-card bg-white rounded-lg shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-700 mb-1">No results found</h3>
                    <p className="text-gray-500">Try different search terms or clear the search.</p>
                    {searchQuery && (
                        <button
                            onClick={trackClick}
                            className="mt-4 lumo-btn text-[#7bb5d3] hover:text-[#5a9cbf] font-medium bg-white"
                            aria-label="Clear Search"
                        >
                            Clear Search
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
