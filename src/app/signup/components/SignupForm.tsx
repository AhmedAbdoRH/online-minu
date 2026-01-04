"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
// import { signInWithGoogle, signUpWithEmail } from "@/app/actions/auth"
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';
import { useToast } from "@/hooks/use-toast";

interface SignupFormProps {
  message: string;
  showEmailForm?: boolean;
}

export function SignupForm({
  message,
  showEmailForm = false,
}: SignupFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      GoogleAuth.initialize({
        clientId: '471992011728-n051jite6n017emj40qm5nht9a999jn6.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    }
  }, []);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        let errorMessage = "حدث خطأ أثناء إنشاء الحساب";
        if (error.message.includes("User already registered")) {
          errorMessage = "هذا البريد الإلكتروني مسجل بالفعل";
        } else if (error.message.includes("Invalid email")) {
          errorMessage = "البريد الإلكتروني غير صحيح";
        } else if (error.message.includes("Password should be")) {
          errorMessage = "كلمة المرور ضعيفة جدًا";
        }
        setError(errorMessage);
      } else {
        if (data.user && !data.session) {
          router.push(
            "/login?message=تم إنشاء الحساب بنجاح، يرجى تأكيد البريد الإلكتروني",
          );
        } else {
          // Auto login if no confirmation needed
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="space-y-4">
        <Button
          type="button"
          disabled={isLoading}
          onClick={async () => {
            console.log('Google Login clicked');
            setIsLoading(true)
            try {
              const supabase = createClient()

              if (Capacitor.isNativePlatform()) {
                console.log('Starting native Google login...');
                const user = await GoogleAuth.signIn();
                console.log('Native Google User obtained');
                console.log('Native Google User:', user);

                console.log('Verifying with Supabase...');
                console.log('Sending ID Token to Supabase:', user.authentication.idToken);

                const { data, error } = await supabase.auth.signInWithIdToken({
                  provider: 'google',
                  token: user.authentication.idToken,
                });

                if (error) {
                  console.error('Supabase Login Error:', error);
                  throw error;
                }

                console.log('Supabase Login Success:', data);
                
                router.push('/dashboard');
                router.refresh();
              } else {
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                  }
                })
                if (error) throw error;
                console.log('OAuth redirect triggered');
              }
            } catch (err: any) {
              console.error('Google login error detail:', err);
              
              const errorMsg = err.message || 'حدث خطأ أثناء تسجيل الدخول';
              toast({
                variant: "destructive",
                title: "عطل في تسجيل الدخول",
                description: errorMsg
              });
              setError(errorMsg);
              setIsLoading(false);
            }
          }}
          variant="outline"
          className="w-full bg-white text-black border-2 border-gray-100 hover:bg-gray-50 h-12 text-lg font-bold rounded-xl shadow-sm transition-all active:scale-95"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-brand-primary rounded-full animate-spin" />
              <span>جاري التحميل...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>التسجيل باستخدام جوجل</span>
            </div>
          )}
        </Button>
      </div>

      {showEmailForm && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                أو التسجيل بالبريد الإلكتروني
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                dir="ltr"
              />
            </div>
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive rounded-lg text-center">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading
                ? "جاري إنشاء الحساب..."
                : "إنشاء حساب بالبريد الإلكتروني"}
            </Button>
          </form>
        </div>
      )}

      {message && (
        <div className="bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive rounded-xl text-center">
          {message}
        </div>
      )}

      <div className="mt-2 text-center text-sm text-muted-foreground">
        لديك حساب بالفعل؟{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          تسجيل الدخول
        </Link>
      </div>

      <p className="text-xs text-center text-muted-foreground px-4">
        بالمتابعة، أنت توافق على{" "}
        <span className="text-primary cursor-pointer hover:underline">شروط الاستخدام</span>
        {" "}و{" "}
        <span className="text-primary cursor-pointer hover:underline">سياسة الخصوصية</span>
      </p>
    </div>
  );
}
