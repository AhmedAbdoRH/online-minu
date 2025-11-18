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
    <TableRow>
      <TableCell className="hidden sm:table-cell">
        <Image
          alt={item.name}
          className="aspect-square rounded-md object-cover"
          height="64"
          src={item.image_url || "https://picsum.photos/seed/placeholder/64/64"}
          width="64"
        />
      </TableCell>
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell>
          <Badge variant="outline">{item.categories?.name || 'غير مصنف'}</Badge>
      </TableCell>
      <TableCell>{item.price} ر.س</TableCell>
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
                  <DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)}>تعديل</DropdownMenuItem>
                  <AlertDialogTrigger asChild>
                      <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>حذف</DropdownMenuItem>
                  </AlertDialogTrigger>
              </DropdownMenuContent>
              </DropdownMenu>

              {/* Edit Dialog */}
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>تعديل المنتج</DialogTitle>
                      <DialogDescription>قم بتحديث تفاصيل المنتج.</DialogDescription>
                  </DialogHeader>
                  <ItemForm catalogId={catalogId} categories={categories} item={item} onSuccess={() => setIsEditDialogOpen(false)} />
              </DialogContent>
              
              {/* Delete Dialog */}
              <AlertDialogContent>
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
              </AlertDialogContent>

          </AlertDialog>
        </Dialog>
      </TableCell>
    </TableRow>
  )
}

export function ItemsTable({ items, catalogId, categories }: ItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        لم تقم بإضافة أي منتجات بعد.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden w-[100px] sm:table-cell">
            <span className="sr-only">الصورة</span>
          </TableHead>
          <TableHead>الاسم</TableHead>
          <TableHead>الفئة</TableHead>
          <TableHead>السعر</TableHead>
          <TableHead>
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
  );
}
