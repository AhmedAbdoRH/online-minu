'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Store, CheckCircle2, Sparkles, Loader2, AlertCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

const countries = [
  { code: '+20', name: 'مصر', flag: '🇪🇬' },
  { code: '+966', name: 'السعودية', flag: '🇸🇦' },
  { code: '+971', name: 'الإمارات', flag: '🇦🇪' },
  { code: '+212', name: 'المغرب', flag: '🇲🇦' },
];

export function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [stage, setStage] = useState<'input' | 'confirm'>('input');
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
  const [slugError, setSlugError] = useState('');

  // Generate slug from phone number
  const generatedSlug = phoneNumber.replace(/[^0-9]/g, '');

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('hasSeenWelcomePopup');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Check slug availability when phone number changes
  const checkSlugAvailability = useCallback(async (slug: string) => {
    if (!slug || slug.length < 7) {
      setIsSlugAvailable(null);
      setSlugError('');
      return;
    }

    setIsCheckingSlug(true);
    setSlugError('');

    try {
      const supabase = createClient();
      const { data } = await supabase.from('catalogs').select('name').eq('name', slug).maybeSingle();
      const available = !data;
      setIsSlugAvailable(available);

      if (!available) {
        setSlugError('هذا الرقم مستخدم بالفعل');
      }
    } catch (error) {
      console.error('Error checking slug:', error);
    } finally {
      setIsCheckingSlug(false);
    }
  }, []);

  // Debounce slug check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (generatedSlug.length >= 7) {
        checkSlugAvailability(generatedSlug);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [generatedSlug, checkSlugAvailability]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenWelcomePopup', 'true');
  };

  const handleReserveName = () => {
    if (storeName.trim().length >= 2 && generatedSlug.length >= 7 && isSlugAvailable) {
      setStage('confirm');
    }
  };

  const handleGoogleSignIn = () => {
    // Save all data to localStorage before redirect
    if (storeName.trim()) {
      localStorage.setItem('pendingStoreName', storeName.trim());
    }
    if (generatedSlug) {
      localStorage.setItem('pendingStoreSlug', generatedSlug);
    }
    const fullPhone = selectedCountry.code + phoneNumber;
    localStorage.setItem('pendingWhatsApp', fullPhone);
    localStorage.setItem('hasSeenWelcomePopup', 'true');
  };

  const isLoading = isCheckingSlug;
  const canProceed = storeName.trim().length >= 2 && generatedSlug.length >= 7 && isSlugAvailable === true && !isLoading;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="relative w-full max-w-md bg-[#1a3a4a] rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-300">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-6 flex gap-4">
          {/* Logo */}
          <div className="flex-shrink-0 w-28 relative flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={100}
              height={100}
              className="object-contain"
            />
          </div>

          {/* Content */}
          <div className="flex-1 text-right pt-2">
            {stage === 'input' ? (
              <>
                <h2 className="text-xl font-bold text-white leading-tight mb-1">
                  لحظة من فضلك!
                </h2>
                <h3 className="text-lg font-bold text-white leading-tight mb-3">
                  متجرك جاهز للانطلاق.
                </h3>
                <p className="text-white/80 text-sm leading-relaxed mb-4">
                  امتلك متجر احترافي في 3 دقائق.
                  <span className="text-[#4ade80] font-bold"> مجاناً!</span>
                </p>

                <div className="space-y-3 mb-4">
                  {/* Store Name Input */}
                  <div className="relative">
                    <Store className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="اسم متجرك"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="h-11 pr-9 text-right bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl focus:border-[#4ade80] focus:ring-[#4ade80] text-sm"
                    />
                  </div>

                  {/* WhatsApp Number Joined Field */}
                  <div className="flex bg-white/10 border border-white/20 rounded-xl overflow-hidden focus-within:border-[#4ade80] focus-within:ring-1 focus-within:ring-[#4ade80]" dir="ltr">
                    <select
                      value={selectedCountry.code}
                      onChange={(e) => {
                        const country = countries.find(c => c.code === e.target.value);
                        if (country) setSelectedCountry(country);
                      }}
                      className="bg-transparent border-r border-white/10 px-1 h-11 text-white text-[13px] focus:outline-none w-[55px] cursor-pointer appearance-none text-center"
                    >
                      {countries.map((country) => (
                        <option key={country.code} value={country.code} className="bg-[#1a3a4a]">
                          {country.code}
                        </option>
                      ))}
                    </select>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="tel"
                        placeholder="رقم الواتساب"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                        onKeyDown={(e) => e.key === 'Enter' && handleReserveName()}
                        className="h-11 pl-9 border-0 bg-transparent text-white placeholder:text-white/50 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 font-mono text-sm"
                        dir="ltr"
                      />
                      {isCheckingSlug && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 animate-spin" />
                      )}
                      {!isCheckingSlug && isSlugAvailable === true && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4ade80]" />
                      )}
                      {!isCheckingSlug && isSlugAvailable === false && (
                        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-400" />
                      )}
                    </div>
                  </div>

                  {/* Live URL Preview */}
                  {generatedSlug.length >= 7 && (
                    <div className="flex items-center justify-end gap-2 text-xs" dir="ltr">
                      <span className="text-white/40">رابط متجرك:</span>
                      <span className="text-[#4ade80] font-mono">online-catalog.net/{generatedSlug}</span>
                      {isSlugAvailable && <span className="text-[#4ade80]">✓</span>}
                    </div>
                  )}

                  {slugError && (
                    <p className="text-xs text-red-400 text-right">{slugError}</p>
                  )}
                </div>

                {/* Reserve Name Button */}
                <Button
                  type="button"
                  onClick={handleReserveName}
                  disabled={!canProceed}
                  className="w-full h-11 bg-[#4ade80] hover:bg-[#22c55e] text-[#1a3a4a] font-bold text-sm rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 ml-2" />
                  )}
                  أنشئ متجرك الآن
                </Button>
              </>
            ) : (
              <>
                {/* Confirmation Stage */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  <CheckCircle2 className="h-7 w-7 text-[#4ade80]" />
                  <h2 className="text-xl font-bold text-[#4ade80]">
                    مبروك!
                  </h2>
                </div>

                <div className="bg-white/10 rounded-xl p-3 mb-4 text-center">
                  <p className="text-white font-bold text-base mb-1">
                    الرابط متاح ✨
                  </p>
                  <p className="text-white/80 text-sm">
                    ابدأ متجرك الآن بضغطة واحدة
                  </p>
                  <div className="mt-2 text-xs text-[#4ade80] font-mono" dir="ltr">
                    online-catalog.net/{generatedSlug}
                  </div>
                </div>

                {/* Google Sign In Button */}
                <Button
                  type="button"
                  onClick={async () => {
                    handleGoogleSignIn();
                    const supabase = createClient();
                    await supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: {
                        redirectTo: `${window.location.origin}/auth/callback`,
                      }
                    });
                  }}
                  className="w-full h-11 gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl font-medium text-sm flex items-center justify-center flex-row-reverse"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                  <span>التسجيل باستخدام جوجل</span>
                </Button>

                {/* Back button */}
                <button
                  onClick={() => setStage('input')}
                  className="absolute left-4 top-4 text-2xl text-white/30 hover:text-white transition-colors"
                  aria-label="تعديل البيانات"
                >
                  ←
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}