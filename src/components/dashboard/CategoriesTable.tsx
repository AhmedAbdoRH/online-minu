'use client';

import { useState, useTransition } from 'react';
import type { CategoryWithSubcategories } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ChevronRight, ChevronDown, Folder, FolderOpen, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CategoryForm } from './CategoryForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { deleteCategory } from '@/app/actions/categories';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type CategoryActionsMenuProps = {
  category: CategoryWithSubcategories;
  catalogId: number;
  categories: CategoryWithSubcategories[];
  size?: 'icon' | 'default';
};

type CategoryRowProps = {
  category: CategoryWithSubcategories;
  catalogId: number;
  categories: CategoryWithSubcategories[];
  level?: number;
  isLast?: boolean;
};

function CategoryRow({ category, catalogId, categories, level = 0, isLast = false }: CategoryRowProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddSubOpen, setIsAddSubOpen] = useState(false);
  const hasSubcategories = category.subcategories && category.subcategories.length > 0;
  const isSubcategory = category.parent_category_id !== null;

  return (
    <div className="relative">
      {/* Connection lines for tree structure */}
      {level > 0 && (
        <>
          {/* Vertical line from parent */}
          <div
            className="absolute -top-3 bottom-1/2 w-px bg-border/60"
            style={{ left: -24 }}
          />
          {/* Horizontal line to item */}
          <div
            className="absolute top-1/2 h-px w-6 bg-border/60"
            style={{ left: -24 }}
          />
        </>
      )}

      <div
        className={cn(
          "group relative flex items-center justify-between rounded-xl border p-4 transition-all duration-200",
          isSubcategory
            ? "border-border/40 bg-muted/20 hover:bg-muted/40 hover:border-border/60"
            : "glass-surface border-border/50 hover:border-primary/20 mb-3"
        )}
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 shrink-0 text-muted-foreground/70 transition-transform hover:bg-muted hover:text-foreground",
              !hasSubcategories && "opacity-0 pointer-events-none"
            )}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>

          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-colors",
            isSubcategory
              ? "bg-background border border-border/50 text-muted-foreground"
              : "bg-primary/10 text-primary border border-primary/10"
          )}>
            {hasSubcategories ? (
              isExpanded ? <FolderOpen className="h-6 w-6" /> : <Folder className="h-6 w-6" />
            ) : (
              <Folder className="h-6 w-6" />
            )}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className={cn(
                "font-bold text-foreground tracking-tight",
                !isSubcategory && "text-lg"
              )}>
                {category.name}
              </span>
              {hasSubcategories && (
                <Badge variant="secondary" className="h-6 px-2 text-xs font-medium bg-muted/50 text-muted-foreground border-transparent">
                  {category.subcategories.length} فئات فرعية
                </Badge>
              )}
            </div>
            <span className="text-xs font-medium text-muted-foreground/80">
              {isSubcategory ? 'فئة فرعية' : 'فئة رئيسية'}
            </span>
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-3 transition-opacity duration-200",
          isSubcategory ? "opacity-100 sm:opacity-0 sm:group-hover:opacity-100" : "opacity-100"
        )}>
          {!isSubcategory && (
            <Button
              variant="default"
              size="sm"
              className="h-9 px-4 text-xs font-medium bg-brand-primary hover:bg-brand-primary/90 text-primary-foreground shadow-sm transition-all"
              onClick={() => setIsAddSubOpen(true)}
            >
              <Plus className="h-3.5 w-3.5 ml-1.5" />
              إضافة فئة فرعية
            </Button>
          )}
          <CategoryActionsMenu category={category} catalogId={catalogId} categories={categories} size="icon" />
        </div>
      </div>

      <Dialog open={isAddSubOpen} onOpenChange={setIsAddSubOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>إضافة فئة فرعية</DialogTitle>
            <DialogDescription>
              إضافة فئة فرعية جديدة تحت "{category.name}".
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            catalogId={catalogId}
            categories={categories}
            defaultParentId={category.id}
            onSuccess={() => setIsAddSubOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AnimatePresence initial={false}>
        {hasSubcategories && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="relative mr-10 flex flex-col gap-3 pt-3"
          >
            {/* Vertical line for children */}
            <div
              className="absolute bottom-4 left-0 top-0 w-px bg-border/60"
              style={{ left: -24 }}
            />

            {category.subcategories.map((subCategory, index) => (
              <CategoryRow
                key={subCategory.id}
                category={subCategory}
                catalogId={catalogId}
                categories={categories}
                level={level + 1}
                isLast={index === category.subcategories.length - 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoryActionsMenu({ category, catalogId, categories, size = 'default' }: CategoryActionsMenuProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCategory(category.id);
      if (result.error) {
        toast({ title: 'خطأ', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'تم الحذف', description: 'تم حذف الفئة بنجاح.' });
        setDeleteOpen(false);
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-haspopup="true"
            size={size === 'icon' ? 'icon' : 'sm'}
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">القائمة</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setEditOpen(true);
            }}
            className="cursor-pointer"
          >
            تعديل الفئة
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onSelect={(e) => {
              e.preventDefault();
              setDeleteOpen(true);
            }}
          >
            حذف الفئة
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل الفئة</DialogTitle>
            <DialogDescription>قم بتحديث اسم الفئة أو ربطها بفئة رئيسية.</DialogDescription>
          </DialogHeader>
          <CategoryForm
            catalogId={catalogId}
            category={category}
            categories={categories}
            hideParentSelection={category.parent_category_id !== null}
            onSuccess={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف هذه الفئة وجميع الفئات الفرعية والمنتجات المرتبطة بها بشكل دائم.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              نعم، احذف الفئة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function CategoriesTable({ categories, catalogId }: { categories: CategoryWithSubcategories[]; catalogId: number }) {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/25 bg-muted/10 py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Folder className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="mb-1 text-lg font-semibold">لا توجد فئات</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          لم تقم بإضافة أي فئات بعد. ابدأ بإضافة فئة جديدة لتنظيم كتالوجك.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {categories.map((category, index) => (
        <CategoryRow
          key={category.id}
          category={category}
          catalogId={catalogId}
          categories={categories}
          isLast={index === categories.length - 1}
        />
      ))}
    </div>
  );
}
