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
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background to-muted/50">
      <Card className="relative mx-auto max-w-md w-full border border-border bg-card/85 text-card-foreground shadow-lg backdrop-blur-md overflow-hidden">
        {/* Subtle warm glass tint (keeps brand colors as primary) */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-200/14 via-amber-100/10 to-transparent dark:from-orange-500/8 dark:via-amber-500/6 dark:to-transparent" />
        {/* Very soft highlights */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-orange-200/14 blur-3xl dark:bg-orange-500/7" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-amber-200/12 blur-3xl dark:bg-amber-500/6" />

        <CardHeader className="relative text-center space-y-4 pb-2">
          <div className="flex justify-center">
            <div
              className="relative h-16 w-16 cursor-pointer select-none"
              onDoubleClick={handleLogoDoubleClick}
            >
              <Image
                src="/logo.png"
                alt="Online Catalog"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">مرحباً بعودتك</CardTitle>
            <CardDescription className="mt-2">
              سجل دخولك للوصول إلى لوحة التحكم
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="relative pt-4">
          <LoginForm
            message={message}
            showEmailForm={showEmailForm}
            onToggleEmailForm={() => setShowEmailForm(!showEmailForm)}
          />

          <div className="mt-6 text-center text-sm text-muted-foreground">
            ليس لديك حساب؟{" "}
            <Link
              href="/signup"
              className="text-primary font-medium hover:underline"
            >
              إنشاء حساب جديد
            </Link>
          </div>
        </CardContent>
      </Card>
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
