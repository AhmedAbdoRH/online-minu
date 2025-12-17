'use client';

import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ItemVariant } from "@/lib/types";
import { ShareButtons } from './ShareButtons';

interface ProductActionsProps {
    basePrice: number;
    variants: ItemVariant[];
    productName: string;
    catalogName: string;
    catalogPhone: string | null;
    productUrl: string;
    themeClass?: string;
}

export function ProductActions({
    basePrice,
    variants = [],
    productName,
    catalogName,
    catalogPhone,
    productUrl,
    themeClass
}: ProductActionsProps) {
    // Sort variants by price just in case
    const sortedVariants = [...variants].sort((a, b) => a.price - b.price);

    // Default to first variant if exists, else null
    const [selectedVariant, setSelectedVariant] = useState<ItemVariant | null>(
        sortedVariants.length > 0 ? sortedVariants[0] : null
    );

    const currentPrice = selectedVariant ? selectedVariant.price : basePrice;

    // Formatting price
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-EG', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(price);
    };

    // WhatsApp logic
    const getWhatsAppLink = () => {
        if (!catalogPhone) return null;

        let message = `أرغب في طلب ${productName}`;
        if (selectedVariant) {
            message += ` (${selectedVariant.name})`;
        }
        message += ` من ${catalogName}`;
        message += `.\nالسعر: ${currentPrice} ج.م`;
        message += `\nالتفاصيل: ${productUrl}`;

        const encodedMessage = encodeURIComponent(message);
        const cleanPhone = catalogPhone.replace(/[^\d]/g, '');

        return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    };

    const whatsappLink = getWhatsAppLink();

    // Price Display Logic
    const renderPriceDisplay = () => {
        return (
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">السعر</span>
                <span className="font-semibold text-brand-primary text-xl">
                    {formatPrice(currentPrice)} <span className="text-sm font-normal text-muted-foreground">ج.م</span>
                </span>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Variants Selection */}
            {sortedVariants.length > 0 && (
                <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">اختر الحجم / النوع:</label>
                    <div className="flex flex-wrap gap-2">
                        {sortedVariants.map((variant) => (
                            <button
                                key={variant.id}
                                onClick={() => setSelectedVariant(variant)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-sm transition-all duration-200 border",
                                    selectedVariant?.id === variant.id
                                        ? "bg-brand-primary text-primary-foreground border-brand-primary shadow-md font-semibold"
                                        : "bg-white/50 border-transparent hover:bg-white/80 hover:border-brand-primary/30 text-foreground"
                                )}
                            >
                                {variant.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Price Box */}
            <div className="grid gap-3 rounded-2xl border border-dashed border-white/40 bg-white/60 p-4 shadow-inner backdrop-blur dark:bg-slate-950/50">
                {renderPriceDisplay()}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                {whatsappLink ? (
                    <Button
                        asChild
                        className="flex-1 rounded-full bg-[#25D366] text-sm font-semibold shadow-[0_18px_40px_rgba(37,211,102,0.35)] hover:bg-[#1fb55b] h-12"
                    >
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="ml-2 h-5 w-5" />
                            {sortedVariants.length > 0 ? `اطلب (${selectedVariant?.name || 'الآن'})` : 'اطلب عبر واتساب'}
                        </a>
                    </Button>
                ) : (
                    <div className="flex-1 rounded-full border border-dashed border-muted-foreground/30 bg-muted/20 px-4 py-3 text-center text-sm text-muted-foreground">
                        <MessageCircle className="ml-2 inline h-4 w-4" />
                        رقم الواتساب غير متوفر
                    </div>
                )}
            </div>

            <ShareButtons catalogName={catalogName} />
        </div>
    );
}
