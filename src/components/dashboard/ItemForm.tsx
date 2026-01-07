'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel, SelectSeparator } from '@/components/ui/select';
import { SubmitButton } from '@/components/common/SubmitButton';
import { Button } from '@/components/ui/button';
import { createItem, updateItem } from '@/app/actions/items';
import { useToast } from '@/hooks/use-toast';
import type { Category, MenuItemWithDetails } from '@/lib/types';
import { UpgradeAlert } from './UpgradeAlert';
import { useState } from 'react';
import { Plus, Image as ImageIcon, Trash2, Tag, PlusCircle, Upload } from 'lucide-react';
import { useFieldArray } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import { compressImage } from '@/lib/image-utils';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب').max(100),
  description: z.string().max(255).optional().or(z.literal('')),
  price: z.coerce.number().min(0, 'يجب أن يكون السعر إيجابياً').optional().or(z.literal(undefined)),
  category_id: z.string().min(1, 'التصنيف مطلوب'),
  main_image: z.instanceof(File).optional(),
  additional_images: z.array(z.instanceof(File))
    .optional()
    .or(z.literal(undefined)),
  pricing_type: z.enum(['unified', 'multi']).default('unified'),
  variants: z.array(z.object({
    name: z.string().min(1, 'اسم الخيار مطلوب'),
    price: z.coerce.number().min(0, 'السعر مطلوب')
  })).optional(),
}).refine((data) => {
  if (data.pricing_type === 'unified') {
    return data.price !== undefined && data.price !== null;
  }
  return true;
}, {
  message: "السعر مطلوب في حال السعر الموحد",
  path: ["price"],
}).refine((data) => {
  if (data.pricing_type === 'multi') {
    return data.variants && data.variants.length > 0;
  }
  return true;
}, {
  message: "يجب إضافة خيار واحد على الأقل في حال الأسعار المتعددة",
  path: ["variants"],
});

