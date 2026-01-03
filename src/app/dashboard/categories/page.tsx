'use client';

import { getCategories } from '@/app/actions/categories';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CategoryForm } from '@/components/dashboard/CategoryForm';
import { CategoriesTable } from '@/components/dashboard/CategoriesTable';
import { useState } from 'react';
import React from 'react';
import type { CategoryWithSubcategories } from '@/lib/types';

async function getCatalogAndCategories() {
    const result = await getCategories();
    if (!result.catalog) {
        redirect('/login');
    }
    
    if (result.error) {
        console.error("Error fetching categories:", result.error);
        return { catalog: result.catalog, categories: [] };
    }

    return { catalog: result.catalog, categories: result.categories || [] };
}

export default function CategoriesPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
    const [catalog, setCatalog] = useState<{id: number} | null>(null);

    // Fetch data on component mount
    React.useEffect(() => {
        async function fetchData() {
            const result = await getCatalogAndCategories();
            setCatalog(result.catalog?.id ? { id: result.catalog.id } : null);
            setCategories(result.categories);
        }
        fetchData();
    }, []);

    // Calculate stats
    const totalCategories = categories.length;
    const totalSubcategories = categories.reduce((acc, cat) => acc + (cat.subcategories?.length || 0), 0);

    const handleCategorySuccess = () => {
        setIsDialogOpen(false);
        // Refetch categories
        async function fetchData() {
            const result = await getCatalogAndCategories();
            setCatalog(result.catalog?.id ? { id: result.catalog.id } : null);
            setCategories(result.categories);
        }
        fetchData();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">التصنيفات</h1>
                    <p className="text-muted-foreground">
                        إدارة هيكلية المتجر وتنظيم الأصناف في مجموعات.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 shadow-lg bg-[#FFB300] hover:bg-[#FF9500] text-white border-none font-black text-lg h-14 px-8 rounded-xl transition-all hover:scale-105 active:scale-95">
                            <PlusCircle className="h-6 w-6 stroke-[3px]" />
                            <span>إضافة تصنيف جديد</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>إضافة تصنيف جديد</DialogTitle>
                            <DialogDescription>
                                قم بإنشاء تصنيف رئيسي جديد لتنظيم منتجاتك.
                            </DialogDescription>
                        </DialogHeader>
                        <CategoryForm 
                            catalogId={catalog?.id || 0} 
                            categories={categories} 
                            hideParentSelection 
                            onSuccess={handleCategorySuccess}
                            onCancel={() => setIsDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>إجمالي التصنيفات الرئيسية</CardDescription>
                        <CardTitle className="text-3xl">{totalCategories}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>إجمالي التصنيفات الفرعية</CardDescription>
                        <CardTitle className="text-3xl">{totalSubcategories}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-lg">هيكل القائمة</CardTitle>
                    <CardDescription>
                        يمكنك سحب وإفلات التصنيفات لإعادة ترتيبها (قريباً).
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    {catalog && <CategoriesTable categories={categories} catalogId={catalog.id} />}
                </CardContent>
            </Card>
            <div className="h-24" /> {/* مسافة إضافية في نهاية الصفحة لتجنب التداخل مع شريط التنقل السفلي */}
        </div>
    );
}
