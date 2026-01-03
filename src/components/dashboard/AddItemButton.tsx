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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>إضافة منتج جديد</DialogTitle>
                    <DialogDescription>
                        املأ تفاصيل المنتج الجديد.
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