// For update, images are not required
const updateFormSchema = formSchema;

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
  const router = useRouter();
  const [showUpgradeAlert, setShowUpgradeAlert] = useState(false);
  const [submissionId, setSubmissionId] = useState<string>('');
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(item?.image_url || null);
  const isPro = catalogPlan === 'pro';

  // Determine initial pricing type
  const initialPricingType = item?.item_variants && item.item_variants.length > 0 ? 'multi' : 'unified';
  const [pricingType, setPricingType] = useState<'unified' | 'multi'>(initialPricingType);

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
      <SelectItem 
        key={cat.id} 
        value={cat.id.toString()}
        className="my-1.5 cursor-pointer focus:bg-transparent p-0 w-full"
      >
        <div className={cn(
          "w-full px-4 py-3 rounded-lg transition-all flex items-center gap-2",
          cat.depth === 0 
            ? "bg-[#4ade80]/10 text-[#4ade80] font-black text-sm border border-[#4ade80]/20" 
            : "bg-muted/50 text-foreground font-bold text-[13px]"
        )}
        >
          {cat.depth > 0 && <span className="opacity-60 shrink-0 text-[#4ade80]" style={{ marginRight: `${cat.depth * 10}px` }}>└─</span>}
          <span className="truncate">{cat.name}</span>
        </div>
      </SelectItem>,
      ...renderCategoryItems(cat.children)
    ]);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(item ? updateFormSchema : formSchema),
    defaultValues: {
      name: item?.name || '',
      description: item?.description || '',
      price: item?.price || undefined,
      category_id: item?.category_id ? item.category_id.toString() : '',
      main_image: undefined,
      additional_images: undefined,
      pricing_type: initialPricingType,
      variants: item?.item_variants?.map(v => ({ name: v.name, price: v.price })) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
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

      // Handle pricing based on type
      if (values.pricing_type === 'multi' && values.variants && values.variants.length > 0) {
        // Send variants as JSON string
        formData.append('variants', JSON.stringify(values.variants));
        // Find the minimum price to send as a fallback/default price
        const minPrice = Math.min(...values.variants.map(v => v.price));
        formData.append('price', minPrice.toString());
      } else {
        formData.append('price', (values.price || 0).toString());
        // Ensure to clear variants if switching back to unified
        formData.append('variants', JSON.stringify([]));
      }

      formData.append('category_id', values.category_id);

      if (values.main_image) {
        console.log('Compressing main image...');
        const compressedMain = await compressImage(values.main_image);
        formData.append('main_image', compressedMain);
      }

      if (values.additional_images && values.additional_images.length > 0) {
        console.log(`Compressing ${values.additional_images.length} additional images...`);
        for (const img of values.additional_images) {
          const compressedImg = await compressImage(img);
          formData.append('additional_images', compressedImg);
        }
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* الجهة اليمنى: البيانات الأساسية */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-bold">الفئة</FormLabel>
                      <Select onValueChange={(val) => {
                        console.log('Category selected:', val);
                        if (val === 'new_category') {
                          if (onCancel) onCancel();
                          router.push('/dashboard/categories');
                          return;
                        }
                        field.onChange(val);
                      }} value={field.value || ''}>
                        <FormControl>
                        <SelectTrigger className="h-12 text-base border-2 focus:ring-brand-primary/20">
                          <SelectValue placeholder="اختر فئة للمنتج" />
                        </SelectTrigger>
                      </FormControl>
                        <SelectContent>
                            <SelectGroup>
                               <SelectLabel className="text-[#4ade80] font-black py-3.5 px-4 text-[15px] bg-[#4ade80]/5 mb-1">الإجراءات</SelectLabel>
                               <SelectItem 
                             value="new_category" 
                             className="flex items-center gap-2 text-[#4ade80] font-black text-[15px] cursor-pointer py-4 focus:bg-muted focus:text-[#22c55e] border-b border-muted/50"
                           >
                             <div className="flex items-center gap-2 justify-center w-full">
                               <PlusCircle className="h-5 w-5 stroke-[3px]" />
                               <span>إضافة تصنيف جديد</span>
                             </div>
                           </SelectItem>
                             </SelectGroup>
                             <SelectSeparator className="bg-[#4ade80]/10" />
                             <SelectGroup>
                               <SelectLabel className="text-[#4ade80] font-black py-3.5 px-4 text-[15px] bg-[#4ade80]/5 mt-1 mb-1">التصنيفات المتاحة</SelectLabel>
                               {renderCategoryItems(buildHierarchicalCategories())}
                             </SelectGroup>
                          </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-bold">اسم المنتج</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: بيتزا مارجريتا" className="h-12 text-lg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-bold">وصف المنتج</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="اكتب وصفاً جذاباً لمنتجك..." 
                          className="min-h-[120px] text-base resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4 rounded-xl border-2 border-brand-primary/10 p-6 bg-brand-primary/5">
                <FormLabel className="text-lg font-black text-brand-primary flex items-center gap-2">
                  <span className="bg-brand-primary text-white p-1 rounded-md"><Plus className="h-4 w-4" /></span>
                  نظام التسعير
                </FormLabel>
                <Tabs
                  value={pricingType}
                  onValueChange={(val) => {
                    const type = val as 'unified' | 'multi';
                    setPricingType(type);
                    form.setValue('pricing_type', type);
                  }}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 h-12">
                    <TabsTrigger value="multi" className="text-base font-bold data-[state=active]:bg-white data-[state=active]:text-brand-primary shadow-sm">
                      أسعار متعددة (أحجام)
                    </TabsTrigger>
                    <TabsTrigger value="unified" className="text-base font-bold data-[state=active]:bg-white data-[state=active]:text-brand-primary shadow-sm">
                      سعر موحد
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="unified" className="mt-6">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">السعر النهائي (ج.م)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input type="number" step="0.01" placeholder="0.00" className="h-12 pl-12 text-xl font-bold" {...field} />
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">ج.م</span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="multi" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground font-medium">أضف الأحجام المختلفة (مثلاً: صغير، كبير)</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => append({ name: '', price: undefined as any })}
                          className="gap-2 border-brand-primary text-brand-primary hover:bg-brand-primary/10 font-bold"
                        >
                          <Plus className="h-4 w-4" />
                          إضافة خيار
                        </Button>
                      </div>

                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                        {fields.map((field, index) => (
                          <div key={field.id} className="flex gap-3 items-start p-3 rounded-lg bg-white border-2 border-transparent hover:border-brand-primary/20 transition-all shadow-sm">
                            <FormField
                              control={form.control}
                              name={`variants.${index}.name`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input placeholder="مثلاً: حجم كبير" className="h-11 border-none bg-muted/30 focus-visible:ring-0 font-bold" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`variants.${index}.price`}
                              render={({ field }) => (
                                <FormItem className="w-32">
                                  <FormControl>
                                    <div className="relative">
                                      <Input type="number" step="0.01" placeholder="0.00" className="h-11 pl-10 border-none bg-muted/30 focus-visible:ring-0 font-bold" {...field} />
                                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold">ج.م</span>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              className="text-destructive hover:bg-destructive/10 h-11 w-11"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* الجهة اليسرى: الصور */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-4 rounded-xl border-2 border-dashed border-muted-foreground/20 p-6 bg-muted/5">
                <FormField
                  control={form.control}
                  name="main_image"
                  render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 mb-4 text-base font-bold">
                        <ImageIcon className="h-5 w-5 text-brand-primary" />
                        الصورة الرئيسية للمنتج
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <input
                            type="file"
                            id="main-image-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const compressed = await compressImage(file);
                                onChange(compressed);
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setMainImagePreview(reader.result as string);
                                };
                                reader.readAsDataURL(compressed);
                              }
                            }}
                            {...rest}
                          />
                          <label
                            htmlFor="main-image-upload"
                            className={cn(
                              "relative flex flex-col items-center justify-center w-full aspect-square rounded-2xl border-4 border-dashed cursor-pointer transition-all overflow-hidden",
                              mainImagePreview 
                                ? "border-brand-primary/40 bg-white shadow-inner" 
                                : "border-muted-foreground/20 hover:border-brand-primary/50 hover:bg-brand-primary/5 bg-white"
                            )}
                          >
                            {mainImagePreview ? (
                              <>
                                <img 
                                  src={mainImagePreview} 
                                  alt="Preview" 
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="flex flex-col items-center text-white">
                                    <Upload className="h-10 w-10 mb-2" />
                                    <span className="font-bold">تغيير الصورة</span>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center text-center p-6">
                                <div className="bg-brand-primary/10 p-5 rounded-full mb-4">
                                  <Upload className="h-10 w-10 text-brand-primary" />
                                </div>
                                <span className="text-lg font-black text-foreground">أضف صورة جذابة</span>
                                <span className="text-sm text-muted-foreground mt-2">يفضل أن تكون مربعة وبإضاءة جيدة</span>
                              </div>
                            )}
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additional_images"
                  render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem className="mt-8">
                      <FormLabel className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-base font-bold">
                          <Plus className="h-5 w-5 text-brand-primary" />
                          صور إضافية للمنتج
                        </div>
                        {!isPro && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold">باقة PRO فقط</span>}
                      </FormLabel>
                      <FormControl>
                        <div className={cn(!isPro && "opacity-50 pointer-events-none")}>
                          <input
                            type="file"
                            id="additional-images-upload"
                            className="hidden"
                            accept="image/*"
                            multiple={true}
                            onChange={async (e) => {
                              const files = Array.from(e.target.files || []);
                              if (files.length > 0) {
                                const compressedFiles = await Promise.all(
                                  files.map(file => compressImage(file))
                                );
                                onChange(compressedFiles);
                              }
                            }}
                            {...rest}
                          />
                          <label
                            htmlFor="additional-images-upload"
                            className="flex flex-col items-center justify-center w-full py-8 rounded-xl border-2 border-dashed border-muted-foreground/20 hover:border-brand-primary/40 bg-white transition-all cursor-pointer"
                          >
                            <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-sm font-bold">اضغط هنا لإضافة المزيد من الصور</span>
                          </label>
                        </div>
                      </FormControl>
                      {item && (item as any).product_images && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-blue-700 text-xs font-bold flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          الصور المرفوعة حالياً: {(item as any).product_images.length}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t mt-8 sticky bottom-0 bg-white pb-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 h-14 text-lg font-bold border-2"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="flex-[2] h-14 text-lg font-black bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/20"
            >
              {form.formState.isSubmitting ? (
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري الحفظ...</span>
                </div>
              ) : (
                item ? 'تحديث المنتج' : 'إضافة المنتج '
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
