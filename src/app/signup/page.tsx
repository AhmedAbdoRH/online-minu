"use client";

import Image from "next/image";
import { SignupForm } from "./components/SignupForm";
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

function SignupContent() {
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
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-200/10 via-amber-100/6 to-transparent dark:from-orange-500/6 dark:via-amber-500/4 dark:to-transparent" />
        {/* Very soft highlights */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-orange-200/10 blur-3xl dark:bg-orange-500/5" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-amber-200/8 blur-3xl dark:bg-amber-500/4" />
        <CardHeader className="relative text-center space-y-4 pb-2">
          <div className="flex justify-center">
            <div
              className="relative h-16 w-16 cursor-pointer select-none"
              onDoubleClick={handleLogoDoubleClick}
            >
              <Image
                src="/logo.png"
                alt="منصة اونلاين كاتلوج"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              منصة اونلاين كاتلوج
            </CardTitle>
            <CardDescription className="mt-2 text-primary font-medium">
              إنشاء حساب جديد
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="relative pt-4">
          <SignupForm message={message} showEmailForm={showEmailForm} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
