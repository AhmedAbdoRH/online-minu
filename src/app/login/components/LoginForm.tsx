'use client'

// import { signInWithGoogle } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';
import { useToast } from "@/hooks/use-toast"

interface LoginFormProps {
  message: string
  onLogoDoubleClick?: () => void
  onToggleEmailForm?: () => void
  showEmailForm?: boolean
}

export function LoginForm({ message, onLogoDoubleClick, onToggleEmailForm, showEmailForm = false }: LoginFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("01100434503@catalog.app")
  const [password, setPassword] = useState("Anaahmedgedo1001")
  const [error, setError] = useState("")

          useEffect(() => {
            if (Capacitor.isNativePlatform()) {
              // On Android/iOS, the plugin reads from capacitor.config.ts
              // Calling initialize with explicit IDs can help if config reading fails
              // For Supabase, we MUST use the Web Client ID here to get the correct audience in idToken
              GoogleAuth.initialize({
                clientId: '471992011728-o37eenopdmpm81s6npksqjv6j0ug9uhu.apps.googleusercontent.com',
                scopes: ['profile', 'email'],
                grantOfflineAccess: true,
              });
            }
          }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          خيارات تسجيل الدخول
        </p>
      </div>

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
          className="w-full h-14 gap-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl font-medium text-base"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></span>
              <span>جاري التحميل...</span>
            </div>
          ) : (
            <>
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              تسجيل الدخول بحساب جوجل
            </>
          )}
        </Button>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onToggleEmailForm}
          className="text-xs text-muted-foreground hover:underline cursor-pointer"
        >
          {showEmailForm ? "إخفاء تسجيل الدخول بالبريد" : "هل تريد تسجيل الدخول بالبريد الإلكتروني؟"}
        </button>
      </div>

      {/* Hidden Email/Password Form - appears on logo double click */}
      {showEmailForm && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">أو</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="bg-white text-[#1e3a5f]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-white text-[#1e3a5f]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول بالبريد الإلكتروني"}
            </Button>
          </form>
        </>
      )}

      {message && (
        <div className="bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive rounded-xl text-center">
          {message}
        </div>
      )}

      <p className="text-xs text-center text-muted-foreground px-4">
        بالمتابعة، أنت توافق على{" "}
        <span className="text-primary cursor-pointer hover:underline">شروط الاستخدام</span>
        {" "}و{" "}
        <span className="text-primary cursor-pointer hover:underline">سياسة الخصوصية</span>
      </p>
    </div>
  )
}
