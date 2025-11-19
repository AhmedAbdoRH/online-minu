import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ItemForm } from '@/components/dashboard/ItemForm';
import { ItemsTable } from '@/components/dashboard/ItemsTable';

async function getData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: catalog } = await supabase.from('catalogs').select('id, name').eq('user_id', user.id).single();
    if (!catalog) notFound();

    const { data: categories } = await supabase.from('categories').select('*').eq('catalog_id', catalog.id);
    const { data: items } = await supabase.from('menu_items').select('*, categories(name)').eq('catalog_id', catalog.id).order('created_at');

    return { catalog, categories: categories || [], items: items || [] };
}

export default async function ItemsPage() {
    const { catalog, categories, items } = await getData();

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>المنتجات</CardTitle>
                    <CardDescription>إدارة المنتجات في قائمة الطعام الخاصة بك.</CardDescription>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-1" disabled={categories.length === 0}>
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
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
                        <ItemForm catalogId={catalog.id} categories={categories} />
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {categories.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        يجب عليك <a href="/dashboard/categories" className="text-primary underline">إضافة فئة</a> أولاً قبل إضافة المنتجات.
                    </div>
                ) : (
                    <ItemsTable items={items as any} catalogId={catalog.id} categories={categories} />
                )}
            </CardContent>
        </Card>
    );
}
