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
import { updateCatalog } from '@/app/actions/catalog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Catalog } from '@/lib/types';
import NextImage from 'next/image';
import { Switch } from '../ui/switch';
import { Loader2 } from 'lucide-react';

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
});

export function SettingsForm({ catalog }: { catalog: Catalog }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: catalog.name,
      display_name: catalog.display_name || catalog.name,
      slogan: catalog.slogan || '',

      whatsapp_number: catalog.whatsapp_number || '',
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم الكتالوج (باللغة الإنجليزية)</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isSubmitting} />
                </FormControl>
                <FormDescription>
                  سيتم استخدام هذا الاسم في رابط الكتالوج الخاص بك.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="display_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم المتجر المعروض</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isSubmitting} />
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
            name="slogan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>شعار نصي (سلوغان)</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isSubmitting} placeholder="شعار متجرك أو جملة ترويجية" />
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
                <Input {...field} disabled={isSubmitting} placeholder="+201234567890" />
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
            <FormLabel>شعار جديد (اختياري)</FormLabel>
            <FormControl>
              <Input
                type="file"
                name="logo"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                disabled={isSubmitting}
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
            <FormLabel>صورة غلاف جديدة (اختياري)</FormLabel>
            <FormControl>
              <Input
                type="file"
                name="cover"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                disabled={isSubmitting}
              />
            </FormControl>
            <FormDescription>
              اختر ملفًا جديدًا فقط إذا كنت تريد تغيير صورة الغلاف الحالية. الحد الأقصى: 5 ميغابايت. الصيغ المقبولة: .jpg, .jpeg, .png, .webp
            </FormDescription>
          </FormItem>
        </div>



        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </form>
    </Form>
  );
}
