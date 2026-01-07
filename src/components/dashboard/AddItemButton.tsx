'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ItemForm } from './ItemForm';
import type { Category } from '@/lib/types';

interface AddItemButtonProps {
    catalogId: number;
    catalogPlan: string;
    categories: Category[];
}

export function AddItemButton({ catalogId, catalogPlan, categories }: AddItemButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="whitespace-nowrap">
                        إضافة منتج
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-full sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[1000px] max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">إضافة منتج جديد</DialogTitle>
                    <DialogDescription>
                        املأ تفاصيل المنتج الجديد بدقة ليظهر بشكل جذاب في متجرك.
                    </DialogDescription>
                </DialogHeader>
                <ItemForm
                    catalogId={catalogId}
                    catalogPlan={catalogPlan}
                    categories={categories}
                    onSuccess={() => setOpen(false)}
                    onCancel={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
