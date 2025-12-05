'use client';

import { useActionState, useEffect, useRef } from 'react';
import { createCatalog } from '@/app/actions/catalog';
import { SubmitButton } from '@/components/common/SubmitButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useToast } from '@/hooks/use-toast';

const initialState = {
  message: '',
};

export function OnboardingForm() {
  const [state, formAction] = useActionState(createCatalog, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // This effect will run when the `state` from the action changes.
    // We check if there's a message and it's not a success scenario (which would redirect).
    if (state?.message) {
      toast({
        title: 'خطأ في الإنشاء',
        description: state.message,
        variant: 'destructive'
      });
    }
  }, [state, toast]);

  // This effect resets the form when the component mounts or the form action result changes.
  useEffect(() => {
    if (!state?.message) {
      formRef.current?.reset();
    }
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="display_name">اسم المتجر للعرض</Label>
        <Input
          id="display_name"
          name="display_name"
          placeholder="مطعم الوفاء"
          required
          minLength={3}
          maxLength={50}
        />
        <p className="text-sm text-muted-foreground">
          هذا هو الاسم الذي سيظهر للعملاء في صفحة الكتالوج
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">اسم الكتالوج (باللغة الإنجليزية)</Label>
        <Input
          id="name"
          name="name"
          placeholder="my-restaurant"
          required
          pattern="^[a-z0-9-]+$"
          title="يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط"
          minLength={3}
        />
        <p className="text-sm text-muted-foreground">
          سيتم استخدام هذا الاسم في رابط الكتالوج الخاص بك. مثال: online-catalog.net/my-restaurant
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo">شعار العمل</Label>
        <Input
          id="logo"
          name="logo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
        />
        <p className="text-sm text-muted-foreground">
          اختياري - يمكنك إضافته لاحقاً من الإعدادات
        </p>
      </div>

      <SubmitButton pendingText="جاري الإنشاء..." className="w-full">
        إنشاء كتالوجي
      </SubmitButton>
    </form>
  );
}
