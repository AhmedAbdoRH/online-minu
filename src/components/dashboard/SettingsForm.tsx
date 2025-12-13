'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { updateCatalog } from '@/app/actions/catalog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Catalog } from '@/lib/types';
import NextImage from 'next/image';
import { Switch } from '../ui/switch';
import { Loader2, Lock, Check, Crown, Palette, Sparkles, MessageCircle } from 'lucide-react';

const THEME_OPTIONS = [
  { id: 'default', name: 'الافتراضي', gradient: 'bg-gradient-default' },
  { id: 'gradient-1', name: 'بنفسجي', gradient: 'bg-gradient-1' },
  { id: 'gradient-2', name: 'أحمر داكن', gradient: 'bg-gradient-2' },
  { id: 'gradient-3', name: 'برتقالي', gradient: 'bg-gradient-3' },
  { id: 'gradient-4', name: 'أخضر', gradient: 'bg-gradient-4' },
  { id: 'gradient-5', name: 'أزرق', gradient: 'bg-gradient-5' },
  { id: 'gradient-6', name: 'وردي', gradient: 'bg-gradient-6' },
  { id: 'gradient-7', name: 'ذهبي', gradient: 'bg-gradient-7' },
  { id: 'gradient-8', name: 'تركوازي', gradient: 'bg-gradient-8' },
  { id: 'gradient-9', name: 'رمادي', gradient: 'bg-gradient-9' },
];

const formSchema = z.object({
  name: z.string()
    .min(3, 'يجب أن يكون اسم الكتالوج 3 أحرف على الأقل')
    .max(50, 'يجب أن يكون اسم الكتالوج 50 حرفًا على الأكثر')
    .regex(/^[a-zA-Z0-9-]+$/, 'يجب أن يحتوي اسم الكتالوج على أحرف إنجليزية وأرقام وشرطات فقط'),
  display_name: z.string()
    .min(3, 'يجب أن يكون اسم العرض 3 أحرف على الأقل')
    .max(50, 'يجب أن يكون اسم العرض 50 حرفًا على الأكثر'),
  slogan: z.string().optional(),
  logo: z.any().optional(),
  cover: z.any().optional(),
  whatsapp_number: z.string().optional().refine(
    (val) => !val || /^\+?[0-9]{6,15}$/.test(val),
    "رقم الواتساب غير صالح"
  ),
  theme: z.string().optional(),
});

