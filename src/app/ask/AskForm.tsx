'use client';
import { useState } from 'react';

export default function AskForm({ userName }: { userName: string }) {
    const [heading, setHeading] = useState('');
    const [question, setQuestion] = useState('');
    const [anonymous, setAnonymous] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);
        const res = await fetch('/api/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ heading, question, anonymous }),
        });
        if (!res.ok) {
            setError('Failed to post question');
            setLoading(false);
            return;
        }
        setHeading('');
        setQuestion('');
        setAnonymous(false);
        setSuccess(true);
        setLoading(false);
        window.location.reload();
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
            <div>
                <label className="block font-medium mb-1">Heading</label>
                <input type="text" className="w-full border rounded p-2" value={heading} onChange={e => setHeading(e.target.value)} required />
            </div>
            <div>
                <label className="block font-medium mb-1">Question</label>
                <textarea className="w-full border rounded p-2" value={question} onChange={e => setQuestion(e.target.value)} required rows={3} />
            </div>
            <div className="flex items-center gap-2">
                <input type="checkbox" id="anonymous" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} />
                <label htmlFor="anonymous">Ask anonymously</label>
            </div>
            <button type="submit" className="community-btn community-btn-primary w-full" disabled={loading}>{loading ? 'Posting...' : 'Post Question'}</button>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">Question posted!</div>}
        </form>
    );
}