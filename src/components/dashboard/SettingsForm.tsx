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
    .regex(/^[a-z0-9-]+$/, 'يجب أن يحتوي اسم الكتالوج على أحرف إنجليزية صغيرة وأرقام وشرطات فقط'),
  logo: z.any().optional(),
  cover: z.any().optional(),
  enable_subcategories: z.boolean().default(false),
});

export function SettingsForm({ catalog }: { catalog: Catalog }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: catalog.name,
      enable_subcategories: catalog.enable_subcategories,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('catalogId', catalog.id.toString());
      formData.append('name', values.name);
      formData.append('enable_subcategories', values.enable_subcategories ? 'on' : 'off');

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
                accept="image/*"
                disabled={isSubmitting}
              />
            </FormControl>
            <FormDescription>
              اختر ملفًا جديدًا فقط إذا كنت تريد تغيير الشعار الحالي.
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
                accept="image/*"
                disabled={isSubmitting}
              />
            </FormControl>
            <FormDescription>
              اختر ملفًا جديدًا فقط إذا كنت تريد تغيير صورة الغلاف الحالية.
            </FormDescription>
          </FormItem>
        </div>

        <FormField
          control={form.control}
          name="enable_subcategories"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">تفعيل الفئات الفرعية</FormLabel>
                <FormDescription>
                  السماح بإنشاء فئات داخل فئات أخرى.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </form>
    </Form>
  );
}
