'use client';
import { useState } from 'react';

interface AskFormProps {
    userName: string;
}

export default function AskForm({ userName }: AskFormProps) {
    const [open, setOpen] = useState(false);
    const [heading, setHeading] = useState('');
    const [question, setQuestion] = useState('');
    const [anonymous, setAnonymous] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const headingLimit = 100;
    const questionLimit = 500;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!heading.trim() || !question.trim()) {
            setError('Heading and question are required!');
            return;
        }
        setLoading(true);
        setError(null);
        setSuccess(false);
        const res = await fetch('/api/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ heading, question, anonymous }),
        });
        setLoading(false);
        if (!res.ok) {
            setError('Failed to post question');
            return;
        }
        setSuccess(true);
        setOpen(false);
        setHeading('');
        setQuestion('');
        setAnonymous(false);
        window.location.reload();
    };

    return (
        <>
            <button
                className="community-btn community-btn-primary w-full mb-8 text-lg py-3 rounded-xl shadow-lg hover:scale-105 transition-transform bg-gradient-to-r from-[#7bb5d3] to-[#2f78c2] text-white font-bold"
                onClick={() => setOpen(true)}
                type="button"
            >
                <span className="flex items-center gap-2 justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Ask a Question
                </span>
            </button>
            {open && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
                    {/* Blurred background overlay */}
                    <div className="absolute inset-0 bg-white/10 bg-opacity-40 backdrop-blur-sm transition-all duration-300" onClick={() => setOpen(false)} />
                    <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg animate-fade-in mt-0">
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                            onClick={() => setOpen(false)}
                            aria-label="Close"
                            type="button"
                        >
                            &times;
                        </button>
                        <h2 className="text-2xl font-bold text-sky-700 mb-4 text-center">Ask a Question</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="heading" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    id="heading"
                                    type="text"
                                    className=" text-black w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7bb5d3] focus:border-[#7bb5d3]"
                                    placeholder="Heading (e.g. 'Icebreaker')"
                                    maxLength={headingLimit}
                                    value={heading}
                                    onChange={e => setHeading(e.target.value)}
                                    required
                                />
                                <div className={`text-xs mt-1 text-right ${heading.length > headingLimit ? 'text-red-500' : 'text-gray-400'}`}>{heading.length}/{headingLimit}</div>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                                <textarea
                                    id="question"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7bb5d3] focus:border-[#7bb5d3] resize-vertical text-black"
                                    placeholder="Type your question..."
                                    maxLength={questionLimit}
                                    rows={4}
                                    value={question}
                                    onChange={e => setQuestion(e.target.value)}
                                    required
                                />
                                <div className={`text-xs mt-1 text-right ${question.length > questionLimit ? 'text-red-500' : 'text-gray-400'}`}>{question.length}/{questionLimit}</div>
                            </div>
                            <div className="mb-6 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="anonymous"
                                    checked={anonymous}
                                    onChange={e => setAnonymous(e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="anonymous" className="text-gray-700 text-sm">Ask anonymously</label>
                            </div>
                            {error && <div className="text-red-500 text-sm text-center mb-2">{error}</div>}
                            <button
                                type="submit"
                                className="community-btn community-btn-primary w-full text-lg py-3 rounded-xl shadow-lg bg-gradient-to-r from-[#7bb5d3] to-[#2f78c2] text-white font-bold disabled:opacity-60"
                                disabled={loading || heading.length > headingLimit || question.length > questionLimit}
                            >
                                {loading ? 'Posting...' : 'Post Question'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {success && <div className="text-green-600 text-sm text-center mb-2">Question posted!</div>}
        </>
    );
}