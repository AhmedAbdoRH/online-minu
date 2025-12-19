"use client";

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#0F172A]">
            {/* Decorative background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00D1C9]/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#A855F7]/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="relative flex flex-col items-center gap-8 px-6 text-center">
                {/* Placeholder Logo with Animation */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        transition: { duration: 0.8, ease: "easeOut" }
                    }}
                    className="relative"
                >
                    <div className="absolute inset-0 rounded-full bg-[#00D1C9]/20 blur-2xl animate-pulse" />
                    <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-white/20 bg-white/5 p-1.5 backdrop-blur-md shadow-2xl flex items-center justify-center">
                        <Sparkles className="h-10 w-10 text-[#00D1C9] animate-pulse" />
                    </div>
                </motion.div>

                {/* Loading Text */}
                <div className="space-y-3">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-2xl font-bold text-white md:text-3xl"
                    >
                        المتجر الرقمي
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="text-sm font-medium tracking-widest text-[#94A3B8] uppercase"
                    >
                        جاري تحضير المتجر...
                    </motion.p>
                </div>

                {/* Elegant Loading Bar */}
                <div className="relative mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
                    <div className="absolute inset-y-0 w-full bg-gradient-to-r from-[#00D1C9] via-[#A855F7] to-[#00D1C9] animate-loading-bar shadow-[0_0_15px_rgba(0,209,201,0.5)]" />
                </div>
            </div>

            <style jsx global>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
