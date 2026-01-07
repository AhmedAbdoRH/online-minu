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
    console.log('--- Start onSubmit ---');
    // Prevent multiple submissions
    const isSubmitting = form.formState.isSubmitting;
    console.log('isSubmitting state:', isSubmitting);
    if (isSubmitting) {
      console.log('Submission blocked: already submitting');
      return;
    }

    // Create unique submission ID
    const currentSubmissionId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    console.log('Current submission ID:', currentSubmissionId);
    if (submissionId === currentSubmissionId) {
      console.log('Submission blocked: duplicate ID');
      return;
    }
    setSubmissionId(currentSubmissionId);

    try {
      console.log('Form validated values:', values);

      const formData = new FormData();
      formData.append('catalogId', catalogId.toString());
      formData.append('name', values.name);
      formData.append('description', values.description || '');

      // Handle pricing based on type
      if (values.pricing_type === 'multi' && values.variants && values.variants.length > 0) {
        console.log('Handling multi-pricing variants:', values.variants);
        formData.append('variants', JSON.stringify(values.variants));
        const minPrice = Math.min(...values.variants.map(v => v.price));
        formData.append('price', minPrice.toString());
      } else {
        console.log('Handling unified pricing:', values.price);
        formData.append('price', (values.price || 0).toString());
        formData.append('variants', JSON.stringify([]));
      }

      formData.append('category_id', values.category_id);

      if (values.main_image) {
        console.log('Compressing main image...');
        const compressedMain = await compressImage(values.main_image);
        console.log('Main image compressed successfully');
        formData.append('main_image', compressedMain);
      }

      if (values.additional_images && values.additional_images.length > 0) {
        console.log(`Compressing ${values.additional_images.length} additional images...`);
        for (const img of values.additional_images) {
          const compressedImg = await compressImage(img);
          formData.append('additional_images', compressedImg);
        }
        console.log('Additional images compressed successfully');
      }

      console.log('Calling server action (createItem/updateItem)...');
      const result = item ? await updateItem(item.id, formData) : await createItem(formData);

      console.log('Server response received:', result);

      if (result.error) {
        console.error('Server returned error:', result.error);
        if (result.error === 'LIMIT_REACHED') {
          setShowUpgradeAlert(true);
          return;
        }
        toast({ title: 'خطأ', description: result.error, variant: 'destructive' });
      } else {
        console.log('Success! Resetting form...');
        toast({ title: 'نجاح!', description: `تم ${item ? 'تحديث' : 'إنشاء'} المنتج بنجاح.` });
        form.reset();
        setTimeout(() => {
          onSuccess?.();
        }, 100);
      }
    } catch (error) {
      console.error('CRITICAL: Form submission catch block:', error);
      toast({ title: 'خطأ', description: 'حدث خطأ غير متوقع', variant: 'destructive' });
    } finally {
      console.log('--- End onSubmit ---');
    }
  };

    <div className="bg-slate-50/50 -m-6 p-6 rounded-b-xl">
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
              <div className="space-y-4 bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 shadow-sm">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-bold text-slate-700">الفئة</FormLabel>
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
                        <SelectTrigger className="h-12 text-base border-2 border-slate-100 bg-slate-50/50 focus:ring-brand-primary/20">
                          <SelectValue placeholder="اختر فئة للمنتج" />
                        </SelectTrigger>
                      </FormControl>
                        <SelectContent className="bg-white border-slate-200 shadow-xl">
                            <SelectGroup>
                               <SelectLabel className="text-[#4ade80] font-black py-3.5 px-4 text-[15px] bg-[#4ade80]/5 mb-1">الإجراءات</SelectLabel>
                               <SelectItem 
                             value="new_category" 
                             className="flex items-center gap-2 text-[#4ade80] font-black text-[15px] cursor-pointer py-4 focus:bg-[#4ade80]/10 focus:text-[#22c55e] border-b border-slate-100"
                           >
                             <div className="flex items-center gap-2 justify-center w-full">
                               <PlusCircle className="h-5 w-5 stroke-[3px]" />
                               <span>إضافة تصنيف جديد</span>
                             </div>
                           </SelectItem>
                             </SelectGroup>
                             <SelectSeparator className="bg-[#4ade80]/10" />
                             <SelectGroup>
                               <SelectLabel className="text-slate-400 font-bold py-3.5 px-4 text-[13px] bg-slate-50 mt-1 mb-1 uppercase tracking-wider">التصنيفات المتاحة</SelectLabel>
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
                      <FormLabel className="text-base font-bold text-slate-700">اسم المنتج</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: بيتزا مارجريتا" className="h-12 text-lg border-2 border-slate-100 bg-slate-50/50 focus:bg-white transition-all" {...field} />
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
                      <FormLabel className="text-base font-bold text-slate-700">وصف المنتج</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="اكتب وصفاً جذاباً لمنتجك..." 
                          className="min-h-[120px] text-base resize-none border-2 border-slate-100 bg-slate-50/50 focus:bg-white transition-all" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4 rounded-2xl border-2 border-brand-primary/10 p-6 bg-white/80 backdrop-blur-sm shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                <FormLabel className="text-lg font-black text-brand-primary flex items-center gap-2">
                  <span className="bg-brand-primary text-white p-1 rounded-lg shadow-sm"><Plus className="h-4 w-4" /></span>
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
                  <TabsList className="grid w-full grid-cols-2 p-1.5 bg-slate-100/80 h-[52px] rounded-xl">
                    <TabsTrigger value="multi" className="text-base font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-brand-primary data-[state=active]:shadow-md transition-all">
                      أسعار متعددة (أحجام)
                    </TabsTrigger>
                    <TabsTrigger value="unified" className="text-base font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-brand-primary data-[state=active]:shadow-md transition-all">
                      سعر موحد
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="unified" className="mt-6">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-slate-600">السعر النهائي (ج.م)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input type="number" step="0.01" placeholder="0.00" className="h-14 pl-14 text-2xl font-black border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand-primary/30 transition-all rounded-xl" {...field} />
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">ج.م</span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="multi" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-sm text-slate-500 font-bold">أضف الأحجام المختلفة (مثلاً: صغير، كبير)</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => append({ name: '', price: undefined as any })}
                          className="gap-2 border-2 border-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white transition-all font-black rounded-lg h-9"
                        >
                          <Plus className="h-4 w-4" />
                          إضافة خيار
                        </Button>
                      </div>

                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {fields.map((field, index) => (
                          <div key={field.id} className="flex gap-3 items-start p-4 rounded-xl bg-slate-50/50 border-2 border-slate-100 hover:border-brand-primary/30 hover:bg-white transition-all shadow-sm group">
                            <FormField
                              control={form.control}
                              name={`variants.${index}.name`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input placeholder="مثلاً: حجم كبير" className="h-12 border-none bg-transparent focus-visible:ring-0 font-bold text-lg p-0" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`variants.${index}.price`}
                              render={({ field }) => (
                                <FormItem className="w-36">
                                  <FormControl>
                                    <div className="relative">
                                      <Input type="number" step="0.01" placeholder="0.00" className="h-12 pl-12 border-2 border-slate-200 bg-white rounded-lg focus-visible:ring-brand-primary/20 font-black text-lg" {...field} />
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-black">ج.م</span>
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
                              className="text-slate-300 hover:text-destructive hover:bg-destructive/10 h-12 w-12 rounded-lg transition-colors"
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
              <div className="space-y-4 rounded-2xl border-2 border-dashed border-slate-300 p-6 bg-white/80 backdrop-blur-sm shadow-sm">
                <FormField
                  control={form.control}
                  name="main_image"
                  render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 mb-4 text-base font-bold text-slate-700">
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
                                ? "border-brand-primary/40 bg-slate-50 shadow-inner" 
                                : "border-slate-200 hover:border-brand-primary/50 hover:bg-brand-primary/5 bg-slate-50/50"
                            )}
                          >
                            {mainImagePreview ? (
                              <>
                                <img 
                                  src={mainImagePreview} 
                                  alt="Preview" 
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-brand-primary/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                  <div className="flex flex-col items-center text-white transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                    <div className="bg-white/20 p-4 rounded-full backdrop-blur-md mb-3">
                                      <Upload className="h-8 w-8" />
                                    </div>
                                    <span className="font-black text-lg">تغيير الصورة</span>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center text-center p-8 group-hover:scale-105 transition-transform duration-300">
                                <div className="bg-brand-primary/10 p-6 rounded-full mb-5 ring-8 ring-brand-primary/5">
                                  <Upload className="h-12 w-12 text-brand-primary" />
                                </div>
                                <span className="text-xl font-black text-slate-700">أضف صورة جذابة</span>
                                <span className="text-sm text-slate-500 mt-2 max-w-[200px]">يفضل أن تكون مربعة وبإضاءة جيدة لجذب الزبائن</span>
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
                        <div className="flex items-center gap-2 text-base font-bold text-slate-700">
                          <Plus className="h-5 w-5 text-brand-primary" />
                          صور إضافية للمنتج
                        </div>
                        {!isPro && <span className="text-[10px] bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-black tracking-wide uppercase">باقة PRO فقط</span>}
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
                            className="flex flex-col items-center justify-center w-full py-10 rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand-primary/40 bg-slate-50/50 hover:bg-white transition-all cursor-pointer group"
                          >
                            <div className="bg-slate-200 group-hover:bg-brand-primary/10 p-3 rounded-full transition-colors mb-3">
                              <Plus className="h-8 w-8 text-slate-400 group-hover:text-brand-primary" />
                            </div>
                            <span className="text-sm font-black text-slate-500 group-hover:text-brand-primary">اضغط هنا لإضافة المزيد من الصور</span>
                          </label>
                        </div>
                      </FormControl>
                      {item && (item as any).product_images && (
                        <div className="mt-4 p-4 bg-brand-primary/5 rounded-xl text-brand-primary text-sm font-black flex items-center gap-3 border border-brand-primary/10">
                          <div className="bg-brand-primary text-white p-1.5 rounded-lg shadow-sm">
                            <ImageIcon className="h-4 w-4" />
                          </div>
                          <span>الصور المرفوعة حالياً: {(item as any).product_images.length} صورة</span>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-200 mt-8 sticky bottom-0 bg-white/95 backdrop-blur-md -mx-6 px-6 pb-4 rounded-b-2xl z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 h-14 text-lg font-bold border-2 border-slate-200 hover:bg-slate-50 transition-all rounded-xl"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="flex-[2] h-14 text-lg font-black bg-brand-primary hover:bg-brand-primary/90 text-white shadow-xl shadow-brand-primary/20 hover:shadow-brand-primary/30 transform hover:-translate-y-0.5 transition-all rounded-xl"
            >
              {form.formState.isSubmitting ? (
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري الحفظ...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                   {item ? <PlusCircle className="h-5 w-5" /> : <Plus className="h-6 w-6" />}
                   <span>{item ? 'تحديث المنتج' : 'إضافة المنتج للمنيو'}</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
