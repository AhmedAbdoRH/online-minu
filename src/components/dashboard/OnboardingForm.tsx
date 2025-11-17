'use client';

import { useFormState } from 'react-dom';
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
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useEffect } from 'react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  name: z.string()
    .min(3, 'يجب أن يكون اسم الكتالوج 3 أحرف على الأقل')
    .max(50, 'يجب أن يكون اسم الكتالوج 50 حرفًا على الأكثر')
    .regex(/^[a-z0-9-]+$/, 'يجب أن يحتوي اسم الكتالوج على أحرف إنجليزية صغيرة وأرقام وشرطات فقط'),
  logo: z.any()
    .refine((files) => files?.length == 1, 'شعار العمل مطلوب.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `الحد الأقصى لحجم الملف 5 ميغابايت.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
       ".jpg, .jpeg, .png و .webp هي الملفات المقبولة."
    ),
});

const initialState = {
  message: '',
};

export function OnboardingForm() {
  const [state, formAction] = useFormState(createCatalog, initialState);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      logo: undefined,
    },
  });

  const { toast } = useToast();

   useEffect(() => {
    if (state?.message) {
        if(state.message === "اسم الكتالوج هذا مستخدم بالفعل.") {
            form.setError('name', { message: state.message });
        } else {
            toast({
                title: 'خطأ',
                description: state.message,
                variant: 'destructive'
            });
        }
    }
  }, [state, toast, form]);


  return (
    <Form {...form}>
      <form action={formAction} className="space-y-8">
        {state?.message && state.message !== "اسم الكتالوج هذا مستخدم بالفعل." && (
            <Alert variant="destructive">
                <AlertTitle>حدث خطأ</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>شعار العمل</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" {...form.register('logo')} />
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
