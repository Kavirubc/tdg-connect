import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import ProfileClient from './client';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';

export default async function Profile() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="community-card w-full max-w-md p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#c2e0f0] flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#7bb5d3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-[#333333] mb-2">Not Logged In</h1>
                    <p className="text-[#777777] mb-4">Please log in to view your profile.</p>
                    <Link href="/auth/login" className="community-btn community-btn-primary inline-block">
                        Log in
                    </Link>
                </div>
            </div>
        );
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id).lean();
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="community-card w-full max-w-md p-6 text-center">
                    <h1 className="text-2xl font-bold text-[#333333] mb-2">User not found</h1>
                </div>
            </div>
        );
    }

    // Pass the latest user data to the client
    return <ProfileClient user={JSON.parse(JSON.stringify(user))} />;
} 