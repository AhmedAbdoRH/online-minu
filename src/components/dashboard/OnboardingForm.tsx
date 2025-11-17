'use client';

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
import { SubmitButton } from '@/components/common/SubmitButton';
import { createCatalog } from '@/app/actions/catalog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  name: z.string()
    .min(3, 'يجب أن يكون اسم الكتالوج 3 أحرف على الأقل')
    .max(50, 'يجب أن يكون اسم الكتالوج 50 حرفًا على الأكثر')
    .regex(/^[a-z0-9-]+$/, 'يجب أن يحتوي اسم الكتالوج على أحرف إنجليزية صغيرة وأرقام وشرطات فقط'),
  logo: z.instanceof(File)
    .refine(file => file.size > 0, 'شعار العمل مطلوب.')
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
});

export function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      logo: undefined,
    },
  });
  
  useEffect(() => {
    if (error === 'name_taken') {
       form.setError('name', { message: 'اسم الكتالوج هذا مستخدم بالفعل. الرجاء اختيار اسم آخر.' });
    }
  }, [error, form]);


  return (
    <Form {...form}>
      <form action={createCatalog} className="space-y-8">
        {error && error !== 'name_taken' && (
            <Alert variant="destructive">
                <AlertTitle>حدث خطأ</AlertTitle>
                <AlertDescription>فشل إنشاء الكتالوج. يرجى المحاولة مرة أخرى.</AlertDescription>
            </Alert>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم الكتالوج (باللغة الإنجليزية)</FormLabel>
              <FormControl>
                <Input placeholder="my-restaurant" {...field} />
              </FormControl>
              <FormDescription>
                سيتم استخدام هذا الاسم في رابط الكتالوج الخاص بك. مثال: my-restaurant.online-menu.site
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="logo"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel>شعار العمل</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0])} {...rest} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SubmitButton pendingText="جاري الإنشاء..." className="w-full">
          إنشاء كتالوجي
        </SubmitButton>
      </form>
    </Form>
  );
}
