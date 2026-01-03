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
          <div
            className="absolute -top-3 bottom-1/2 w-px bg-border/60"
            style={{ right: -18 }}
          />
          <div
            className="absolute top-1/2 h-px w-4 bg-border/60"
            style={{ right: -18 }}
          />
        </>
      )}

      <div
        className={cn(
          "group relative flex items-center justify-between rounded-xl border p-3 sm:p-5 transition-all duration-200",
          isSubcategory
            ? "border-border/40 bg-muted/20 hover:bg-muted/40 hover:border-border/60"
            : "glass-surface border-border/50 hover:border-primary/20 mb-3"
        )}
      >
        <div className="flex items-center gap-2 sm:gap-5 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 sm:h-10 sm:w-10 shrink-0 text-muted-foreground/70 transition-transform hover:bg-muted hover:text-foreground",
              !hasSubcategories && "opacity-0 pointer-events-none"
            )}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6" /> : <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />}
          </Button>

          <div className={cn(
            "flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-xl sm:rounded-3xl shadow-sm transition-colors",
            isSubcategory
              ? "bg-background border border-border/50 text-muted-foreground"
              : "bg-primary/10 text-primary border border-primary/10"
          )}>
            {hasSubcategories ? (
              isExpanded ? <FolderOpen className="h-5 w-5 sm:h-8 sm:w-8" /> : <Folder className="h-5 w-5 sm:h-8 sm:w-8" />
            ) : (
              <Folder className="h-5 w-5 sm:h-8 sm:w-8" />
            )}
          </div>

          <div className="flex flex-col gap-0.5 sm:gap-1.5 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-4 min-w-0">
              <span className={cn(
                "font-bold text-foreground tracking-tight truncate",
                !isSubcategory ? "text-base sm:text-2xl" : "text-sm sm:text-xl"
              )}>
                {category.name}
              </span>
              {hasSubcategories && (
                <Badge variant="secondary" className="h-5 sm:h-8 px-1.5 sm:px-3 text-[10px] sm:text-sm font-bold bg-muted/50 text-muted-foreground border-transparent whitespace-nowrap">
                  {category.subcategories.length} <span className="hidden xs:inline">فئات</span>
                </Badge>
              )}
            </div>
            <span className="text-[10px] sm:text-sm font-bold text-muted-foreground/80">
              {isSubcategory ? 'تصنيف فرعي' : 'تصنيف رئيسي'}
            </span>
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-1 sm:gap-4 transition-opacity duration-200 shrink-0",
          isSubcategory ? "opacity-100 sm:opacity-0 sm:group-hover:opacity-100" : "opacity-100"
        )}>
          {!isSubcategory && (
            <Button
              variant="default"
              size="sm"
              className="h-8 sm:h-11 w-auto px-2 sm:px-6 gap-1 text-[10px] sm:text-sm font-bold bg-brand-primary hover:bg-brand-primary/90 text-primary-foreground shadow-sm transition-all rounded-full"
              onClick={() => setIsAddSubOpen(true)}
            >
              <Plus className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
              <span className="hidden xs:inline">تصنيف فرعي</span>
              <span className="xs:hidden">فرعي</span>
            </Button>
          )}
          <CategoryActionsMenu category={category} catalogId={catalogId} categories={categories} size="icon" />
        </div>
      </div>

      <Dialog open={isAddSubOpen} onOpenChange={setIsAddSubOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>إضافة تصنيف فرعي</DialogTitle>
            <DialogDescription>
              إضافة تصنيف فرعي جديد تحت "{category.name}".
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            catalogId={catalogId}
            categories={categories}
            defaultParentId={category.id}
            onSuccess={() => setIsAddSubOpen(false)}
            onCancel={() => setIsAddSubOpen(false)}
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
            className="relative mr-4 sm:mr-10 flex flex-col gap-2 sm:gap-3 pt-2 sm:pt-3"
          >
            <div
              className="absolute bottom-4 top-0 w-px bg-border/60"
              style={{ right: -18 }}
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
        toast({ title: 'تم الحذف', description: 'تم حذف التصنيف بنجاح.' });
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
            className="h-9 w-9 sm:h-10 sm:w-10 text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontal className="h-5 w-5 sm:h-6 sm:w-6" />
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
            تعديل التصنيف
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onSelect={(e) => {
              e.preventDefault();
              setDeleteOpen(true);
            }}
          >
            حذف التصنيف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل التصنيف</DialogTitle>
            <DialogDescription>قم بتحديث اسم التصنيف أو ربطه بتصنيف رئيسي.</DialogDescription>
          </DialogHeader>
          <CategoryForm
            catalogId={catalogId}
            category={category}
            categories={categories}
            hideParentSelection={category.parent_category_id !== null}
            onSuccess={() => setEditOpen(false)}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف هذا التصنيف وجميع التصنيفات الفرعية والمنتجات المرتبطة به بشكل دائم.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              نعم، احذف التصنيف
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
        <h3 className="mb-1 text-lg font-semibold">لا توجد تصنيفات</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          لم تقم بإضافة أي تصنيفات بعد. ابدأ بإضافة تصنيف جديد لتنظيم متجرك.
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
