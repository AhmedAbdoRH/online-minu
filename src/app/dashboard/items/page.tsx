import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ItemsTable } from '@/components/dashboard/ItemsTable';
import { AddItemButton } from '@/components/dashboard/AddItemButton';

async function getData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: catalog } = await supabase.from('catalogs').select('id, name, plan').eq('user_id', user.id).single();
    if (!catalog) notFound();

    const { data: categories } = await supabase.from('categories').select('*').eq('catalog_id', catalog.id);
    const { data: items } = await supabase.from('menu_items').select('*, categories(name), product_images(*)').eq('catalog_id', catalog.id).order('created_at');

    return { catalog, categories: categories || [], items: items || [] };
}

export default async function ItemsPage() {
    const { catalog, categories, items } = await getData();

    return (
        <Card className="border-none sm:border shadow-none sm:shadow-sm bg-transparent sm:bg-card">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 sm:py-6">
                <div>
                    <CardTitle className="text-xl sm:text-2xl">المنتجات</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">إدارة المنتجات في المتجر الخاص بك.</CardDescription>
                </div>
                <div className="w-full sm:w-auto">
                    <AddItemButton catalogId={catalog.id} catalogPlan={catalog.plan} categories={categories} />
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
                <ItemsTable items={items as any} catalogId={catalog.id} catalogPlan={catalog.plan} categories={categories} />
            </CardContent>
            <div className="h-24" /> {/* مسافة إضافية في نهاية الصفحة لتجنب التداخل مع شريط التنقل السفلي */}
        </Card>
    );
}
