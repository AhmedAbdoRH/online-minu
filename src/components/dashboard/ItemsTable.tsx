'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Category, MenuItemWithDetails } from '@/lib/types';
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

type ItemWithCategory = MenuItemWithDetails;

interface ItemsTableProps {
  items: ItemWithCategory[];
  catalogId: number;
  catalogPlan: string;
  categories: Category[];
}

function ItemRow({ item, catalogId, catalogPlan, categories }: { item: ItemWithCategory, catalogId: number, catalogPlan: string, categories: Category[] }) {
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
      <TableCell className="p-2 sm:p-5">
        <div className="relative h-14 w-14 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border border-border/50 shadow-sm">
          <Image
            alt={item.name}
            className="object-cover"
            fill
            src={item.image_url || "https://picsum.photos/seed/placeholder/64/64"}
          />
        </div>
      </TableCell>
      <TableCell className="font-medium text-[14px] sm:text-lg p-2 sm:p-5 overflow-hidden">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="truncate block font-bold text-foreground" title={item.name}>{item.name}</span>
          <div className="sm:hidden">
            <Badge variant="outline" className="text-[11px] px-2 py-0.5 h-5 bg-muted/50 whitespace-nowrap">
              {item.categories?.name || 'غير مصنف'}
            </Badge>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell p-5">
        <Badge variant="outline" className="bg-muted/50 text-sm px-3 py-1">{item.categories?.name || 'غير مصنف'}</Badge>
      </TableCell>
      <TableCell className="font-mono text-[13px] sm:text-lg font-bold p-2 sm:p-5 whitespace-nowrap text-left sm:text-right text-brand-primary">{item.price} ج.م</TableCell>
      <TableCell className="p-2 sm:p-5 text-left">
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button aria-haspopup="true" size="icon" variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8">
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
                catalogPlan={catalogPlan}
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

export function ItemsTable({ items, catalogId, catalogPlan, categories }: ItemsTableProps) {
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
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-x-auto">
      <Table className="w-full table-fixed min-w-[350px]">
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[70px] sm:w-[120px] p-2 sm:p-5 text-right font-bold text-foreground">
              الصورة
            </TableHead>
            <TableHead className="sm:w-auto p-2 sm:p-5 text-right font-bold text-foreground">الاسم</TableHead>
            <TableHead className="hidden sm:table-cell p-5 text-right font-bold text-foreground">التصنيف</TableHead>
            <TableHead className="w-[90px] sm:w-[150px] p-2 sm:p-5 text-right font-bold text-foreground">السعر</TableHead>
            <TableHead className="w-[45px] sm:w-[60px] p-2 sm:p-5 text-left">
              <span className="sr-only">الإجراءات</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <ItemRow key={item.id} item={item} catalogId={catalogId} catalogPlan={catalogPlan} categories={categories} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
