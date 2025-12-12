'use client'

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { updatePassword } from "@/app/actions/auth"
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

function ResetPasswordContent() {
  const router = useRouter()
  const [message, setMessage] = useState<{text: string, isError: boolean} | null>(null)
  const [token, setToken] = useState<string | null>(null)
  
  useEffect(() => {
    // Get the token from URL parameters
    const hash = window.location.hash
    if (hash) {
      const params = new URLSearchParams(hash.substring(1))
      const tokenHash = params.get('token_hash')
      setToken(tokenHash)
      
      if (!tokenHash) {
        setMessage({text: "رابط إعادة تعيين كلمة المرور غير صحيح", isError: true})
      }
    } else {
      setMessage({text: "رابط إعادة تعيين كلمة المرور غير صحيح", isError: true})
    }
  }, [])
  
  const handleSubmit = async (formData: FormData) => {
    if (!token) {
      setMessage({text: "رابط إعادة تعيين كلمة المرور غير صحيح", isError: true})
      return
    }
    
    // Add token to form data
    formData.append('token', token)
    
    const result = await updatePassword(formData)
    
    if (result?.error) {
      setMessage({text: result.error, isError: true})
    } else if (result?.success) {
      setMessage({text: "تم تغيير كلمة المرور بنجاح! سيتم تحويلك إلى صفحة تسجيل الدخول...", isError: false})
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">إعادة تعيين كلمة المرور</CardTitle>
        <CardDescription>
          أدخل كلمة المرور الجديدة الخاصة بك
        </CardDescription>
      </CardHeader>
      <CardContent>
        {token ? (
          <form action={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">كلمة المرور الجديدة</Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
              <Input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>
            
            <SubmitButton pendingText="جاري تحديث كلمة المرور..." className="w-full">
              تحديث كلمة المرور
            </SubmitButton>
            
            {message && (
              <div className={`p-3 text-sm rounded-md text-center ${
                message.isError 
                  ? "bg-destructive/15 text-destructive" 
                  : "bg-emerald-500/15 text-emerald-600"
              }`}>
                {message.text}
              </div>
            )}
          </form>
        ) : (
          <div className="text-center py-4">
            {message ? (
              <div className={`p-3 text-sm rounded-md text-center ${
                message.isError 
                  ? "bg-destructive/15 text-destructive" 
                  : "bg-emerald-500/15 text-emerald-600"
              }`}>
                {message.text}
              </div>
            ) : (
              <p>جارٍ التحقق من رابط إعادة تعيين كلمة المرور...</p>
            )}
          </div>
        )}
        
        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="underline">
            العودة إلى تسجيل الدخول
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}