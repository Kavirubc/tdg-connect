// src/app/admin/dashboard/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import AdminDashboardClient from './client';

export default async function AdminDashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.email !== 'hapuarachchikaviru@gmail.com') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-red-100 text-red-700 p-6 rounded-lg shadow text-center">
                    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                    <p>You must be logged in as the admin to view this page.</p>
                </div>
            </div>
        );
    }
    return <AdminDashboardClient />;
}
