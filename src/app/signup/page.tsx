import Link from "next/link"
import { signup } from "@/app/actions/auth"
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
import { PasswordInput } from "@/components/auth/PasswordInput"

export default async function SignupPage(props: {
  searchParams: Promise<{ message: string }>
}) {
  const searchParams = await props.searchParams;
  const message = searchParams.message;

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">إنشاء حساب</CardTitle>
        <CardDescription>
          أدخل رقم الهاتف وكلمة المرور لإنشاء حساب جديد
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={signup} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <div className="flex gap-2">
              <select 
                id="countryCode" 
                name="countryCode" 
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                defaultValue="+20"
              >
                <option value="+20">🇪🇬 +20</option>
                <option value="+971">🇦🇪 +971</option>
                <option value="+966">🇸🇦 +966</option>
                <option value="+212">🇲🇦 +212</option>
              </select>
              <Input
                id="phone"
                type="tel"
                name="phone"
                placeholder="01xxxxxxxxx"
                required
                className="flex-1"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPhone">تأكيد رقم الهاتف</Label>
            <div className="flex gap-2">
              <select 
                id="confirmCountryCode" 
                name="confirmCountryCode" 
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                defaultValue="+20"
              >
                <option value="+20">🇪🇬 +20</option>
                <option value="+971">🇦🇪 +971</option>
                <option value="+966">🇸🇦 +966</option>
                <option value="+212">🇲🇦 +212</option>
              </select>
              <Input
                id="confirmPhone"
                type="tel"
                name="confirmPhone"
                placeholder="01xxxxxxxxx"
                required
                className="flex-1"
              />
            </div>
          </div>
          <PasswordInput />
          <SubmitButton pendingText="جاري إنشاء الحساب..." className="w-full">
            إنشاء حساب
          </SubmitButton>
          {message && (
            <div className="bg-destructive/15 p-3 text-sm text-destructive rounded-md text-center">
              {message}
            </div>
          )}
        </form>
        <div className="mt-4 text-center text-sm">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="underline">
            تسجيل الدخول
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}