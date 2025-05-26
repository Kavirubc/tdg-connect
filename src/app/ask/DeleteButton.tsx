'use client';
import { useState } from 'react';

interface DeleteButtonProps {
    questionId: string;
    onDelete: () => void;
}

export default function DeleteButton({ questionId, onDelete }: DeleteButtonProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this question?')) return;
        setLoading(true);
        setError(null);
        const res = await fetch('/api/questions', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: questionId }),
        });
        setLoading(false);
        if (!res.ok) {
            setError('Failed to delete question');
            return;
        }
        onDelete();
    };

    return (
        <div className="flex flex-col items-end">
            <button
                onClick={handleDelete}
                disabled={loading}
                className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded shadow text-xs font-semibold transition disabled:opacity-50"
            >
                {loading ? 'Deleting...' : 'Delete'}
            </button>
            {error && <span className="text-xs text-red-400 mt-1">{error}</span>}
        </div>
    );
}
