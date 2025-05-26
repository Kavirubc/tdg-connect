'use client';
import DeleteButton from './DeleteButton';

interface QuestionListProps {
    questions: any[];
    isAdmin: boolean;
}

export default function QuestionList({ questions, isAdmin }: QuestionListProps) {
    const handleDeleted = () => {
        window.location.reload();
    };

    if (questions.length === 0) {
        return (
            <div className="text-center bg-slate-800 shadow-xl rounded-lg p-10">
                <svg className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <h3 className="mt-2 text-xl font-semibold text-sky-400">No questions yet</h3>
                <p className="mt-1 text-slate-400">Be the first to ask a question!</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {questions.map((q) => (
                <div key={q._id} className="bg-slate-800 shadow-xl rounded-lg overflow-hidden transform transition-all hover:scale-[1.02] duration-300">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-sky-400 mb-3">{q.heading}</h2>
                        <p className="text-slate-300 mb-4 leading-relaxed whitespace-pre-wrap break-words">{q.question}</p>
                        <div className="border-t border-slate-700 pt-4 mt-4 flex items-center justify-between text-sm">
                            <span className={`font-medium ${q.anonymous ? 'text-teal-400 italic' : 'text-indigo-400'}`}>
                                {q.anonymous ? 'Posted Anonymously' : `Asked by ${q.userName}`}
                            </span>
                            <span className="text-slate-500">
                                {new Date(q.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                {' at '}
                                {new Date(q.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        {isAdmin && (
                            <DeleteButton questionId={q._id} onDelete={handleDeleted} />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
