"use client";

import { useState } from 'react';
import Link from 'next/link';

interface ProfileClientProps {
    user: {
        _id: string;
        name: string;
        email: string;
        code: string;
        interests: string[];
        facts?: string[];
        connections?: any[];
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
        } catch (err) {
            setSaveStatus('error');
            setSaveError(err instanceof Error ? err.message : 'An error occurred');
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
                            <div className="p-3 bg-gray-50 rounded-lg font-mono">{user.code}</div>
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
        </div>
    );
} 