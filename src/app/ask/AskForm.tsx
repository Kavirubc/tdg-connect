'use client';
import Swal from 'sweetalert2';
import { useState } from 'react';

export default function AskForm({ userName }: { userName: string }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Replace the form with a button to open the modal
    return (
        <>
            <button
                className="community-btn community-btn-primary w-full mb-8 text-lg py-3 rounded-xl shadow-lg hover:scale-105 transition-transform  font-bold"
                onClick={async () => {
                    const { value: formValues } = await Swal.fire({
                        title: '<span style="color: #2f78c2">Ask a Creative Question</span>',
                        html: `
                            <div style="display: flex; flex-direction: column; gap: 1rem;">
                                <input id="swal-heading" class="swal2-input" placeholder="Heading (e.g. 'Icebreaker')" maxlength="60" />
                                <textarea id="swal-question" class="swal2-textarea" placeholder="Type your question..." rows="3" maxlength="300" style="resize: vertical;"></textarea>
                                <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 1rem;">
                                    <input type="checkbox" id="swal-anonymous" style="width: 1.2em; height: 1.2em;" /> Ask anonymously
                                </label>
                            </div>
                        `,
                        focusConfirm: false,
                        showCancelButton: true,
                        confirmButtonText: 'Post Question',
                        cancelButtonText: 'Cancel',
                        preConfirm: () => {
                            const heading = (document.getElementById('swal-heading') as HTMLInputElement)?.value.trim();
                            const question = (document.getElementById('swal-question') as HTMLTextAreaElement)?.value.trim();
                            const anonymous = (document.getElementById('swal-anonymous') as HTMLInputElement)?.checked;
                            if (!heading || !question) {
                                Swal.showValidationMessage('Heading and question are required!');
                                return;
                            }
                            return { heading, question, anonymous };
                        },
                        customClass: {
                            popup: 'rounded-2xl',
                            confirmButton: 'community-btn community-btn-primary',
                            cancelButton: 'community-btn',
                        },
                        background: '#f7fafc',
                    });
                    if (formValues) {
                        setLoading(true);
                        setError(null);
                        setSuccess(false);
                        const res = await fetch('/api/questions', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(formValues),
                        });
                        if (!res.ok) {
                            setError('Failed to post question');
                            setLoading(false);
                            Swal.fire('Error', 'Failed to post question', 'error');
                            return;
                        }
                        setSuccess(true);
                        setLoading(false);
                        Swal.fire({
                            icon: 'success',
                            title: 'Question posted!',
                            showConfirmButton: false,
                            timer: 1500,
                            background: '#f7fafc',
                        }).then(() => window.location.reload());
                    }
                }}
            >
                <span className="flex items-center gap-2 justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Ask a Question
                </span>
            </button>
            {error && <div className="text-red-500 text-sm text-center mb-2">{error}</div>}
            {success && <div className="text-green-600 text-sm text-center mb-2">Question posted!</div>}
        </>
    );
}