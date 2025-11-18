import { getCategories } from '@/app/actions/categories';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CategoryForm } from '@/components/dashboard/CategoryForm';
import { CategoriesTable } from '@/components/dashboard/CategoriesTable';

async function getCatalogAndCategories() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: catalog } = await supabase.from('catalogs').select('id').eq('user_id', user.id).single();
    if (!catalog) notFound();

    const { categories, error } = await getCategories(catalog.id);
    if (error) {
        console.error("Error fetching categories:", error);
        return { catalog, categories: [] };
    }

    return { catalog, categories: categories || [] };
}

export default async function CategoriesPage() {
    const { catalog, categories } = await getCatalogAndCategories();

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
                        <CategoryForm catalogId={catalog.id} categories={categories} />
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <CategoriesTable categories={categories} catalogId={catalog.id} />
            </CardContent>
        </Card>
    );
}
