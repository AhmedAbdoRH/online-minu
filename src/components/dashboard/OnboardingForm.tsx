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
import { createCatalog, checkCatalogName } from '@/app/actions/catalog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  name: z.string()
    .min(3, 'يجب أن يكون اسم الكتالوج 3 أحرف على الأقل')
    .max(50, 'يجب أن يكون اسم الكتالوج 50 حرفًا على الأكثر')
    .regex(/^[a-z0-9-]+$/, 'يجب أن يحتوي اسم الكتالوج على أحرف إنجليزية صغيرة وأرقام وشرطات فقط'),
  logo: z.instanceof(File).refine(file => file.size > 0, 'شعار العمل مطلوب.'),
});

export function OnboardingForm() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      logo: new File([], ''),
    },
    mode: 'onBlur'
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const isAvailable = await checkCatalogName(values.name);
    if (!isAvailable) {
        form.setError('name', { message: 'اسم الكتالوج هذا مستخدم بالفعل. الرجاء اختيار اسم آخر.' });
        return;
    }
      
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('logo', values.logo);

    const result = await createCatalog(formData);

    if (result.error) {
      toast({
        title: 'خطأ',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'نجاح!',
        description: 'تم إنشاء الكتالوج الخاص بك بنجاح.',
      });
      router.refresh();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
