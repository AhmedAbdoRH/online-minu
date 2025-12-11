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
                    <h1 className="text-2xl font-bold tracking-tight">الفئات</h1>
                    <p className="text-muted-foreground">
                        إدارة هيكلية الكتالوج وتنظيم الأصناف في مجموعات.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 shadow-sm">
                            <PlusCircle className="h-4 w-4" />
                            <span>إضافة فئة جديدة</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>إضافة فئة جديدة</DialogTitle>
                            <DialogDescription>
                                قم بإنشاء فئة رئيسية جديدة لتنظيم منتجاتك.
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
                        <CardDescription>إجمالي الفئات الرئيسية</CardDescription>
                        <CardTitle className="text-3xl">{totalCategories}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>إجمالي الفئات الفرعية</CardDescription>
                        <CardTitle className="text-3xl">{totalSubcategories}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-lg">هيكل القائمة</CardTitle>
                    <CardDescription>
                        يمكنك سحب وإفلات الفئات لإعادة ترتيبها (قريباً).
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    {catalog && <CategoriesTable categories={categories} catalogId={catalog.id} />}
                </CardContent>
            </Card>
        </div>
    );
}
