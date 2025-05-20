"use client";

import { useState } from 'react';
import Swal from 'sweetalert2';
import useTrackClick from '@/lib/useTrackClick';

interface InvitationViewProps {
    user: {
        _id: string;
        name: string;
        email?: string;
        inviteImageUrl?: string;
    };
    compact?: boolean;
}

export default function InvitationView({ user, compact = false }: InvitationViewProps) {
    const [regeneratingInvite, setRegeneratingInvite] = useState(false);
    const [inviteImageUrl, setInviteImageUrl] = useState(user.inviteImageUrl || '');
    const trackClick = useTrackClick();

    const handleRegenerateInvite = async () => {
        setRegeneratingInvite(true);
        try {
            const response = await fetch('/api/user/regenerate-invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to generate invitation image');
            }

            const data = await response.json();

            // Store both URLs - we'll try the regular one first, fallback to API route if needed
            const publicUrl = data.inviteImageUrl;
            const apiUrl = data.apiImageUrl || `/api/invites/${publicUrl.split('/').pop()}`;

            // Set the primary URL to the public one, we'll fallback to API if needed
            setInviteImageUrl(publicUrl);

            // Also store API URL in localStorage for potential fallback
            if (typeof window !== 'undefined') {
                localStorage.setItem('lastInviteApiUrl', apiUrl);
                localStorage.setItem('lastInvitePublicUrl', publicUrl);
            }

            setRegeneratingInvite(false);

            Swal.fire({
                title: 'Success!',
                text: 'Invitation image generated successfully!',
                icon: 'success',
                confirmButtonColor: '#7bb5d3',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            console.error('Error generating invitation:', err);
            setRegeneratingInvite(false);

            Swal.fire({
                title: 'Error',
                text: 'Failed to generate invitation image. Please try again.',
                icon: 'error',
                confirmButtonColor: '#7bb5d3'
            });
        }
    };

    // Format image URL helper function with API fallback
    const formatImageUrl = (url: string | undefined) => {
        if (!url) return '';

        // First ensure it has the correct /invites/ prefix for normal public path
        const formattedUrl = url.startsWith('/invites/') ? url : `/invites${url}`;

        // Generate API fallback URL (will be used in image onError handler)
        const filename = formattedUrl.split('/').pop();

        // Return the properly formatted URL
        return formattedUrl;
    };

    // Get API URL version for a given image filename
    const getApiFallbackUrl = (url: string | undefined) => {
        if (!url) return '';
        const filename = url.split('/').pop();
        return `/api/invites/${filename}`;
    };

    const cardClass = compact ? "community-card p-4 border border-gray-100" : "community-card p-6 border border-gray-100";
    const titleClass = compact ? "text-xl font-bold text-[#333333]" : "text-2xl font-bold text-[#333333]";

    // If no invite exists, show button to generate one
    if (!user.inviteImageUrl && !inviteImageUrl) {
        return (
            <div className={cardClass}>
                <div className="flex items-center mb-4">
                    <div className="bg-[#f0e6f9] p-3 rounded-full mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#9c7bd1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Daily Grind Season 3</div>
                        <div className={titleClass}>Create Your Invitation</div>
                    </div>
                </div>
                <p className="text-gray-600 mb-4">Generate a shareable image for social media to show you'll be attending Daily Grind Season 3!</p>
                <button
                    onClick={e => { trackClick(e); handleRegenerateInvite(); }}
                    disabled={regeneratingInvite}
                    className="bg-[#7bb5d3] text-white py-2 px-6 rounded-lg hover:bg-[#5a9cbf] transition-all flex items-center mx-auto"
                    aria-label="Generate Invitation Image"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {regeneratingInvite ? 'Generating...' : 'Generate Invitation Image'}
                </button>
            </div>
        );
    }

    // If invite exists, show the invitation view
    return (
        <div className={cardClass}>
            <div className="flex items-center mb-6">
                <div className="bg-[#f0e6f9] p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#9c7bd1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <div>
                    <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Daily Grind Season 3</div>
                    <div className={titleClass}>Your Invitation</div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col items-center">
                    {!compact && (
                        // Debug info block commented out
                        // <div className="bg-gray-100 p-4 mb-4 rounded-lg w-full text-xs">
                        //     <p className="font-mono text-gray-700">Debug info:</p>
                        //     <p className="font-mono text-gray-700">Original URL: {inviteImageUrl || user.inviteImageUrl}</p>
                        //     <p className="font-mono text-gray-700">Formatted URL: {formatImageUrl(inviteImageUrl || user.inviteImageUrl)}</p>
                        //     <p className="font-mono text-gray-700">API Fallback URL: {getApiFallbackUrl(inviteImageUrl || user.inviteImageUrl)}</p>
                        //     <div className="mt-2">
                        //         <button
                        //             onClick={() => window.open(formatImageUrl(inviteImageUrl || user.inviteImageUrl), '_blank')}
                        //             className="bg-blue-500 text-white text-xs px-2 py-1 rounded mr-2"
                        //         >
                        //             Test Public URL
                        //         </button>
                        //         <button
                        //             onClick={() => window.open(getApiFallbackUrl(inviteImageUrl || user.inviteImageUrl), '_blank')}
                        //             className="bg-green-500 text-white text-xs px-2 py-1 rounded"
                        //         >
                        //             Test API URL
                        //         </button>
                        //     </div>
                        // </div>
                        null
                    )}

                    <img
                        src={formatImageUrl(inviteImageUrl || user.inviteImageUrl)}
                        alt="Daily Grind Season 3 Invitation"
                        className="max-w-full rounded-lg shadow-lg mb-4"
                        style={{ maxHeight: compact ? '300px' : '400px' }}
                        onError={(e) => {
                            console.error('Public image URL failed to load, trying API fallback');
                            const imgElement = e.target as HTMLImageElement;
                            const currentSrc = imgElement.src;

                            // If already using API fallback, show SweetAlert to regenerate
                            if (currentSrc.includes('/api/invites/')) {
                                Swal.fire({
                                    title: 'Image Not Found',
                                    text: 'The invitation image could not be generated. Please try generating it again.',
                                    icon: 'error',
                                    showCancelButton: true,
                                    confirmButtonText: 'Generate Again',
                                    cancelButtonText: 'Cancel',
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        handleRegenerateInvite();
                                    }
                                });
                                return;
                            }

                            // Try the API fallback URL
                            const fallbackUrl = getApiFallbackUrl(inviteImageUrl || user.inviteImageUrl);
                            if (fallbackUrl) {
                                imgElement.src = fallbackUrl;
                            } else {
                                Swal.fire({
                                    title: 'Image Not Found',
                                    text: 'The invitation image could not be generated. Please try generating it again.',
                                    icon: 'error',
                                    showCancelButton: true,
                                    confirmButtonText: 'Generate Again',
                                    cancelButtonText: 'Cancel',
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        handleRegenerateInvite();
                                    }
                                });
                            }
                        }}
                    />
                    <p className="text-gray-600 mb-4">Share this image on social media with the hashtag <span className="font-bold">#DailyGrindS3</span></p>

                    {/* Social Media Caption Section - Improved UI and Caption */}
                    <div className="mb-6 flex flex-col items-center w-full">
                        <label className="font-semibold text-gray-700 mb-2 text-base">Suggested Social Media Caption</label>
                        <div className="flex w-full max-w-2xl">
                            <textarea
                                readOnly
                                rows={2}
                                value={`I'm excited to join Daily Grind Season 3! ☕️ Let's connect and grow together on May 27th at Sysco LABS. #DailyGrindS3 #productivity [Tag Daily Grind social media!]`}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7bb5d3] text-sm resize-none"
                                id="invitation-caption-input"
                                style={{ minHeight: '48px' }}
                            />
                            <button
                                type="button"
                                className="px-4 py-2 bg-[#7bb5d3] text-white rounded-r-md hover:bg-[#5a9cbf] transition-colors text-sm font-medium flex items-center gap-1"
                                onClick={() => {
                                    const caption = `I'm excited to join Daily Grind Season 3! ☕️ Let's connect and grow together on May 27th at Sysco LABS. #DailyGrindS3 #productivity [Tag Daily Grind social media!]`;
                                    navigator.clipboard.writeText(caption);
                                    Swal.fire({
                                        toast: true,
                                        position: 'top-end',
                                        icon: 'success',
                                        title: 'Caption copied!',
                                        showConfirmButton: false,
                                        timer: 1200
                                    });
                                }}
                                aria-label="Copy Caption"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h8m-8-4h8M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                                Copy
                            </button>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">Tip: Tag <span className="font-semibold">@dailygrind.lk</span> or your favorite Daily Grind social media page!</span>
                    </div>

                    <div className="flex flex-wrap gap-4 justify-center">
                        <a
                            href={getApiFallbackUrl(inviteImageUrl || user.inviteImageUrl)}
                            onClick={trackClick}
                            download="daily-grind-invitation.png"
                            className="bg-[#7bb5d3] text-white py-2 px-6 rounded-full hover:bg-[#5a9cbf] transition-all transform hover:scale-105 shadow-md flex items-center"
                            aria-label="Download Invitation Image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download Image
                        </a>
                        <button
                            onClick={e => { trackClick(e); handleRegenerateInvite(); }}
                            disabled={regeneratingInvite}
                            className="border border-[#7bb5d3] text-[#7bb5d3] py-2 px-6 rounded-full hover:bg-[#e6f2ff] transition-all flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {regeneratingInvite ? 'Regenerating...' : 'Regenerate Image'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
