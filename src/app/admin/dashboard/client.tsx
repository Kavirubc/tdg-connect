'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import useTrackClick from '@/lib/useTrackClick';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface Connection {
    _id: string;
    name: string;
    email: string;
    code: string;
    isDisconnected: boolean;
    interests?: string[];
    facts?: string[];
}

interface User {
    _id: string;
    name: string;
    email: string;
    code: string;
    interests: string[];
    facts: string[];
    createdAt: string;
    connections: Connection[];
}

interface Stats {
    totalUsers: number;
    totalConnections: number;
    activeConnections: number;
    totalFacts: number;
    totalInterests: number;
    usersWithAvatar: number;
    usersWithInvites: number;
    inviteImageCount: number;
    eventCount: number;
    conversationStarterCount: number;
    earliestUser: string | null;
    latestUser: string | null;
    avatarGenerationsByUser: Record<string, number>;
    conversationStartersByUser: Record<string, number>;
}

export default function AdminDashboardClient() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [showEmail, setShowEmail] = useState<Record<string, boolean>>({});
    const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

    const trackClick = useTrackClick();

    useEffect(() => {
        async function fetchAllUsers() {
            try {
                setLoading(true);
                const [usersRes, statsRes] = await Promise.all([
                    fetch('/api/admin/users'),
                    fetch('/api/admin/stats')
                ]);

                if (!usersRes.ok) {
                    throw new Error('Failed to fetch user data');
                }

                if (!statsRes.ok) {
                    throw new Error('Failed to fetch stats');
                }

                const usersData = await usersRes.json();
                const statsData = await statsRes.json();

                setUsers(usersData.users);
                setStats(statsData);

            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Failed to load admin data');
            } finally {
                setLoading(false);
            }
        }

        fetchAllUsers();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-lg">Loading admin dashboard...</p>
            </div>
        </div>;
    }

    if (error) {
        return <div className="bg-red-100 text-red-700 p-4 rounded-md">
            {error}
        </div>;
    }

    return (
        <div className="space-y-8">
            <div className="bg-blue-50 p-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-blue-800 mb-6">Admin Dashboard</h1>

                {stats && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="bg-white p-4 rounded-md shadow">
                                <h3 className="font-semibold text-gray-500">Total Users</h3>
                                <p className="text-3xl font-bold">{stats.totalUsers}</p>
                            </div>
                            <div className="bg-white p-4 rounded-md shadow">
                                <h3 className="font-semibold text-gray-500">Total Connections</h3>
                                <p className="text-3xl font-bold">{stats.totalConnections}</p>
                            </div>
                            <div className="bg-white p-4 rounded-md shadow">
                                <h3 className="font-semibold text-gray-500">Active Connections</h3>
                                <p className="text-3xl font-bold">{Math.floor(stats.activeConnections)}</p>
                            </div>
                            <div className="bg-white p-4 rounded-md shadow">
                                <h3 className="font-semibold text-gray-500">Total Facts</h3>
                                <p className="text-3xl font-bold">{stats.totalFacts}</p>
                            </div>
                            <div className="bg-white p-4 rounded-md shadow">
                                <h3 className="font-semibold text-gray-500">Total Interests</h3>
                                <p className="text-3xl font-bold">{stats.totalInterests}</p>
                            </div>
                            <div className="bg-white p-4 rounded-md shadow">
                                <h3 className="font-semibold text-gray-500">Users with Avatar</h3>
                                <p className="text-3xl font-bold">{stats.usersWithAvatar}</p>
                            </div>
                            <div className="bg-white p-4 rounded-md shadow">
                                <h3 className="font-semibold text-gray-500">Users with Invite Image</h3>
                                <p className="text-3xl font-bold">{stats.usersWithInvites}</p>
                            </div>
                            <div className="bg-white p-4 rounded-md shadow">
                                <h3 className="font-semibold text-gray-500">Invite Images in Folder</h3>
                                <p className="text-3xl font-bold">{stats.inviteImageCount}</p>
                            </div>
                            <div className="bg-white p-4 rounded-md shadow">
                                <h3 className="font-semibold text-gray-500">Events</h3>
                                <p className="text-3xl font-bold">{stats.eventCount}</p>
                            </div>
                            <div className="bg-white p-4 rounded-md shadow">
                                <h3 className="font-semibold text-gray-500">Conversation Starters</h3>
                                <p className="text-3xl font-bold">{stats.conversationStarterCount}</p>
                            </div>
                            <div className="bg-white p-4 rounded-md shadow">
                                <h3 className="font-semibold text-gray-500">First User Joined</h3>
                                <p className="text-3xl font-bold">{stats.earliestUser ? new Date(stats.earliestUser).toLocaleString() : '-'}</p>
                            </div>
                            <div className="bg-white p-4 rounded-md shadow">
                                <h3 className="font-semibold text-gray-500">Latest User Joined</h3>
                                <p className="text-3xl font-bold">{stats.latestUser ? new Date(stats.latestUser).toLocaleString() : '-'}</p>
                            </div>
                        </div>
                        <div className="mb-8">
                            <h2 className="text-lg font-bold mb-2">User Avatar Generations</h2>
                            {typeof window !== 'undefined' && stats.avatarGenerationsByUser && (
                                <Chart
                                    type={chartType}
                                    options={{
                                        chart: { id: 'avatar-gen-bar' },
                                        xaxis: { categories: Object.keys(stats.avatarGenerationsByUser) },
                                        title: { text: 'Avatar Generations per User' },
                                    }}
                                    series={[{
                                        name: 'Avatar Generations',
                                        data: Object.values(stats.avatarGenerationsByUser)
                                    }]}
                                    width="100%"
                                    height={320}
                                />
                            )}
                        </div>
                        <div className="mb-8">
                            <h2 className="text-lg font-bold mb-2">User Conversation Starters</h2>
                            {typeof window !== 'undefined' && stats.conversationStartersByUser && (
                                <Chart
                                    type={chartType}
                                    options={{
                                        chart: { id: 'conv-starters-bar' },
                                        xaxis: { categories: Object.keys(stats.conversationStartersByUser) },
                                        title: { text: 'Conversation Starters per User' },
                                    }}
                                    series={[{
                                        name: 'Conversation Starters',
                                        data: Object.values(stats.conversationStartersByUser)
                                    }]}
                                    width="100%"
                                    height={320}
                                />
                            )}
                        </div>
                        <div className="mb-4">
                            <button
                                className="mr-2 px-4 py-2 bg-blue-600 text-white rounded"
                                onClick={() => setChartType('bar')}
                            >Bar</button>
                            <button
                                className="px-4 py-2 bg-blue-200 text-blue-800 rounded"
                                onClick={() => setChartType('pie')}
                            >Pie</button>
                        </div>
                    </>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">User Database</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interests</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facts</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Connections</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Joined</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map(user => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {showEmail[user._id] ? user.email : (
                                            <button className="text-xs text-blue-600 underline" onClick={() => setShowEmail(prev => ({ ...prev, [user._id]: true }))}>Show Email</button>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.code}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {user.interests.length > 0 ? (
                                            <ul className="list-disc pl-5">
                                                {user.interests.map((interest, i) => (
                                                    <li key={i}>{interest}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span className="text-gray-400">None</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {user.facts.length > 0 ? (
                                            <ul className="list-disc pl-5">
                                                {user.facts.map((fact, i) => (
                                                    <li key={i}>{fact}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span className="text-gray-400">None</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.connections.filter(c => !c.isDisconnected).length}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-lg font-bold mb-2">Individual User Interactions</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avatar Generations</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversation Starters</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{stats?.avatarGenerationsByUser?.[user._id] ?? 0}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{stats?.conversationStartersByUser?.[user._id] ?? 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="space-y-6">
                {users.map(user => (
                    <div key={user._id} className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold mb-4">{user.name}'s Connections</h3>
                        {user.connections.length === 0 ? (
                            <p className="text-gray-500">No connections yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {user.connections.map(connection => (
                                    <div
                                        key={connection._id}
                                        className={`border p-4 rounded-md ${connection.isDisconnected ? 'bg-gray-100 border-gray-300' : 'bg-green-50 border-green-200'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold">{connection.name}</h4>
                                                <p className="text-sm text-gray-600">{connection.email}</p>
                                                <p className="text-sm text-gray-500">Code: {connection.code}</p>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded ${connection.isDisconnected ? 'bg-gray-200 text-gray-700' : 'bg-green-200 text-green-800'}`}>
                                                {connection.isDisconnected ? 'Disconnected' : 'Active'}
                                            </span>
                                        </div>
                                        {connection.interests && connection.interests.length > 0 && (
                                            <div className="mt-2">
                                                <h5 className="text-xs font-semibold">Interests:</h5>
                                                <p className="text-xs text-gray-600">{connection.interests.join(', ')}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}