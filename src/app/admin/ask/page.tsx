import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Question from '@/models/Question';

export default async function AdminAskPage() {
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

    await connectToDatabase();
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/questions`, { cache: 'no-store' });
    const { questions } = await res.json();

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-6 text-center">All Questions (Admin)</h1>
            <div className="mt-10 space-y-6">
                {questions.map((q: any) => (
                    <div key={q._id} className="bg-white rounded-lg shadow p-4">
                        <h2 className="text-xl font-semibold mb-1">{q.heading}</h2>
                        <p className="mb-2">{q.question}</p>
                        <div className="text-xs text-gray-500">Asked by: {q.anonymous ? 'Anonymous' : q.userName} • {new Date(q.createdAt).toLocaleString()}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
