"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Image as ImageIcon, PlusCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createItem, updateItem } from '@/app/actions/items';
import { compressImage } from '@/lib/image-utils';
import { cn } from '@/lib/utils';
import { UpgradeAlert } from '@/components/dashboard/UpgradeAlert';
import { CategoryForm } from '@/components/dashboard/CategoryForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

interface ItemFormProps {
  catalogId: number;
  categories: any[];
  item?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
  isPro?: boolean;
}

export function ItemForm({ catalogId, categories, item, onSuccess, onCancel, isPro = false }: ItemFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [showUpgradeAlert, setShowUpgradeAlert] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item?.name || '',
      description: item?.description || '',
      price: item?.price || undefined,
      category_id: item?.category_id?.toString() || '',
      pricing_type: item?.variants && item.variants.length > 0 ? 'multi' : 'unified',
      variants: item?.variants || [],
    },
  } as any);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const pricingType = form.watch('pricing_type');

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log('Form validated values:', values);
      const formData = new FormData();
      formData.append('catalogId', catalogId.toString());
      formData.append('name', values.name);
      formData.append('description', values.description || '');

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
        formData.append('images', compressedMain);
      }

      if (values.additional_images && values.additional_images.length > 0) {
        console.log(`Compressing ${values.additional_images.length} additional images...`);
        for (const img of values.additional_images) {
          const compressedImg = await compressImage(img);
          formData.append('images', compressedImg);
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
          router.push('/dashboard/items');
        }, 100);
      }
    } catch (error) {
      console.error('CRITICAL: Form submission catch block:', error);
      toast({ title: 'خطأ', description: 'حدث خطأ غير متوقع', variant: 'destructive' });
    }
  };

  return (
    <div className="bg-slate-50/50 dark:bg-slate-900/50 -m-6 p-6 rounded-b-xl transition-colors">
      <UpgradeAlert
        open={showUpgradeAlert}
        onOpenChange={setShowUpgradeAlert}
        resourceType="product"
      />
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(
            onSubmit, 
            (errors) => {
              console.log('--- Form Validation Errors ---', errors);
              toast({
                title: 'بيانات غير مكتملة',
                description: 'يرجى التأكد من ملء جميع الحقول المطلوبة بشكل صحيح.',
                variant: 'destructive'
              });
            }
          )} 
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-bold text-slate-700 dark:text-slate-200 mb-2 block">التصنيف</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} dir="rtl">
                        <FormControl>
                          <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:ring-brand-primary transition-all rounded-xl dark:text-white text-right">
                            <SelectValue placeholder="اختر تصنيف المنتج" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-right">
                           <div className="p-2 sticky top-0 z-20 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                               <button
                                 type="button"
                                 onClick={(e) => {
                                   e.preventDefault();
                                   onSuccess?.();
                                   router.push('/dashboard/categories');
                                 }}
                                 className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 border-2 border-emerald-300 dark:border-emerald-500/40 rounded-xl transition-all hover:bg-emerald-200 dark:hover:bg-emerald-500/30 hover:border-emerald-400 dark:hover:bg-emerald-500/60 group"
                               >
                                 <PlusCircle className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                                 <span>إضافة تصنيف جديد</span>
                               </button>
                             </div>
  
                            {categories.map((category) => (
                              <SelectItem 
                                key={category.id} 
                                value={category.id.toString()} 
                                className="relative rounded-sm py-3 mb-2 focus:bg-brand-primary focus:text-white cursor-pointer transition-all border border-transparent pr-4 pl-4 overflow-hidden group"
                              >
                                <div className="flex items-center justify-end w-full relative z-10">
                                  <span className="font-bold text-right">{category.name}</span>
                                </div>
                                {/* Distinct Background Strip - Sharp Edges */}
                                 <div className="absolute inset-y-0 right-0 left-0 bg-brand-primary/20 dark:bg-brand-primary/30 rounded-none group-focus:bg-transparent transition-colors" />
                                 {/* Accent border-strip on the far right - Sharp Edges */}
                                 <div className="absolute right-0 top-0 bottom-0 w-2 bg-brand-primary" />
                              </SelectItem>
                            ))}
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
                      <FormLabel className="text-base font-bold text-slate-700 dark:text-slate-200 mb-2 block">اسم المنتج</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="مثلاً: برجر كلاسيك" 
                          {...field} 
                          className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:ring-brand-primary transition-all rounded-xl dark:text-white"
                        />
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
                      <FormLabel className="text-base font-bold text-slate-700 dark:text-slate-200 mb-2 block">وصف المنتج (اختياري)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="اكتب وصفاً جذاباً لمنتجك..." 
                          className="min-h-[120px] bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:ring-brand-primary transition-all rounded-xl resize-none dark:text-white"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                  <FormField
                    control={form.control}
                    name="pricing_type"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="text-base font-bold text-slate-700 dark:text-slate-200 block text-right">نوع التسعير</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 gap-4"
                            dir="rtl"
                          >
                            <div className="relative">
                              <RadioGroupItem value="unified" id="unified" className="peer sr-only" />
                              <Label
                                htmlFor="unified"
                                className="flex flex-col items-center justify-center rounded-xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-4 hover:bg-white dark:hover:bg-slate-900 peer-data-[state=checked]:border-brand-primary peer-data-[state=checked]:bg-brand-primary/5 dark:peer-data-[state=checked]:bg-brand-primary/10 cursor-pointer transition-all"
                              >
                                <span className="text-sm font-black dark:text-slate-200">سعر موحد</span>
                              </Label>
                            </div>
                            <div className="relative">
                              <RadioGroupItem value="multi" id="multi" className="peer sr-only" />
                              <Label
                                htmlFor="multi"
                                className="flex flex-col items-center justify-center rounded-xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-4 hover:bg-white dark:hover:bg-slate-900 peer-data-[state=checked]:border-brand-primary peer-data-[state=checked]:bg-brand-primary/5 dark:peer-data-[state=checked]:bg-brand-primary/10 cursor-pointer transition-all"
                              >
                                <span className="text-sm font-black dark:text-slate-200">أسعار متعددة</span>
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {pricingType === 'unified' ? (
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <FormLabel className="text-base font-bold text-slate-700 dark:text-slate-200 mb-2 block">السعر</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0.00" 
                              {...field} 
                              className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:ring-brand-primary transition-all rounded-xl pl-12 dark:text-white"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 dark:text-slate-500">
                              ج.م
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-base font-bold text-slate-700 dark:text-slate-200">خيارات الأسعار</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ name: '', price: 0 })}
                        className="h-9 px-4 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-all font-black rounded-lg gap-2"
                      >
                        <PlusCircle className="h-4 w-4" />
                        إضافة خيار
                      </Button>
                    </div>
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-3 items-start group animate-in zoom-in-95 duration-200">
                        <div className="flex-1">
                          <Input
                            {...form.register(`variants.${index}.name` as const)}
                            placeholder="اسم الخيار (مثلاً: كبير)"
                            className="h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-brand-primary rounded-xl dark:text-white"
                          />
                        </div>
                        <div className="w-32">
                          <Input
                            type="number"
                            step="0.01"
                            {...form.register(`variants.${index}.price` as const)}
                            placeholder="السعر"
                            className="h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-brand-primary rounded-xl dark:text-white"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="h-11 w-11 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-xl"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm transition-colors">
                <FormField
                  control={form.control}
                  name="main_image"
                  render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-base font-bold text-slate-700 dark:text-slate-200 mb-4">
                        <ImageIcon className="h-5 w-5 text-brand-primary" />
                        الصورة الأساسية
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <input
                            type="file"
                            id="main-image-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const compressedFile = await compressImage(file);
                                onChange(compressedFile);
                              }
                            }}
                            {...rest}
                          />
                          <label
                            htmlFor="main-image-upload"
                            className="flex flex-col items-center justify-center w-full aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-brand-primary/40 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer group relative overflow-hidden"
                          >
                            {value ? (
                              <>
                                <img src={URL.createObjectURL(value as File)} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30">
                                    <Plus className="h-8 w-8 text-white" />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center p-6 text-center">
                                <div className="bg-white dark:bg-slate-800 p-5 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                  <ImageIcon className="h-10 w-10 text-slate-300 dark:text-slate-600 group-hover:text-brand-primary" />
                                </div>
                                <span className="text-sm font-black text-slate-500 dark:text-slate-400 group-hover:text-brand-primary">اضغط لرفع صورة المنتج</span>
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
                        <div className="flex items-center gap-2 text-base font-bold text-slate-700 dark:text-slate-200">
                          <PlusCircle className="h-5 w-5 text-brand-primary" />
                          صور إضافية
                        </div>
                        {!isPro ? (
                          <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full font-black tracking-wide uppercase">باقة PRO فقط</span>
                        ) : (
                          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">اختياري</span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <div className={cn("grid grid-cols-3 gap-4", !isPro && "opacity-50 pointer-events-none")}>
                          {value && (value as File[]).map((img, index) => (
                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-200 dark:border-slate-700">
                              <img src={URL.createObjectURL(img)} alt="Preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => {
                                  const newValue = [...(value as File[])];
                                  newValue.splice(index, 1);
                                  onChange(newValue);
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                          <input
                            type="file"
                            id="additional-images-upload"
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={async (e) => {
                              const files = Array.from(e.target.files || []);
                              const compressedFiles = await Promise.all(
                                files.map(file => compressImage(file))
                              );
                              onChange([...(value || []), ...compressedFiles]);
                            }}
                            {...rest}
                          />
                          <label
                            htmlFor="additional-images-upload"
                            className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-brand-primary/40 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer group"
                          >
                            <Plus className="h-6 w-6 text-slate-300 dark:text-slate-600 group-hover:text-brand-primary transition-colors" />
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-700 mt-8 sticky bottom-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl -mx-6 px-6 pb-6 rounded-b-3xl z-10 shadow-[0_-20px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_-20px_40px_-10px_rgba(0,0,0,0.5)]">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 h-14 text-lg font-bold border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all rounded-2xl"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="flex-[2] h-14 text-lg font-black bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/20 transform active:scale-95 transition-all rounded-2xl border-none"
            >
              {form.formState.isSubmitting ? (
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري الحفظ...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                   {item ? <PlusCircle className="h-5 w-5" /> : <Plus className="h-6 w-6" />}
                   <span>{item ? 'تحديث المنتج' : 'إضافة المنتج'}</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
