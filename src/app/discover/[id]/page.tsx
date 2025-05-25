"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatAvatarUrl, getAvatarApiFallbackUrl } from "@/lib/avatar-utils";
import { trackSeeYouSoon } from "@/lib/posthog";
import useTrackClick from '@/lib/useTrackClick';

interface DiscoverUser {
    _id: string;
    name: string;
    organization: string;
    interests: string[];
    facts: string[];
    avatarUrl?: string;
}

export default function DiscoverUserPage() {
    const { id } = useParams();
    const { data: session } = useSession();
    const currentUserId = session?.user?.id;
    const [user, setUser] = useState<DiscoverUser | null>(null);
    const [seeYouSoon, setSeeYouSoon] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const trackClick = useTrackClick();

    useEffect(() => {
        setLoading(true);
        fetch(`/api/discover?id=${id}`)
            .then((res) => res.json())
            .then((data) => {
                setUser(data.user || null);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const handleSeeYouSoon = async () => {
        if (!user || user._id === currentUserId) return;
        await fetch(`/api/connections/see-you-soon`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user._id }),
        });
        trackSeeYouSoon(currentUserId || 'anonymous');
        setSeeYouSoon(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7bb5d3]"></div>
            </div>
        );
    }
    if (!user) {
        return (
            <div className="text-center py-12 lumo-card bg-white rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-700 mb-1">User not found</h3>
                <button
                    onClick={() => router.push('/discover')}
                    className="mt-4 lumo-btn text-[#7bb5d3] hover:text-[#5a9cbf] font-medium bg-white"
                >
                    Back to Discover
                </button>
            </div>
        );
    }
    return (
        <div className="max-w-lg mx-auto mt-8 lumo-card p-6">
            <button
                className="mb-4 lumo-btn text-[#7bb5d3] hover:text-[#5a9cbf] flex items-center font-medium bg-white"
                onClick={() => router.push('/discover')}
                aria-label="Back to Discover"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Discover
            </button>
            <div className="text-center">
                {user.avatarUrl ? (
                    <img
                        src={formatAvatarUrl(user.avatarUrl)}
                        alt={user.name + "'s avatar"}
                        className="w-24 h-24 rounded-full object-contain bg-white mb-4 mx-auto border-2 border-[#7bb5d3]"
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
                    <div className="w-24 h-24 rounded-full bg-[#e6f2ff] flex items-center justify-center mb-4 mx-auto border-2 border-[#7bb5d3]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#7bb5d3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                )}
                <h2 className="text-2xl font-bold mb-2 text-[#333333]">{user.name}</h2>
                <p className="mb-4 text-[#5a95b5] font-medium">{user.organization}</p>
            </div>
            <div className="bg-[#f9f9f9] p-4 rounded-lg mb-4">
                <h3 className="font-bold text-[#333333] mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#d1b89c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Fun Facts
                </h3>
                <ul className="list-disc ml-6 space-y-1 text-[#555555]">
                    {user.facts?.map((fact, i) => (
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
                    {user.interests?.map((interest, i) => (
                        <span key={i} className="lumo-tag">
                            {interest}
                        </span>
                    ))}
                </div>
            </div>
            {user._id !== currentUserId ? (
                <button
                    className="lumo-btn lumo-btn-primary w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors"
                    onClick={e => { trackClick(e); handleSeeYouSoon(); }}
                    disabled={seeYouSoon}
                    aria-label="See You There"
                >
                    {seeYouSoon ? (
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
