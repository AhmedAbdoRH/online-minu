'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CategoryForm } from './CategoryForm';
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { deleteCategory } from '@/app/actions/categories';
import { toast } from '@/hooks/use-toast';

export function CategoriesTable({ categories, catalogId }: { categories: Category[], catalogId: number }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = async (categoryId: number) => {
    const result = await deleteCategory(categoryId);
    if (result.error) {
        toast({ title: 'خطأ', description: result.error, variant: 'destructive' });
    } else {
        toast({ title: 'نجاح', description: 'تم حذف الفئة.' });
    }
  }

  if (categories.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        لم تقم بإضافة أي فئات بعد.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>الاسم</TableHead>
          <TableHead>الفئة الأم</TableHead>
          <TableHead>تاريخ الإنشاء</TableHead>
          <TableHead>
            <span className="sr-only">الإجراءات</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => {
          const parentCategory = category.parent_category_id
            ? categories.find(cat => cat.id === category.parent_category_id)
            : null;
          return (
            <TableRow key={category.id}>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell>{parentCategory ? parentCategory.name : 'فئة رئيسية'}</TableCell>
              <TableCell>{new Date(category.created_at).toLocaleDateString('ar-SA')}</TableCell>
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
                          <DialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>تعديل</DropdownMenuItem>
                          </DialogTrigger>
                          <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>حذف</DropdownMenuItem>
                          </AlertDialogTrigger>
                      </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Edit Dialog Content */}
                      <DialogContent>
                          <DialogHeader>
                              <DialogTitle>تعديل الفئة</DialogTitle>
                              <DialogDescription>
                                  قم بتحديث اسم الفئة.
                              </DialogDescription>
                          </DialogHeader>
                          <CategoryForm catalogId={catalogId} category={category} categories={categories} onSuccess={() => setIsEditDialogOpen(false)} />
                      </DialogContent>
                      
                      {/* Delete Alert Dialog Content */}
                      <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>هل أنت متأكد تماماً؟</AlertDialogTitle>
                              <AlertDialogDescription>
                              سيتم حذف هذه الفئة وجميع المنتجات المرتبطة بها بشكل دائم. لا يمكن التراجع عن هذا الإجراء.
                              </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(category.id)} className="bg-destructive hover:bg-destructive/90">
                                  نعم، احذف الفئة
                              </AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>

                  </AlertDialog>
                </Dialog>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
