import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import DashboardClient from './client';

export default async function Dashboard() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Not Logged In</h1>
                    <p>Please log in to view your dashboard.</p>
                    <Link href="/auth/login" className="text-blue-500 hover:underline">
                        Log in
                    </Link>
                </div>
            </div>
        );
    }

    return <DashboardClient session={session} />;
}