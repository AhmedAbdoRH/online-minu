'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/common/SubmitButton';
import { createCategory, updateCategory } from '@/app/actions/categories';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(2, 'يجب أن يكون الاسم حرفين على الأقل.').max(50),
  parent_category_id: z.coerce.number().nullable().optional(),
});

interface CategoryFormProps {
  catalogId: number;
  category?: Category;
  categories: Category[]; // Add categories prop for parent selection
  onSuccess?: () => void;
}

export function CategoryForm({ catalogId, category, categories, onSuccess }: CategoryFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || '',
      parent_category_id: category?.parent_category_id || null,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append('catalog_id', String(catalogId));
    formData.append('name', values.name);
    if (values.parent_category_id) {
      formData.append('parent_category_id', String(values.parent_category_id));
    }

    let result;
    if (category) {
      formData.append('id', String(category.id));
      result = await updateCategory(null, formData);
    } else {
      result = await createCategory(null, formData);
    }

    if (result.message) {
      toast({
        title: result.message.includes('فشل') ? 'خطأ' : 'نجاح!',
        description: result.message,
        variant: result.message.includes('فشل') ? 'destructive' : 'default',
      });
      if (!result.message.includes('فشل')) {
        form.reset();
        onSuccess?.();
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم الفئة</FormLabel>
              <FormControl>
                <Input placeholder="مثال: مشروبات ساخنة" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="parent_category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الفئة الأم (اختياري)</FormLabel>
              <Select onValueChange={(value) => field.onChange(value === "none" ? null : Number(value))} value={field.value === null ? "none" : String(field.value)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر فئة أم" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">لا يوجد فئة أم</SelectItem>

                  {categories.filter(cat => cat.id !== category?.id && typeof cat.id === 'number' && cat.id > 0).map((cat) => {
                    console.log('Category ID:', cat.id, 'Stringified ID:', String(cat.id));
                    return (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  )})}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <SubmitButton pendingText={category ? 'جاري التحديث...' : 'جاري الحفظ...'} className="w-full">
          {category ? 'حفظ التغييرات' : 'حفظ الفئة'}
        </SubmitButton>
      </form>
    </Form>
  );
}
