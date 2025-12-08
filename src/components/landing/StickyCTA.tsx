
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
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
            <div className='container mx-auto px-4 relative'>
                <div className="absolute bottom-3 left-3 right-3 md:left-8 md:right-auto md:w-auto bg-gradient-to-r from-primary/95 to-primary/90 text-primary-foreground backdrop-blur-lg p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl flex items-center gap-3 sm:gap-4 justify-between animate-in slide-in-from-bottom-10 fade-in duration-500 pointer-events-auto ring-2 ring-primary/20 border border-primary/30">
                    <div className="font-bold text-base sm:text-lg sm:hidden md:block px-4">
                        جاهز تبيع اونلاين؟
                    </div>
                    <Button size="sm" className="rounded-md sm:rounded-lg font-bold bg-white text-primary hover:bg-white/90 shadow-md sm:shadow-lg shadow-white/20 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base transition-all hover:scale-105 border-2 border-primary/20 mr-4" asChild>
                        <Link href="/signup">
                            ابدأ مجاناً
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
