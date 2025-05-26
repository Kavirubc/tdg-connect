import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Question from '@/models/Question';
import AskForm from './AskForm';

export default async function AskPage() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="community-card w-full max-w-md p-6 text-center">
                    <h1 className="text-2xl font-bold mb-2">Not Logged In</h1>
                    <p className="mb-4">Please log in to post or view questions.</p>
                    <a href="/auth/login" className="community-btn community-btn-primary inline-block">Log in</a>
                </div>
            </div>
        );
    }

    await connectToDatabase();
    // Use absolute URL for fetch on the server
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/questions`, { cache: 'no-store' });
    const { questions } = await res.json();

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Ask a Question</h1>
            <AskForm userName={session.user.name || ''} />
            <div className="mt-10 space-y-6">
                {questions.map((q: any) => (
                    <div key={q._id} className="bg-white rounded-lg shadow p-4">
                        <h2 className="text-xl font-semibold mb-1">{q.heading}</h2>
                        <p className="mb-2">{q.question}</p>
                        <div className="text-xs text-gray-500">
                          {q.anonymous
                            ? 'Anonymous'
                            : `Asked by ${q.userName}`}
                          {' • '}{new Date(q.createdAt).toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
