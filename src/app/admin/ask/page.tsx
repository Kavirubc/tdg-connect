import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Question from '@/models/Question';

export default async function AdminAskPage() {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.email !== 'hapuarachchikaviru@gmail.com') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center p-4 text-white">
                <div className="bg-red-800 shadow-2xl rounded-xl p-8 max-w-md w-full text-center">
                    <h1 className="text-3xl font-bold mb-4 text-yellow-300">Access Denied</h1>
                    <p className="mb-6 text-red-200">You do not have the necessary permissions to view this page. Please contact an administrator if you believe this is an error.</p>
                    <a href="/" className="bg-yellow-400 hover:bg-yellow-500 text-red-900 font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 inline-block">Go to Homepage</a>
                </div>
            </div>
        );
    }

    await connectToDatabase();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/questions`, { cache: 'no-store' });
    const { questions } = await res.json();

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 text-black">
            <div className="max-w-4xl mx-auto">
                <header className="mb-10 text-center">
                    <h1 className="text-5xl font-extrabold tracking-tight text-amber-400">
                        Admin Dashboard: All Questions
                    </h1>
                    <p className="mt-3 text-lg text-slate-300">
                        Review all questions submitted by users. User details are always visible here.
                    </p>
                </header>

                {questions.length === 0 ? (
                    <div className="text-center bg-slate-800 shadow-xl rounded-lg p-10">
                        <svg className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <h3 className="mt-2 text-xl font-semibold text-amber-400">No Questions Found</h3>
                        <p className="mt-1 text-slate-400">The community hasn't asked any questions yet.</p>
                    </div>
                ) : (
                    <div className="bg-slate-800 shadow-2xl rounded-xl overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-700">
                            <thead className="bg-slate-700/50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-amber-300 uppercase tracking-wider">
                                        Heading
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-amber-300 uppercase tracking-wider">
                                        Question
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-amber-300 uppercase tracking-wider">
                                        Asked By
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-amber-300 uppercase tracking-wider">
                                        Date & Time
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {questions.map((q: any) => (
                                    <tr key={q._id} className="hover:bg-slate-700/30 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">{q.heading}</td>
                                        <td className="px-6 py-4 text-sm text-slate-300 whitespace-pre-wrap">{q.question}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`font-semibold ${q.anonymous ? 'text-teal-400 italic' : 'text-indigo-400'}`}>
                                                {q.userName}
                                            </span>
                                            {q.anonymous && <span className="ml-2 text-xs text-slate-500">(Chosen: Anonymous)</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                            {new Date(q.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            <br />
                                            {new Date(q.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
