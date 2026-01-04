"use client";

import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "./components/LoginForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "";
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleLogoDoubleClick = () => {
    setShowEmailForm(!showEmailForm);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-muted/50 text-white relative overflow-hidden">
      {/* Subtle warm glass tint (keeps brand colors as primary) */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-200/14 via-amber-100/10 to-transparent dark:from-orange-500/8 dark:via-amber-500/6 dark:to-transparent" />
      {/* Very soft highlights */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-orange-200/14 blur-3xl dark:bg-orange-500/7" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-amber-200/12 blur-3xl dark:bg-amber-500/6" />

      <div className="relative w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Logo Section */}
        <div className="flex flex-col items-center space-y-6">
          <div 
            className="relative h-24 w-24 cursor-pointer select-none"
            onDoubleClick={handleLogoDoubleClick}
          >
            <Image
              src="/logo.png"
              alt="اونلاين كاتلوج"
              fill
              className="object-contain"
              priority
            />
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#2eb872]">
              مرحباً بعودتك.
            </h1>
            <p className="text-lg text-gray-400">
              سجل دخولك للوصول إلى لوحة التحكم
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <LoginForm
            message={message}
            showEmailForm={showEmailForm}
            onToggleEmailForm={() => setShowEmailForm(!showEmailForm)}
          />

          <div className="pt-8 border-t border-gray-800 text-center">
            <p className="text-white font-bold text-lg mb-4">ليس لديك حساب؟</p>
            <Link
              href="/"
              className="inline-flex h-14 w-full items-center justify-center bg-[#2eb872] hover:bg-[#25965d] text-[#05110d] font-bold text-xl rounded-xl shadow-[0_0_20px_rgba(46,184,114,0.3)] transition-all active:scale-95"
            >
              إنشاء متجرك الآن ✨
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 pt-8">
          بالمتابعة، أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بنا.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
