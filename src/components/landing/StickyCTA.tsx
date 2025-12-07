
"use client";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function StickyCTA() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling down 500px
            if (window.scrollY > 500) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4pointer-events-none">
            <div className='container mx-auto px-4 relative'>
                <div className="absolute bottom-6 left-4 right-4 md:left-auto md:right-8 md:w-auto bg-foreground/90 text-background backdrop-blur-lg p-4 rounded-2xl shadow-2xl flex items-center gap-6 justify-between animate-in slide-in-from-bottom-10 fade-in duration-500 pointer-events-auto ring-1 ring-white/10">
                    <div className="font-bold hidden sm:block">
                        جاهز تملك متجرك الآن؟
                    </div>
                    <Button size="lg" className="rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20" asChild>
                        <Link href="/signup">
                            ابدأ مجاناً
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
