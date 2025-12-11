'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Category, MenuItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { useState } from 'react';
import { ItemForm } from './ItemForm';
import { deleteItem } from '@/app/actions/items';
import { toast } from '@/hooks/use-toast';

type ItemWithCategory = MenuItem & { categories: { name: string } | null };

interface ItemsTableProps {
  items: ItemWithCategory[];
  catalogId: number;
  categories: Category[];
}

function ItemRow({ item, catalogId, categories }: { item: ItemWithCategory, catalogId: number, categories: Category[] }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = async (itemId: number) => {
    const result = await deleteItem(itemId);
    if (result.error) {
      toast({ title: 'خطأ', description: result.error, variant: 'destructive' });
    } else {
      toast({ title: 'نجاح', description: 'تم حذف المنتج.' });
    }
  }

  return (
    <TableRow className="hover:bg-muted/50 transition-colors">
      <TableCell className="hidden sm:table-cell">
        <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-border/50">
          <Image
            alt={item.name}
            className="object-cover"
            fill
            src={item.image_url || "https://picsum.photos/seed/placeholder/64/64"}
          />
        </div>
      </TableCell>
      <TableCell className="font-bold text-base">{item.name}</TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-muted/50">{item.categories?.name || 'غير مصنف'}</Badge>
      </TableCell>
      <TableCell className="font-mono">{item.price} ج.م</TableCell>
      <TableCell>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button aria-haspopup="true" size="icon" variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)} className="cursor-pointer">تعديل</DropdownMenuItem>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onSelect={(e) => e.preventDefault()}>حذف</DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu >

            {/* Edit Dialog */}
            < DialogContent >
              <DialogHeader>
                <DialogTitle>تعديل المنتج</DialogTitle>
                <DialogDescription>قم بتحديث تفاصيل المنتج.</DialogDescription>
              </DialogHeader>
              <ItemForm
                catalogId={catalogId}
                categories={categories}
                item={item}
                onSuccess={() => setIsEditDialogOpen(false)}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            </DialogContent >

            {/* Delete Dialog */}
            < AlertDialogContent >
              <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد تماماً؟</AlertDialogTitle>
                <AlertDialogDescription>
                  سيتم حذف هذا المنتج بشكل دائم. لا يمكن التراجع عن هذا الإجراء.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive hover:bg-destructive/90">
                  نعم، احذف المنتج
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent >

          </AlertDialog >
        </Dialog >
      </TableCell >
    </TableRow >
  )
}

export function ItemsTable({ items, catalogId, categories }: ItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/25 bg-muted/10 py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <div className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="mb-1 text-lg font-semibold">لا توجد منتجات</h3>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          لم تقم بإضافة أي منتجات بعد.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="hidden w-[100px] sm:table-cell">
              <span className="sr-only">الصورة</span>
            </TableHead>
            <TableHead>الاسم</TableHead>
            <TableHead>الفئة</TableHead>
            <TableHead>السعر</TableHead>
            <TableHead className="w-[50px]">
              <span className="sr-only">الإجراءات</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <ItemRow key={item.id} item={item} catalogId={catalogId} categories={categories} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
