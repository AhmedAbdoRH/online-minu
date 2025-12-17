'use client'

import Image from "next/image"
import { SignupForm } from "./components/SignupForm"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function SignupContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || ''
  const [showEmailForm, setShowEmailForm] = useState(false)

  const handleLogoDoubleClick = () => {
    setShowEmailForm(!showEmailForm)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background to-muted/50">
      <Card className="mx-auto max-w-md w-full shadow-lg border-0">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="flex justify-center">
            <div 
              className="relative h-16 w-16 cursor-pointer select-none"
              onDoubleClick={handleLogoDoubleClick}
            >
              <Image
                src="/mainlogo.png"
                alt="Online Catalog"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">منصة أونلاين كاتلوج</CardTitle>
            <CardDescription className="mt-2 text-primary font-medium">
              إنشاء حساب جديد
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <SignupForm 
            message={message} 
            showEmailForm={showEmailForm}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  )
}