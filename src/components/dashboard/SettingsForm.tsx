'use client';

// دالة مساعدة لضغط الصورة باستخدام Canvas API
const compressImage = async (file: File): Promise<File | null> => {
  return new Promise((resolve) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(null);
        return;
      }

      // تحديد أبعاد الصورة المضغوطة (حافظ على نسبة العرض إلى الارتفاع)
      const maxWidth = 1200;
      const maxHeight = 675;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
      }

      if (height > maxHeight) {
        width *= maxHeight / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // ضغط الصورة إلى JPEG بجودة 0.8 (يمكن تعديلها)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          // تحقق من أن حجم الملف المضغوط أقل من 1 ميجابايت
          if (blob.size > 1024 * 1024) {
            resolve(null);
            return;
          }
          resolve(new File([blob], `compressed-${file.name}`, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        0.8
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };

    img.src = objectUrl;
  });
}

import { useActionState, useEffect, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { SubmitButton } from '@/components/common/SubmitButton';
import { updateCatalog } from '@/app/actions/catalog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Catalog } from '@/lib/types';
import NextImage from 'next/image';
import { Switch } from '../ui/switch';

const formSchema = z.object({
  name: z.string()
    .min(3, 'يجب أن يكون اسم الكتالوج 3 أحرف على الأقل')
    .max(50, 'يجب أن يكون اسم الكتالوج 50 حرفًا على الأكثر')
    .regex(/^[a-z0-9-]+$/, 'يجب أن يحتوي اسم الكتالوج على أحرف إنجليزية صغيرة وأرقام وشرطات فقط'),
  logo: z.instanceof(File).optional(),
  cover: z.instanceof(File).optional(),
  enable_subcategories: z.boolean().default(false),
});

const initialState = {
  message: '',
};

export function SettingsForm({ catalog }: { catalog: Catalog }) {
  const { toast } = useToast();
  const router = useRouter();
  const [state, formAction] = useActionState(updateCatalog, initialState);
  const [isPending, startTransition] = useTransition();


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: catalog.name,
      logo: undefined,
      cover: undefined,
      enable_subcategories: catalog.enable_subcategories,
    },
    mode: 'onBlur'
  });

  useEffect(() => {
    if (state?.message) {
        const isSuccess = state.message.includes('بنجاح');
        toast({
            title: isSuccess ? 'نجاح' : 'خطأ',
            description: state.message,
            variant: isSuccess ? 'default' : 'destructive'
        });
        if(isSuccess) {
            router.refresh();
        }
    }
  }, [state, toast, router]);

  const onSubmit = form.handleSubmit(async (values) => {
    const formData = new FormData();
    formData.append('catalogId', catalog.id.toString());
    formData.append('name', values.name);
    if (values.logo instanceof File) {
      formData.append('logo', values.logo);
    }
    if (values.cover instanceof File) {
      formData.append('cover', values.cover);
    }
    formData.append('enable_subcategories', values.enable_subcategories ? 'on' : 'off');
    startTransition(() => {
      formAction(formData);
    });
  });

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-8">
        <input type="hidden" name="catalogId" value={catalog.id} />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم الكتالوج (باللغة الإنجليزية)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                سيتم استخدام هذا الاسم في رابط الكتالوج الخاص بك.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
            <FormLabel>الشعار الحالي</FormLabel>
            {catalog.logo_url && catalog.logo_url !== '' && <NextImage src={catalog.logo_url} alt="شعار حالي" width={80} height={80} className="rounded-md" />}
        </FormItem>
        <FormField
          control={form.control}
          name="logo"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel>شعار جديد (اختياري)</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" onChange={async (e) => {
  const file = e.target.files?.[0];
  if (!file) {
    onChange(null);
    return;
  }
  // ضغط الصورة قبل إرسالها
  const compressedFile = await compressImage(file);
  if (compressedFile) {
    onChange(compressedFile);
  } else {
    // إظهار رسالة خطأ إذا فشل الضغط أو تجاوز حجم الملف المضغوط 1 ميجابايت
    toast({
      title: 'خطأ',
      description: 'فشل ضغط الصورة أو تجاوز حجمها الحد الأقصى (1 ميجابايت). الرجاء اختيار صورة أخرى.',
      variant: 'destructive'
    });
    onChange(null);
  }
}} {...rest} />
              </FormControl>
               <FormDescription>
                اختر ملفًا جديدًا فقط إذا كنت تريد تغيير الشعار الحالي.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
            <FormLabel>صورة الغلاف الحالية</FormLabel>
            {catalog.cover_url && catalog.cover_url !== '' && <NextImage src={catalog.cover_url} alt="صورة غلاف حالية" width={150} height={80} className="rounded-md" />}
        </FormItem>
        <FormField
          control={form.control}
          name="cover"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel>صورة غلاف جديدة (اختياري)</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" onChange={async (e) => {
  const file = e.target.files?.[0];
  if (!file) {
    onChange(null);
    return;
  }
  const compressedFile = await compressImage(file);
  if (compressedFile) {
    form.setValue('cover', compressedFile);
    startTransition(() => {
      onSubmit();
    });
  } else {
    toast({
      title: 'خطأ',
      description: 'فشل ضغط الصورة أو تجاوز حجمها الحد الأقصى (1 ميجابايت). الرجاء اختيار صورة أخرى.',
      variant: 'destructive'
    });
    onChange(null);
  }
}} {...rest} />
              </FormControl>
               <FormDescription>
                اختر ملفًا جديدًا فقط إذا كنت تريد تغيير صورة الغلاف الحالية.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
         <Controller
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
                        name={field.name}
                    />
                </FormControl>
              </FormItem>
            )}
          />
        <SubmitButton pendingText="جاري الحفظ..." className="w-full">
          حفظ التغييرات
        </SubmitButton>
      </form>
    </Form>
  );
}
