'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubmitButton } from '@/components/common/SubmitButton';
import { createItem, updateItem } from '@/app/actions/items';
import { useToast } from '@/hooks/use-toast';
import type { Category, MenuItem } from '@/lib/types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب').max(100),
  description: z.string().max(255).optional(),
  price: z.coerce.number().min(0, 'يجب أن يكون السعر إيجابياً'),
  category_id: z.string().min(1, 'الفئة مطلوبة'),
  image: z.instanceof(File)
    .refine((file) => file.size > 0, 'صورة المنتج مطلوبة.')
    .refine((file) => file.size <= MAX_FILE_SIZE, `الحد الأقصى لحجم الملف 5 ميغابايت.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      ".jpg, .jpeg, .png و .webp هي الملفات المقبولة."
    ).optional(),
});

// For update, image is not required
const updateFormSchema = formSchema.extend({
    image: formSchema.shape.image.optional()
});

interface ItemFormProps {
  catalogId: number;
  categories: Category[];
  item?: MenuItem;
  onSuccess?: () => void;
}

export function ItemForm({ catalogId, categories, item, onSuccess }: ItemFormProps) {
  const { toast } = useToast();

  // بناء هيكل فئات هرمي
  const buildHierarchicalCategories = (parentId: number | null = null, depth = 0) => {
    return categories
      .filter(cat => cat.parent_category_id === parentId)
      .map(cat => ({
        ...cat,
        depth,
        children: buildHierarchicalCategories(cat.id, depth + 1)
      }));
  };

  // عرض فئات متداخلة مع مسافات
  const renderCategoryItems = (categories: (Category & { depth: number; children: any[] })[]) => {
    return categories.flatMap(cat => [
      <SelectItem key={cat.id} value={cat.id.toString()}>
        {Array(cat.depth).fill('— ').join('')}{cat.name}
      </SelectItem>,
      ...renderCategoryItems(cat.children)
    ]);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(item ? updateFormSchema : formSchema),
    defaultValues: {
      name: item?.name || '',
      description: item?.description || '',
      price: item?.price || 0,
      category_id: item?.category_id.toString() || '',
      image: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append('catalogId', catalogId.toString());
    formData.append('name', values.name);
    formData.append('description', values.description || '');
    formData.append('price', values.price.toString());
    formData.append('category_id', values.category_id);
    if (values.image) {
      formData.append('image', values.image);
    }
    
    const result = item ? await updateItem(item.id, formData) : await createItem(formData);

    if (result.error) {
      toast({ title: 'خطأ', description: result.error, variant: 'destructive' });
    } else {
      toast({ title: 'نجاح!', description: `تم ${item ? 'تحديث' : 'إنشاء'} المنتج بنجاح.` });
      form.reset();
      onSuccess?.();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem className="col-span-2">
                <FormLabel>اسم المنتج</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
                <FormItem className="col-span-2">
                <FormLabel>الوصف (اختياري)</FormLabel>
                <FormControl><Textarea {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
                <FormItem>
                <FormLabel>السعر (ر.س)</FormLabel>
                <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>الفئة</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="اختر فئة" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {renderCategoryItems(buildHierarchicalCategories())}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        <FormField
          control={form.control}
          name="image"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel>صورة المنتج {item && '(اختياري للتغيير)'}</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0])} {...rest} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SubmitButton pendingText="جاري الحفظ..." className="w-full">
          {item ? 'حفظ التغييرات' : 'حفظ المنتج'}
        </SubmitButton>
      </form>
    </Form>
  );
}
