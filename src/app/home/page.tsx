"use client";

import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Store, Phone } from "lucide-react";

function UnifiedHomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [step, setStep] = useState<'onboarding' | 'registration'>('onboarding');
  const [storeName, setStoreName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      GoogleAuth.initialize({
        clientId: '471992011728-n051jite6n017emj40qm5nht9a999jn6.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    }
  }, []);

  const handleGoogleAuth = async (isSignup: boolean) => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      if (isSignup) {
        // Save store data for the dashboard onboarding to pick up
        localStorage.setItem('pendingStoreName', storeName);
        localStorage.setItem('pendingWhatsApp', `+20${whatsapp}`);
        localStorage.setItem('pendingStoreSlug', whatsapp.replace(/[^\d]/g, ''));
      }

      if (Capacitor.isNativePlatform()) {
        const user = await GoogleAuth.signIn();
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: user.authentication.idToken,
        });

        if (error) throw error;
        
        router.push('/dashboard');
        router.refresh();
      } else {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          }
        });
        if (error) throw error;
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "خطأ في تسجيل الدخول",
        description: err.message || "حدث خطأ ما، حاول مرة أخرى"
      });
      setIsLoading(false);
    }
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
          <div className="relative h-24 w-24">
            <Image
              src="/logo.png"
              alt="اونلاين كاتلوج"
              fill
              className="object-contain"
              priority
            />
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              متجرك جاهز للانطلاق.
            </h1>
            <p className="text-lg text-gray-400">
              امتلك متجر احترافي في 3 دقائق. <span className="text-[#2eb872] font-bold">مجاناً!</span>
            </p>
          </div>
        </div>

        {/* Dynamic Content Based on Step */}
        <div className="space-y-6">
          {step === 'onboarding' ? (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-4">
                <div className="relative group">
                  <Input
                    placeholder="اسم متجرك"
                    className={`bg-black/20 border-2 h-14 pr-12 text-lg rounded-xl transition-all duration-300 focus-visible:ring-1 focus-visible:ring-[#2eb872] text-right ${
                      !storeName 
                        ? "border-gray-700/30 bg-black/40 shadow-inner" 
                        : "border-[#2eb872]/30 bg-[#121f1a]"
                    }`}
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                  />
                  <Store className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-300 h-5 w-5 ${
                    !storeName ? "text-gray-600" : "text-[#2eb872]"
                  }`} />
                  {!storeName && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  )}
                </div>
                
                <div className="relative flex items-center group">
                  <Input
                    placeholder="رقم الواتساب"
                    className={`bg-black/20 border-2 h-14 pr-12 pl-24 text-lg rounded-xl transition-all duration-300 focus-visible:ring-1 focus-visible:ring-[#2eb872] text-right ${
                      !whatsapp 
                        ? "border-gray-700/30 bg-black/40 shadow-inner" 
                        : "border-[#2eb872]/30 bg-[#121f1a]"
                    }`}
                    value={whatsapp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d]/g, '');
                      setWhatsapp(value);
                    }}
                  />
                  <Phone className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-300 h-5 w-5 ${
                    !whatsapp ? "text-gray-600" : "text-[#2eb872]"
                  }`} />
                  <div className={`absolute left-4 flex items-center gap-2 font-bold border-r pr-3 h-6 transition-colors duration-300 ${
                    !whatsapp ? "text-gray-600 border-gray-800" : "text-gray-400 border-[#2eb872]/30"
                  }`} dir="ltr">
                    <span>+20</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => {
                  if (storeName && whatsapp) {
                    setStep('registration');
                  } else {
                    toast({
                      variant: "destructive",
                      title: "بيانات ناقصة",
                      description: "يرجى إدخال اسم المتجر ورقم الواتساب"
                    });
                  }
                }}
                className="w-full h-14 bg-[#2eb872] hover:bg-[#25965d] text-[#05110d] font-bold text-xl rounded-xl shadow-[0_0_20px_rgba(46,184,114,0.3)] transition-all active:scale-95"
              >
                أنشئ متجرك الآن ✨
              </Button>

              <div className="pt-8 border-t border-gray-800 space-y-6">
                <div className="text-center text-white font-bold text-lg">
                  هل لديك حساب بالفعل؟
                </div>
                
                <Button
                  onClick={() => handleGoogleAuth(false)}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full h-14 bg-white text-gray-900 hover:bg-gray-100 border-none rounded-xl flex items-center justify-center gap-3 font-bold shadow-lg shadow-white/5"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
                  </svg>
                  تسجيل الدخول بجوجل
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in zoom-in duration-500">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#2eb872]/20 text-[#2eb872] mb-2">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-[#2eb872]">رائع! ابدأ متجرك الآن</h2>
                <p className="text-gray-400">الخطوة الأخيرة: سجل دخولك بجوجل لتفعيل متجرك</p>
              </div>

              <Button
                onClick={() => handleGoogleAuth(true)}
                disabled={isLoading}
                className="w-full h-16 bg-white hover:bg-gray-100 text-gray-900 font-bold text-xl rounded-xl shadow-lg flex items-center justify-center gap-4 transition-all active:scale-95"
              >
                <svg className="w-7 h-7" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
                </svg>
                التسجيل باستخدام جوجل
              </Button>
              
              <button 
                onClick={() => setStep('onboarding')}
                className="w-full text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors"
              >
                تعديل بيانات المتجر
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 pt-8">
          بالمتابعة، أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بنا.
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2eb872]"></div>
        </div>
      }
    >
      <UnifiedHomeContent />
    </Suspense>
  );
}
