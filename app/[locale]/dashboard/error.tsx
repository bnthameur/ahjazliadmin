'use client';

import { useEffect } from 'react';
import { Emoji } from 'react-apple-emojis';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Dashboard error:', error);
    }, [error]);

    return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                    <Emoji name="warning" width={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                    Something went wrong
                </h2>
                <p className="text-slate-600 mb-6">
                    We encountered an error while loading this page. Please try again.
                </p>
                <button
                    onClick={reset}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}
