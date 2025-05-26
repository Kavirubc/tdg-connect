import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Question from '@/models/Question';
import AskForm from './AskForm';
import QuestionList from './QuestionList';

export default async function AskPage() {
    const session = await getServerSession(authOptions);
    const isAdmin = !!session && session.user?.email === 'hapuarachchikaviru@gmail.com';
    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 text-white">
                <div className="bg-slate-800 shadow-2xl rounded-xl p-8 max-w-md w-full text-center">
                    <h1 className="text-3xl font-bold mb-4 text-sky-400">Access Restricted</h1>
                    <p className="mb-6 text-slate-300">Please log in to post your questions or view contributions from the community.</p>
                    <a href="/auth/login" className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block">Log In</a>
                </div>
            </div>
        );
    }

    await connectToDatabase();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/questions`, { cache: 'no-store' });
    const { questions } = await res.json();

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 text-white">
            <div className="max-w-3xl mx-auto">
                <header className="mb-10 text-center">
                    <h1 className="text-5xl font-extrabold tracking-tight text-sky-700">
                        Community Questions
                    </h1>
                    <p className="mt-3 text-lg text-slate-900">
                        Have a question? Ask the community or browse existing discussions.
                    </p>
                </header>

                <div className="mb-10 flex justify-center">
                    <AskForm userName={session.user.name || ''} />
                </div>

                <QuestionList questions={questions} isAdmin={isAdmin} />
            </div>
        </div>
    );
}
