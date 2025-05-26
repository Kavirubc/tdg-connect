import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Question from '@/models/Question';
import AskForm from './AskForm';

export default async function AskPage() {
    const session = await getServerSession(authOptions);
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

                {questions.length === 0 ? (
                    <div className="text-center bg-slate-800 shadow-xl rounded-lg p-10">
                        <svg className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <h3 className="mt-2 text-xl font-semibold text-sky-400">No questions yet</h3>
                        <p className="mt-1 text-slate-400">Be the first to ask a question!</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {questions.map((q: any) => (
                            <div key={q._id} className="bg-slate-800 shadow-xl rounded-lg overflow-hidden transform transition-all hover:scale-[1.02] duration-300">
                                <div className="p-6">
                                    <h2 className="text-2xl font-bold text-sky-400 mb-3">{q.heading}</h2>
                                    <p className="text-slate-300 mb-4 leading-relaxed whitespace-pre-wrap break-words">{q.question}</p>
                                    <div className="border-t border-slate-700 pt-4 mt-4 flex items-center justify-between text-sm">
                                        <span className={`font-medium ${q.anonymous ? 'text-teal-400 italic' : 'text-indigo-400'}`}>
                                            {q.anonymous
                                                ? 'Posted Anonymously'
                                                : `Asked by ${q.userName}`}
                                        </span>
                                        <span className="text-slate-500">
                                            {new Date(q.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            {' at '}
                                            {new Date(q.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
