'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubmitButton } from '@/components/common/SubmitButton';
import { Button } from '@/components/ui/button';
import { createItem, updateItem } from '@/app/actions/items';
import { useToast } from '@/hooks/use-toast';
import type { Category, MenuItemWithDetails } from '@/lib/types';
import { UpgradeAlert } from './UpgradeAlert';
import { useState } from 'react';
import { Plus, Image as ImageIcon } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب').max(100),
  description: z.string().max(255).optional().or(z.literal('')),
  price: z.coerce.number().min(0, 'يجب أن يكون السعر إيجابياً'),
  category_id: z.string().min(1, 'التصنيف مطلوب'),
  main_image: z.instanceof(File).optional(),
  additional_images: z.array(z.instanceof(File))
    .optional()
    .or(z.literal(undefined)),
});

// For update, images are not required
const updateFormSchema = formSchema.extend({
  main_image: z.instanceof(File).optional(),
  additional_images: z.array(z.instanceof(File)).optional().or(z.literal(undefined))
});

interface ItemFormProps {
  catalogId: number;
  catalogPlan: string;
  categories: Category[];
  item?: MenuItemWithDetails;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ItemForm({ catalogId, catalogPlan, categories, item, onSuccess, onCancel }: ItemFormProps) {
  const { toast } = useToast();
  const [showUpgradeAlert, setShowUpgradeAlert] = useState(false);
  const [submissionId, setSubmissionId] = useState<string>('');
  const isPro = catalogPlan === 'pro';

  // التحقق من أن categories موجود
  const validCategories = Array.isArray(categories) ? categories : [];

  // بناء هيكل فئات هرمي
  const buildHierarchicalCategories = (parentId: number | null = null, depth = 0): (Category & { depth: number; children: any[] })[] => {
    return validCategories
      .filter(cat => (cat?.parent_category_id ?? null) === parentId)
      .map(cat => ({
        ...cat,
        depth,
        children: buildHierarchicalCategories(cat.id, depth + 1)
      }));
  };

  // عرض فئات متداخلة مع مسافات
  const renderCategoryItems = (categories: (Category & { depth: number; children: any[] })[]): JSX.Element[] => {
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
      category_id: item?.category_id ? item.category_id.toString() : '',
      main_image: undefined,
      additional_images: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Prevent multiple submissions
    const isSubmitting = form.formState.isSubmitting;
    if (isSubmitting) {
      return;
    }

    // Create unique submission ID
    const currentSubmissionId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    if (submissionId === currentSubmissionId) {
      return;
    }
    setSubmissionId(currentSubmissionId);

    try {
      console.log('Form submitted with values:', values);

      const formData = new FormData();
      formData.append('catalogId', catalogId.toString());
      formData.append('name', values.name);
      formData.append('description', values.description || '');
      formData.append('price', values.price.toString());
      formData.append('category_id', values.category_id);

      if (values.main_image) {
        formData.append('main_image', values.main_image);
      }

      if (values.additional_images && values.additional_images.length > 0) {
        values.additional_images.forEach((file) => {
          formData.append('additional_images', file);
        });
      }

      console.log('Sending form data...');
      const result = item ? await updateItem(item.id, formData) : await createItem(formData);

      console.log('Server response:', result);

      if (result.error) {
        if (result.error === 'LIMIT_REACHED') {
          setShowUpgradeAlert(true);
          return;
        }
        toast({ title: 'خطأ', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'نجاح!', description: `تم ${item ? 'تحديث' : 'إنشاء'} المنتج بنجاح.` });
        form.reset();
        console.log('onSuccess called');
        // Introduce a small delay to allow revalidatePath to complete
        setTimeout(() => {
          onSuccess?.();
        }, 100);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({ title: 'خطأ', description: 'حدث خطأ غير متوقع', variant: 'destructive' });
    }
  };

  return (
    <>
      <UpgradeAlert
        open={showUpgradeAlert}
        onOpenChange={setShowUpgradeAlert}
        resourceType="product"
      />
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
                  <FormLabel>السعر (ج.م)</FormLabel>
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
                  <Select onValueChange={(val) => {
                    console.log('Category selected:', val);
                    field.onChange(val);
                  }} value={field.value || ''}>
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
          
          {/* الصورة الرئيسية */}
          <FormField
            control={form.control}
            name="main_image"
            render={({ field: { onChange, value, ...rest } }) => (
              <FormItem>
                <FormLabel>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    الصورة الرئيسية للمنتج
                    {item && ' (اختياري للتغيير)'}
                  </div>
                </FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onChange(file);
                      }
                    }}
                    {...rest}
                  />
                </FormControl>
                <FormMessage />
                {item?.image_url && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    الصورة الرئيسية الحالية: متوفرة
                  </div>
                )}
              </FormItem>
            )}
          />

          {/* الصور الإضافية */}
          <FormField
            control={form.control}
            name="additional_images"
            render={({ field: { onChange, value, ...rest } }) => (
              <FormItem>
                <FormLabel>
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    الصور الإضافية
                    {!isPro && <span className="text-xs text-muted-foreground mr-2">(ميزة خاصة بالباقة الاحترافية)</span>}
                    {isPro && <span className="text-xs text-primary mr-2">(ميزة خاصة بالباقة الاحترافية)</span>}
                  </div>
                </FormLabel>
                <FormControl>
                  {isPro ? (
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept="image/*"
                        multiple={true}
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          onChange(files);
                        }}
                        {...rest}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept="image/*"
                        multiple={true}
                        disabled={true}
                        placeholder="ميزة خاصة بالباقة الاحترافية"
                        className="opacity-50 cursor-not-allowed"
                        {...rest}
                      />
                    </div>
                  )}
                </FormControl>
                <FormMessage />
                {item && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    الصور الإضافية الحالية: {(item as any).product_images?.length || 0} صورة
                  </div>
                )}
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={onCancel}
              className="w-full"
            >
              إلغاء
            </Button>
            <SubmitButton pendingText="جاري الحفظ..." className="w-full">
              {item ? 'حفظ التغييرات' : 'حفظ المنتج'}
            </SubmitButton>
          </div>
        </form>
      </Form>
    </>
  );
}
