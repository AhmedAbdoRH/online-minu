'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Catalog Page Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <h2 className="text-2xl font-bold mb-4">عذراً، حدث خطأ ما!</h2>
            <p className="text-muted-foreground mb-4">
                {error.message || 'تعذر تحميل الكتالوج. يرجى المحاولة مرة أخرى لاحقاً.'}
            </p>
            {error.digest && (
                <p className="text-xs text-gray-500 mb-4">Error ID: {error.digest}</p>
            )}
            <button
                onClick={() => reset()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
                محاولة مرة أخرى
            </button>
        </div>
    );
}
