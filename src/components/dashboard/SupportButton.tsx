'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function SupportButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex items-center">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-0 top-full mt-2 z-50 bg-card border-2 border-brand-primary/20 shadow-2xl rounded-2xl p-4 w-72"
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 rounded-full"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-3 w-3" />
                        </Button>

                        <div className="flex flex-col gap-3 pt-2">
                            <div className="flex items-center gap-2 text-brand-primary">
                                <MessageCircle className="h-5 w-5" />
                                <span className="font-bold text-sm">الدعم الفني</span>
                            </div>
                            <p className="text-sm text-balance text-foreground font-medium text-right">
                                تواجه أي مشكلة؟ تواصل معنا مباشرة عبر الواتساب للمساعدة الفورية.
                            </p>
                            <Button
                                asChild
                                className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white gap-2 font-bold shadow-lg"
                            >
                                <a
                                    href="https://wa.me/201008116452?text=مرحباً، أحتاج إلى مساعدة في لوحة التحكم"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    تواصل على الواتساب
                                </a>
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                className="bg-brand-primary/40 backdrop-blur-md text-white py-1.5 px-3 rounded-r-lg shadow-md hover:pl-4 hover:bg-brand-primary/60 transition-all flex items-center gap-2 border-y border-r border-white/20 -ml-4 sm:-ml-6 h-9 group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <MessageCircle className="h-4 w-4" />
                <span className="font-bold text-[11px] whitespace-nowrap">تحتاج مساعدة؟</span>
            </button>
        </div>
    );
