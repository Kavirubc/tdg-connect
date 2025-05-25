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
                        <Link
                            key={user._id}
                            href={`/discover/${user._id}`}
                            className="lumo-card p-4 bg-white rounded-lg shadow hover:shadow-lg cursor-pointer transition-shadow block"
                            aria-label={`User Card: ${user.name}`}
                            onClick={trackClick}
                        >
                            <div className="flex items-center mb-3">
                                {user.avatarUrl ? (
                                    <img
                                        src={formatAvatarUrl(user.avatarUrl)}
                                        alt={user.name + "'s avatar"}
                                        className="w-12 h-12 rounded-full object-contain bg-white border border-gray-200"
                                        onError={(e) => {
                                            const currentSrc = (e.currentTarget as HTMLImageElement).src;
                                            if (currentSrc.includes('/api/user/avatar/')) {
                                                e.currentTarget.src = '/userAvatar/default.png';
                                                return;
                                            }
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
                        </Link>
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
