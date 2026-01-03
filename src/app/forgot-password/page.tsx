'use client';

import Link from "next/link"
import { SubmitButton } from "@/components/common/SubmitButton"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    const email = formData.get('email') as string;
    const supabase = createClient();

    // For mobile app, we might need a deep link scheme if strictly native, 
    // but typically we use the website URL or a custom scheme.
    // For now assuming the standard generic auth callback URL logic.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setMessage(`خطأ: ${error.message}`);
    } else {
      setMessage("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.");
    }
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">نسيت كلمة المرور</CardTitle>
        <CardDescription>
          أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="example@email.com"
              required
            />
          </div>

          <SubmitButton pendingText="جاري إرسال الرابط..." className="w-full">
            إرسال رابط إعادة تعيين كلمة المرور
          </SubmitButton>

          {message && (
            <div className={`p-3 text-sm rounded-md text-center ${message.includes("خطأ")
                ? "bg-destructive/15 text-destructive"
                : "bg-emerald-500/15 text-emerald-600"
              }`}>
              {message}
            </div>
          )}
        </form>
        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="underline">
            العودة إلى تسجيل الدخول
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}