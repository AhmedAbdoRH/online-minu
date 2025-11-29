import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "@/app/actions/auth"
import { SubmitButton } from "@/components/common/SubmitButton"

export default async function LoginPage(props: {
  searchParams: Promise<{ message: string }>
}) {
  const searchParams = await props.searchParams;
  const message = searchParams.message;

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
        <CardDescription>
          أدخل بريدك الإلكتروني وكلمة المرور للدخول إلى حسابك
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={login} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">كلمة المرور</Label>
            </div>
            <Input id="password" type="password" name="password" required />
          </div>
          <SubmitButton pendingText="جاري تسجيل الدخول..." className="w-full">
            تسجيل الدخول
          </SubmitButton>
          {message && (
            <div className="bg-destructive/15 p-3 text-sm text-destructive rounded-md text-center">
              {message}
            </div>
          )}
        </form>
        <div className="mt-4 text-center text-sm">
          ليس لديك حساب؟{" "}
          <Link href="/signup" className="underline">
            إنشاء حساب
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
