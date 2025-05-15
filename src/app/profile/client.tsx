"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import InvitationView from '@/components/InvitationView';
import { formatAvatarUrl, getAvatarApiFallbackUrl } from '@/lib/avatar-utils';
import { trackAvatarGenerated } from '@/lib/posthog';

interface ProfileClientProps {
    user: {
        _id: string;
        name: string;
        email: string;
        code: string;
        interests: string[];
        facts?: string[];
        connections?: any[];
        inviteImageUrl?: string;
        nic?: string;
        organization?: string;
        avatarUrl?: string;
        avatarPromptAttempts?: number;
    };
}

export default function ProfileClient({ user }: ProfileClientProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user.name || '');
    const [email, setEmail] = useState(user.email || '');
    const [interests, setInterests] = useState<string[]>(user.interests || []);
    const [newInterest, setNewInterest] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>("idle");
    const [saveError, setSaveError] = useState<string | null>(null);

    const [avatarPrompt, setAvatarPrompt] = useState('');
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
    const [avatarPromptAttempts, setAvatarPromptAttempts] = useState(user.avatarPromptAttempts || 0);

    // Always keep avatarUrl in sync with user.avatarUrl on mount or user change
    useEffect(() => {
        setAvatarUrl(user.avatarUrl || '');
        setAvatarPromptAttempts(user.avatarPromptAttempts || 0);
    }, [user.avatarUrl, user.avatarPromptAttempts]);

    const handleAddInterest = () => {
        if (newInterest.trim() && !interests.includes(newInterest.trim())) {
            setInterests([...interests, newInterest.trim()]);
            setNewInterest('');
        }
    };

    const handleRemoveInterest = (interest: string) => {
        setInterests(interests.filter(i => i !== interest));
    };

    const handleSave = async () => {
        setSaveStatus('saving');
        setSaveError(null);
        try {
            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, interests }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update profile');
            }
            const data = await response.json();
            setInterests(data.user.interests || []);
            setName(data.user.name || '');
            setEmail(data.user.email || '');
            setSaveStatus('success');
            setIsEditing(false);
            setNewInterest('');

            Swal.fire({
                title: 'Success!',
                text: 'Profile updated successfully!',
                icon: 'success',
                confirmButtonColor: '#7bb5d3',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            setSaveStatus('error');
            setSaveError(err instanceof Error ? err.message : 'An error occurred');

            Swal.fire({
                title: 'Error',
                text: err instanceof Error ? err.message : 'Failed to update profile',
                icon: 'error',
                confirmButtonColor: '#7bb5d3'
            });
        }
    };

    const handleGenerateAvatar = async () => {
        Swal.fire({
            title: 'Generating Avatar...',
            text: 'Your profile image is being generated. Please do not change or close the window.',
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            didOpen: () => {
                Swal.showLoading();
            },
            showConfirmButton: false,
            background: '#f8fafc',
        });
        setAvatarLoading(true);
        setAvatarError(null);
        try {
            const res = await fetch('/api/user/generate-avatar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: avatarPrompt }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to generate avatar');
            // Force reload by appending a timestamp query param
            setAvatarUrl((data.avatarUrl.startsWith('/userAvatar/') ? data.avatarUrl : `/userAvatar/${data.avatarUrl}`) + `?t=${Date.now()}`);
            setAvatarPromptAttempts(data.attempts);
            setAvatarPrompt('');

            // Track avatar generation in PostHog
            trackAvatarGenerated(user._id);

            Swal.fire({
                title: 'Success!',
                text: 'Avatar generated successfully!',
                icon: 'success',
                confirmButtonColor: '#7bb5d3',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            setAvatarError(err instanceof Error ? err.message : 'Failed to generate avatar');
            Swal.fire({
                title: 'Error',
                text: err instanceof Error ? err.message : 'Failed to generate avatar',
                icon: 'error',
                confirmButtonColor: '#7bb5d3'
            });
        } finally {
            setAvatarLoading(false);
        }
    };

    const copyCode = () => {
        if (user.code) {
            navigator.clipboard.writeText(user.code);
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

    return (
        <div className="space-y-8">
            {/* Hero banner */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#7bb5d3] to-[#5a95b5] text-white">
                <div className="absolute inset-0 opacity-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                        <defs>
                            <pattern id="pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M0 20 L40 20" stroke="currentColor" strokeWidth="0.5" />
                                <path d="M20 0 L20 40" stroke="currentColor" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#pattern)" />
                    </svg>
                </div>
                <div className="relative p-8 md:p-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
                            <p className="text-white/80 max-w-lg">Manage your personal information and preferences.</p>
                        </div>
                        <Link
                            href="/dashboard"
                            className="bg-white text-[#5a95b5] py-3 px-6 rounded-full hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-md flex items-center justify-center whitespace-nowrap font-medium"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                            </svg>
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
            </div>

            {/* Avatar Section */}
            <div className="community-card p-6 border border-gray-100 flex items-center gap-6">
                <div>
                    {avatarUrl ? (
                        <img
                            src={formatAvatarUrl(avatarUrl)}
                            alt="Profile Avatar"
                            className="w-24 h-24 rounded-full object-cover border-2 border-[#7bb5d3]"
                            onError={e => {
                                const currentSrc = (e.currentTarget as HTMLImageElement).src;
                                // If already using API fallback, show default
                                if (currentSrc.includes('/api/user/avatar/')) {
                                    if (!e.currentTarget.src.endsWith('/userAvatar/default.png')) {
                                        e.currentTarget.src = '/userAvatar/default.png';
                                        e.currentTarget.style.border = '2px solid red';
                                    }
                                    return;
                                }
                                // Try API fallback
                                const fallbackUrl = getAvatarApiFallbackUrl(avatarUrl);
                                if (fallbackUrl) {
                                    (e.currentTarget as HTMLImageElement).src = fallbackUrl;
                                } else {
                                    (e.currentTarget as HTMLImageElement).src = '/userAvatar/default.png';
                                }
                            }}
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <div className="mb-2 font-medium text-gray-700">Generate an AI Avatar</div>
                    <input
                        type="text"
                        value={avatarPrompt}
                        onChange={e => setAvatarPrompt(e.target.value)}
                        placeholder="Describe yourself for your avatar..."
                        className="w-full p-2 border rounded mb-2"
                        disabled={avatarPromptAttempts >= 3 || avatarLoading}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                        For best results, describe yourself with details like appearance, style, hobbies, or vibe. <br />
                        <span className="italic">Example: "A smiling woman with curly hair, glasses, and a love for hiking and coffee."</span>
                    </div>
                    <button
                        onClick={handleGenerateAvatar}
                        className="bg-[#7bb5d3] text-white px-4 py-2 rounded hover:bg-[#5a9cbf] disabled:opacity-50"
                        disabled={!avatarPrompt.trim() || avatarPromptAttempts >= 3 || avatarLoading}
                    >
                        {avatarLoading ? 'Generating...' : 'Generate Avatar'}
                    </button>
                    <div className="text-xs text-gray-500 mt-1">
                        {avatarPromptAttempts < 3
                            ? `You have ${3 - avatarPromptAttempts} avatar generations left.`
                            : 'You have reached the maximum number of avatar generations.'}
                    </div>
                    {avatarError && <div className="text-red-600 text-xs mt-1">{avatarError}</div>}
                </div>
            </div>

            {/* Profile Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="community-card p-6 border border-gray-100">
                    <div className="flex items-center mb-6">
                        <div className="bg-[#e6f2ff] p-3 rounded-full mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#7bb5d3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Profile Information</div>
                            <div className="text-2xl font-bold text-[#333333]">Personal Details</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7bb5d3] focus:border-[#7bb5d3]"
                                />
                            ) : (
                                <div className="p-3 bg-gray-50 rounded-lg">{name}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7bb5d3] focus:border-[#7bb5d3]"
                                />
                            ) : (
                                <div className="p-3 bg-gray-50 rounded-lg">{email}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Connection Code</label>
                            <div className="p-3 bg-gray-50 rounded-lg font-mono flex items-center justify-between">
                                {user.code}
                                <button
                                    onClick={copyCode}
                                    className="text-[#7bb5d3] hover:text-[#5a9cbf] focus:outline-none"
                                    aria-label="Copy code"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            {isEditing ? (
                                <button
                                    onClick={handleSave}
                                    className="bg-[#7bb5d3] text-white py-2 px-6 rounded-full hover:bg-[#5a9cbf] transition-all transform hover:scale-105 shadow-md"
                                    disabled={saveStatus === 'saving'}
                                >
                                    {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="border border-[#7bb5d3] text-[#7bb5d3] py-2 px-6 rounded-full hover:bg-[#e6f2ff] transition-all"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="community-card p-6 border border-gray-100">
                    <div className="flex items-center mb-6">
                        <div className="bg-[#f9f0e6] p-3 rounded-full mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#d1b89c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Your Interests</div>
                            <div className="text-2xl font-bold text-[#333333]">Tags & Topics</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2 min-h-[2.5rem] items-center">
                            {interests.length === 0 ? (
                                <span className="text-gray-400 text-sm">No interests added yet.</span>
                            ) : (
                                interests.map((interest, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-[#e6f2ff] text-[#7bb5d3] rounded-full text-sm flex items-center"
                                    >
                                        {interest}
                                        {isEditing && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveInterest(interest)}
                                                className="ml-2 text-[#7bb5d3] hover:text-[#5a9cbf] focus:outline-none"
                                                aria-label={`Remove ${interest}`}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </span>
                                ))
                            )}
                        </div>
                        {isEditing && (
                            <form
                                className="flex gap-2"
                                onSubmit={e => {
                                    e.preventDefault();
                                    if (
                                        newInterest.trim() &&
                                        !interests.includes(newInterest.trim())
                                    ) {
                                        handleAddInterest();
                                    }
                                }}
                            >
                                <input
                                    type="text"
                                    value={newInterest}
                                    onChange={e => setNewInterest(e.target.value)}
                                    placeholder="Add new interest"
                                    className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7bb5d3] focus:border-[#7bb5d3]"
                                    maxLength={32}
                                />
                                <button
                                    type="submit"
                                    className="bg-[#7bb5d3] text-white py-3 px-6 rounded-lg hover:bg-[#5a9cbf] transition-all"
                                    disabled={
                                        !newInterest.trim() ||
                                        interests.includes(newInterest.trim())
                                    }
                                >
                                    Add
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {saveStatus === 'success' && (
                <div className="mt-2 text-green-600 text-sm">Profile updated successfully!</div>
            )}
            {saveStatus === 'error' && saveError && (
                <div className="mt-2 text-red-600 text-sm">{saveError}</div>
            )}

            {/* Daily Grind Invitation */}
            <InvitationView user={user} />
        </div>
    );
}