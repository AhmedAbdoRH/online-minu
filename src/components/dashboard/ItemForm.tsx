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
  price: z.coerce.number().min(0, 'يجب أن يكون السعر إيجابياً'),
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
});

// For update, images are not required
const updateFormSchema = formSchema.extend({
  main_image: z.instanceof(File).optional(),
  additional_images: z.array(z.instanceof(File)).optional().or(z.literal(undefined)),
  pricing_type: z.enum(['unified', 'multi']).default('unified'),
  variants: z.array(z.object({
    name: z.string().min(1, 'اسم الخيار مطلوب'),
    price: z.coerce.number().min(0, 'السعر مطلوب')
  })).optional(),
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
        // Price might be calculated on server or we send 0/min here. 
        // The server action logic we wrote relies on 'variants' field presence/content.
        formData.append('price', '0'); // Helper, server will overwrite with min
      } else {
        formData.append('price', values.price.toString());
        // Ensure to clear variants if switching back to unified? 
        // We can send empty array to indicate no variants.
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>الفئة</FormLabel>
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
                    <SelectTrigger className="h-14 text-base text-foreground font-bold border-2 focus:ring-brand-primary/20">
                      <SelectValue placeholder="اختر فئة" className="placeholder:text-muted-foreground/60" />
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
            <div className="col-span-2 space-y-4 rounded-lg border p-4 bg-muted/20">
              <FormLabel>نظام التسعير</FormLabel>
              <Tabs
                value={pricingType}
                onValueChange={(val) => {
                  const type = val as 'unified' | 'multi';
                  setPricingType(type);
                  form.setValue('pricing_type', type);
                }}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="multi" className="text-sm">
                    <div className="flex items-center gap-2">
                      <span>أسعار متعددة</span>
                      <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">جديد</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="unified" className="text-sm">
                    سعر موحد
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="unified" className="mt-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>السعر (ج.م)</FormLabel>
                        <FormControl><Input type="number" step="0.01" placeholder="0" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="multi" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base">خيارات المنتج</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ name: '', price: undefined as any })}
                        className="gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        إضافة خيار
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
                          <FormField
                            control={form.control}
                            name={`variants.${index}.name`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input placeholder="اسم الخيار (مثلاً: كبير، وسط)" {...field} />
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
                                    <Input type="number" step="0.01" placeholder="السعر" {...field} className="pl-8" />
                                    <span className="absolute left-2 top-2.5 text-xs text-muted-foreground">ج.م</span>
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
                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {fields.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                          <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>لم يتم إضافة خيارات بعد</p>
                          <Button
                            type="button"
                            variant="link"
                            onClick={() => append({ name: '', price: 0 })}
                          >
                            إضافة الخيار الأول
                          </Button>
                        </div>
                      )}
                    </div>
                    <FormMessage>{form.formState.errors.variants?.message}</FormMessage>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* الصورة الرئيسية */}
          <FormField
            control={form.control}
            name="main_image"
            render={({ field: { onChange, value, ...rest } }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 mb-2">
                  <ImageIcon className="h-4 w-4 text-brand-accent" />
                  الصورة الرئيسية للمنتج
                  {item && <span className="text-xs text-muted-foreground">(اختياري للتغيير)</span>}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <input
                      type="file"
                      id="main-image-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Compress immediately for preview and state
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
                        "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300",
                        mainImagePreview 
                          ? "border-brand-accent/50 bg-brand-accent/5" 
                          : "border-muted-foreground/20 hover:border-brand-accent/50 hover:bg-brand-accent/5 bg-muted/10"
                      )}
                    >
                      {mainImagePreview ? (
                        <div className="relative w-full h-full p-2">
                          <img 
                            src={mainImagePreview} 
                            alt="Preview" 
                            className="w-full h-full object-contain rounded-lg"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                            <div className="flex flex-col items-center text-white">
                              <Upload className="h-8 w-8 mb-1" />
                              <span className="text-xs font-bold">تغيير الصورة</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6">
                          <div className="bg-brand-accent/10 p-4 rounded-full mb-3">
                            <Upload className="h-8 w-8 text-brand-accent" />
                          </div>
                          <span className="text-sm font-bold text-foreground">أضف صورة للمنتج</span>
                          <span className="text-xs text-muted-foreground mt-1">اضغط هنا لاختيار صورة</span>
                        </div>
                      )}
                    </label>
                  </div>
                </FormControl>
                <FormMessage />
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
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="destructive"
              onClick={onCancel}
              className="w-full h-11"
            >
              إلغاء
            </Button>
            <SubmitButton pendingText="جاري الحفظ..." className="w-full h-11">
              {item ? 'حفظ التغييرات' : 'حفظ المنتج'}
            </SubmitButton>
          </div>
          <div className="h-24" /> {/* مسافة إضافية أسفل الزر لتجنب التداخل مع شريط التنقل */}
        </form>
      </Form>
    </>
  );
}