export function SettingsForm({ catalog }: { catalog: Catalog }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedTheme, setSelectedTheme] = useState(catalog.theme || 'default');
  const isPro = catalog.plan === 'pro' || catalog.plan === 'business';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: catalog.name,
      display_name: catalog.display_name || catalog.name,
      slogan: catalog.slogan || '',
      whatsapp_number: catalog.whatsapp_number || '',
      theme: catalog.theme || 'default',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('catalogId', catalog.id.toString());
      formData.append('name', values.name.toLowerCase());
      formData.append('display_name', values.display_name);
      formData.append('slogan', values.slogan || '');

      formData.append('whatsapp_number', values.whatsapp_number || '');
      formData.append('theme', selectedTheme);

      // Handle logo file
      const logoInput = document.querySelector('input[name="logo"]') as HTMLInputElement;
      if (logoInput?.files?.[0]) {
        formData.append('logo', logoInput.files[0]);
      }

      // Handle cover file
      const coverInput = document.querySelector('input[name="cover"]') as HTMLInputElement;
      if (coverInput?.files?.[0]) {
        formData.append('cover', coverInput.files[0]);
      }

      const result = await updateCatalog(null, formData);

      if (result.message.includes('بنجاح')) {
        toast({
          title: 'نجاح',
          description: result.message,
        });
        router.refresh();
      } else {
        toast({
          title: 'خطأ',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ غير متوقع',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="display_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم المتجر المعروض</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isSubmitting} className="bg-white text-[#1e3a5f] text-lg" />
                </FormControl>
                <FormDescription>
                  سيظهر هذا الاسم في واجهة المتجر الخاصة بك.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم المستخدم للمتجر (باللغة الإنجليزية)</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isSubmitting} className="bg-white text-[#1e3a5f] text-lg" />
                </FormControl>
                <FormDescription>
                  سيتم استخدام هذا الاسم في رابط المتجر الخاص بك.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slogan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>شعار نصي (سلوغان)</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isSubmitting} placeholder="شعار متجرك أو جملة ترويجية" className="bg-white text-[#1e3a5f] text-lg" />
                </FormControl>
                <FormDescription>
                  سيظهر هذا النص بخط صغير تحت اسم المتجر.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="whatsapp_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رقم الواتساب</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} placeholder="+201234567890" className="bg-white text-[#1e3a5f] text-lg" />
              </FormControl>
              <FormDescription>
                رقم الواتساب الخاص بمتجرك (اختياري).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div>
            <FormLabel>الشعار الحالي</FormLabel>
            {catalog.logo_url && catalog.logo_url !== '' && (
              <div className="mt-2">
                <NextImage
                  src={catalog.logo_url}
                  alt="شعار حالي"
                  width={80}
                  height={80}
                  className="rounded-md border"
                />
              </div>
            )}
          </div>

          <FormItem>
            <FormLabel>رفع شعار جديد</FormLabel>
            <FormControl>
              <Input
                type="file"
                name="logo"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                disabled={isSubmitting}
                className="bg-muted/50 border-2 border-dashed border-brand-primary/30 hover:border-brand-primary/50 text-foreground file:bg-brand-primary file:text-white file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 file:cursor-pointer cursor-pointer"
              />
            </FormControl>
            <FormDescription>
              اختر ملفًا جديدًا فقط إذا كنت تريد تغيير الشعار الحالي. الحد الأقصى: 5 ميغابايت. الصيغ المقبولة: .jpg, .jpeg, .png, .webp
            </FormDescription>
          </FormItem>
        </div>

        <div className="space-y-4">
          <div>
            <FormLabel>صورة الغلاف الحالية</FormLabel>
            {catalog.cover_url && catalog.cover_url !== '' && (
              <div className="mt-2">
                <NextImage
                  src={catalog.cover_url}
                  alt="صورة غلاف حالية"
                  width={200}
                  height={100}
                  className="rounded-md border"
                />
              </div>
            )}
          </div>

          <FormItem>
            <FormLabel>رفع صورة غلاف جديدة</FormLabel>
            <FormControl>
              <Input
                type="file"
                name="cover"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                disabled={isSubmitting}
                className="bg-muted/50 border-2 border-dashed border-brand-primary/30 hover:border-brand-primary/50 text-foreground file:bg-brand-primary file:text-white file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 file:cursor-pointer cursor-pointer"
              />
            </FormControl>
            <FormDescription>
              اختر ملفًا جديدًا فقط إذا كنت تريد تغيير صورة الغلاف الحالية. الحد الأقصى: 5 ميغابايت. الصيغ المقبولة: .jpg, .jpeg, .png, .webp
            </FormDescription>
          </FormItem>
        </div>

        {/* قسم تخصيص مظهر المتجر */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <FormLabel className="text-lg font-semibold">تخصيص مظهر المتجر</FormLabel>
            {!isPro && (
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full hover:bg-amber-500/20 transition-colors cursor-pointer">
                    <Lock className="h-3 w-3" />
                    باقة البرو
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader className="text-center">
                    <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
                      <Crown className="h-7 w-7 text-amber-500" />
                      ترقية إلى باقة البرو
                    </DialogTitle>
                    <DialogDescription className="text-center text-base">
                      احصل على مميزات حصرية لمتجرك
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Sparkles className="h-5 w-5 text-brand-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">عدد غير محدود من المنتجات والتصنيفات</p>
                          <p className="text-xs text-muted-foreground">أضف عدد لا نهائي من المنتجات والتصنيفات</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Palette className="h-5 w-5 text-brand-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">أنماط مظهر متعددة</p>
                          <p className="text-xs text-muted-foreground">اختر من بين 10 أنماط ألوان مختلفة لمتجرك</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Crown className="h-5 w-5 text-brand-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">دعم فني مميز</p>
                          <p className="text-xs text-muted-foreground">أولوية في الرد والدعم الفني</p>
                        </div>
                      </div>
                    </div>
                    <Button asChild className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                      <a
                        href="https://wa.me/201008116452?text=مرحباً، أريد الترقية إلى باقة البرو لمتجري"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="h-4 w-4 ml-2" />
                        طلب الترقية
                      </a>
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <FormDescription>
            اختر نمط الخلفية لمتجرك
          </FormDescription>
          
          <div className="grid grid-cols-5 gap-x-3 gap-y-4">
            {THEME_OPTIONS.map((theme, index) => {
              const isDefault = index === 0;
              const isLocked = !isPro && !isDefault;
              
              return (
                <div key={theme.id} className={`flex flex-col items-center gap-1 ${isLocked ? 'opacity-60' : ''}`}>
                  <button
                    type="button"
                    disabled={isLocked || isSubmitting}
                    onClick={() => !isLocked && setSelectedTheme(theme.id)}
                    className={`relative h-16 w-full rounded-lg ${theme.gradient} border-2 transition-all ${
                      selectedTheme === theme.id
                        ? 'border-brand-primary ring-2 ring-brand-primary/50'
                        : 'border-transparent hover:border-white/30'
                    } ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    title={theme.name}
                  >
                    {selectedTheme === theme.id && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check className="h-5 w-5 text-white drop-shadow-lg" />
                      </div>
                    )}
                    {isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                        <Lock className="h-4 w-4 text-white/70" />
                      </div>
                    )}
                    {isDefault && (
                      <span className="absolute -top-2 right-1 text-[9px] bg-brand-primary text-white px-1.5 py-0.5 rounded-full">
                        افتراضي
                      </span>
                    )}
                  </button>
                  <span className="text-[10px] text-muted-foreground">{theme.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </form>
    </Form>
  );
}
