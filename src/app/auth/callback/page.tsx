'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');
            const next = searchParams.get('next') || '/dashboard';

            if (code) {
                const supabase = createClient();
                const { error } = await supabase.auth.exchangeCodeForSession(code);
                if (error) {
                    console.error('Auth callback error:', error.message);
                    // Silently redirect to home/login on PKCE error instead of showing technical message
                    router.replace('/home');
                } else {
                    router.replace(next);
                }
            } else {
                // If no code, maybe we are already logged in or just visiting?
                // Just redirect to dashboard or login
                router.replace('/dashboard');
            }
        };

        handleCallback();
    }, [router, searchParams]);
/*
    if (error) {
        return <div>Error: {error}</div>;
    }
*/
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h2 className="text-lg font-semibold mb-2">جاري التحقق...</h2>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthCallbackContent />
        </Suspense>
    );
}
