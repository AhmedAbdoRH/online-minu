'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCatalog, checkCatalogName } from '@/app/actions/catalog';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { slugify } from '@/lib/utils';

export function AutoCatalogCreator({
    userPhone,
    userEmail,
    userName
}: {
    userPhone: string,
    userEmail?: string,
    userName?: string
}) {
    const router = useRouter();
    const { toast } = useToast();
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const autoCreate = async () => {
            const pendingStoreName = localStorage.getItem('pendingStoreName');
            const pendingStoreSlug = localStorage.getItem('pendingStoreSlug');
            const pendingWhatsApp = localStorage.getItem('pendingWhatsApp');

            let displayName = pendingStoreName;
            let slug = pendingStoreSlug;
            let whatsapp = pendingWhatsApp;

            // Fallback to user metadata if no pending data (e.g. direct Google sign up without popup)
            if (!displayName && userName) {
                displayName = `متجر ${userName}`;
            } else if (!displayName && userEmail) {
                displayName = `متجر ${userEmail.split('@')[0]}`;
            }

            if (!slug && displayName) {
                const baseSlug = slugify(displayName);
                // Check if slug is available, if not, append random suffix or timestamp
                const isAvailable = await checkCatalogName(baseSlug);
                slug = isAvailable ? baseSlug : `${baseSlug}-${Math.floor(Math.random() * 1000)}`;
            } else if (!slug && userEmail) {
                slug = userEmail.split('@')[0].replace(/[^a-z0-9]/g, '');
            }

            if (!whatsapp) {
                whatsapp = '+20' + (userPhone || '0000000000');
            }

            if (displayName && slug) {
                setIsCreating(true);
                const formData = new FormData();
                formData.append('display_name', displayName);
                formData.append('name', slug);
                formData.append('whatsapp_number', whatsapp);

                // Use +20 as default if not in whatsapp
                if (!whatsapp.startsWith('+')) {
                    formData.set('whatsapp_number', '+20' + whatsapp);
                }

                try {
                    const result = await createCatalog(null, formData);

                    if (result && result.message === undefined) {
                        // Success: createCatalog redirects or we reload
                        localStorage.removeItem('pendingStoreName');
                        localStorage.removeItem('pendingStoreSlug');
                        localStorage.removeItem('pendingWhatsApp');
                        router.refresh();
                    } else if (result && result.message) {
                        // If it's a name duplication error, we might want to try again with a different slug
                        // but for now let's just show the toast
                        toast({
                            title: 'تنبيه',
                            description: result.message,
                            variant: 'destructive',
                        });
                        setIsCreating(false);
                    }
                } catch (error) {
                    console.error('Auto creation failed:', error);
                    setIsCreating(false);
                }
            }
        };

        autoCreate();
    }, [router, toast, userPhone, userEmail, userName]);

    if (!isCreating) {
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
            <div className="relative">
                <div className="absolute inset-0 bg-brand-primary/20 blur-2xl rounded-full scale-150 animate-pulse" />
                <Loader2 className="h-12 w-12 text-brand-primary animate-spin relative z-10" />
            </div>
            <div className="space-y-2 relative z-10">
                <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                    جار إنشاء المتجر...
                    <Sparkles className="h-5 w-5 text-amber-500 animate-bounce" />
                </h2>
                <p className="text-muted-foreground">ثواني ونكون انتهينا من إعداد كل شيء لك</p>
            </div>
        </div>
    );
}
