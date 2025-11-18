import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CategoryForm } from '@/components/dashboard/CategoryForm';
import { CategoriesTable } from '@/components/dashboard/CategoriesTable';
import type { Category } from '@/lib/types';

async function getCatalogAndCategories() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: catalog } = await supabase.from('catalogs').select('id, enable_subcategories').eq('user_id', user.id).single();
    if (!catalog) notFound();

    const { data: categoriesData } = await supabase.from('categories').select('*').eq('catalog_id', catalog.id).order('created_at');
    
    const categories: Category[] = categoriesData || [];

    return { catalog, categories };
}

export default async function CategoriesPage() {
    const { catalog, categories } = await getCatalogAndCategories();
    const mainCategories = categories.filter(c => c.parent_id === null);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>الفئات</CardTitle>
                    <CardDescription>إدارة فئات الأصناف في قائمة الطعام الخاصة بك.</CardDescription>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-1">
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                إضافة فئة
                            </span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>إضافة فئة جديدة</DialogTitle>
                            <DialogDescription>
                                أدخل اسم الفئة الجديدة.
                            </DialogDescription>
                        </DialogHeader>
                        <CategoryForm catalogId={catalog.id} mainCategories={mainCategories} enableSubcategories={catalog.enable_subcategories} />
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <CategoriesTable categories={categories} catalogId={catalog.id} enableSubcategories={catalog.enable_subcategories} />
            </CardContent>
        </Card>
    );
}
