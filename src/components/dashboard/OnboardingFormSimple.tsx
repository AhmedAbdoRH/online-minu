'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Store, Phone, CheckCircle2, AlertCircle, Loader2, Sparkles, ShieldCheck, Zap, Globe, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { checkCatalogName } from '@/app/actions/catalog';
import { useRouter } from 'next/navigation';
import { convertArabicNumerals } from '@/lib/utils';

const countries = [
  { code: '+20', name: 'مصر', flag: '🇪🇬' },
  { code: '+966', name: 'السعودية', flag: '🇸🇦' },
  { code: '+971', name: 'الإمارات', flag: '🇦🇪' },
  { code: '+212', name: 'المغرب', flag: '🇲🇦' },
];

const benefits = [
  { icon: Globe, text: 'رابط خاص بمتجرك' },
  { icon: Zap, text: 'سرعة فائقة في التصفح' },
  { icon: ShieldCheck, text: 'إدارة سهلة لمنتجاتك' },
];

interface OnboardingFormSimpleProps {
  onSubmit: (data: { displayName: string; slug: string; whatsapp: string }) => void;
  isSubmitting?: boolean;
}

export function OnboardingFormSimple({ onSubmit, isSubmitting }: OnboardingFormSimpleProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [storeName, setStoreName] = useState('');

  // Auto-focus the store name input on mount
  useEffect(() => {
    if (inputRef.current) {
      // Small delay to ensure the page is fully ready and animations are starting
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
  const [slugError, setSlugError] = useState('');

  // Generate slug from phone number (consistent with WelcomePopup logic)
  const generatedSlug = phoneNumber.replace(/[^0-9]/g, '');

  const checkSlugAvailability = useCallback(async (slug: string) => {
    if (!slug || slug.length < 7) {
      setIsSlugAvailable(null);
      setSlugError('');
      return;
    }

    setIsCheckingSlug(true);
    setSlugError('');

    try {
      const available = await checkCatalogName(slug);
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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (generatedSlug.length >= 7) {
        checkSlugAvailability(generatedSlug);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [generatedSlug, checkSlugAvailability]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (storeName.trim().length >= 2 && generatedSlug.length >= 7 && isSlugAvailable === true) {
      onSubmit({
        displayName: storeName.trim(),
        slug: generatedSlug,
        whatsapp: selectedCountry.code + phoneNumber,
      });
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const canProceed = storeName.trim().length >= 2 && generatedSlug.length >= 7 && isSlugAvailable === true && !isCheckingSlug && !isSubmitting;

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto py-8 px-4 md:px-0">
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start w-full">
        {/* Logo */}
        <div className="flex-shrink-0 w-32 md:w-48 relative flex items-center justify-center animate-in fade-in slide-in-from-top-4 md:slide-in-from-right-8 duration-700">
          <Image
            src="/logo.png"
            alt="Logo"
            width={180}
            height={180}
            className="object-contain w-full h-auto max-h-[100px] md:max-h-none"
          />
        </div>

        <div className="flex-1 text-right w-full animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-left-8 duration-700">
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-3 md:mb-4 !text-white">
            متجرك جاهز للانطلاق.
          </h2>
          <p className="text-white/80 text-base md:text-xl leading-relaxed mb-8 md:mb-10">
            امتلك متجر احترافي في 3 دقائق.
            <span className="text-[#4ade80] font-bold"> مجاناً!</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            {/* Store Name Input */}
            <div className="relative">
              <Store className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="اسم متجرك"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="h-14 md:h-16 pr-10 md:pr-12 text-right bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl md:rounded-2xl focus:border-[#4ade80] focus:ring-[#4ade80] text-lg md:text-xl transition-all"
                required
                autoFocus
              />
            </div>

            {/* WhatsApp Number Field */}
            <div className="flex bg-white/5 border border-white/10 rounded-xl md:rounded-2xl overflow-hidden focus-within:border-[#4ade80] focus-within:ring-1 focus-within:ring-[#4ade80] transition-all" dir="ltr">
              <select
                value={selectedCountry.code}
                onChange={(e) => {
                  const country = countries.find(c => c.code === e.target.value);
                  if (country) setSelectedCountry(country);
                }}
                className="bg-transparent border-r border-white/10 px-3 md:px-4 h-14 md:h-16 text-white text-base md:text-lg focus:outline-none w-[80px] md:w-[100px] cursor-pointer appearance-none text-center font-bold"
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code} className="bg-[#1a3a4a]">
                    {country.code}
                  </option>
                ))}
              </select>
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="tel"
                  inputMode="tel"
                  pattern="[0-9]*"
                  placeholder="رقم الواتساب"
                  value={phoneNumber}
                  onChange={(e) => {
                    const converted = convertArabicNumerals(e.target.value);
                    setPhoneNumber(converted.replace(/[^0-9]/g, ''));
                  }}
                  className="h-14 md:h-16 pl-10 md:pl-12 border-0 bg-transparent text-white placeholder:text-white/30 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 font-mono text-lg md:text-xl"
                  dir="ltr"
                  required
                />
                {isCheckingSlug && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-white/50 animate-spin" />
                )}
                {!isCheckingSlug && isSlugAvailable === true && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-[#4ade80]" />
                )}
                {!isCheckingSlug && isSlugAvailable === false && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-red-400" />
                )}
              </div>
            </div>

            {/* URL Preview */}
            {generatedSlug.length >= 7 && (
              <div className="flex items-center justify-end gap-2 text-sm md:text-base px-1" dir="ltr">
                <span className="text-white/40">رابط متجرك:</span>
                <span className="text-[#4ade80] font-mono truncate max-w-[200px] md:max-w-none">online-catalog.net/{generatedSlug}</span>
                {isSlugAvailable && <span className="text-[#4ade80]">✓</span>}
              </div>
            )}

            {slugError && (
              <p className="text-sm md:text-base text-red-400 text-right px-1 font-medium">{slugError}</p>
            )}

            <div className="pt-4 md:pt-6">
              <Button
                type="submit"
                disabled={!canProceed}
                className="w-full h-14 md:h-16 bg-[#4ade80] hover:bg-[#22c55e] text-[#1a3a4a] font-black text-lg md:text-xl rounded-xl md:rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-[#4ade80]/20"
              >
                {isSubmitting ? (
                  <Loader2 className="h-6 w-6 md:h-7 md:w-7 ml-3 animate-spin" />
                ) : (
                  <Sparkles className="h-6 w-6 md:h-7 md:w-7 ml-3" />
                )}
                أنشئ متجرك الآن
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex items-center justify-end gap-2 text-white/60 text-xs md:text-sm bg-white/5 p-3 rounded-xl border border-white/5">
            <span>{benefit.text}</span>
            <benefit.icon className="h-4 w-4 text-[#4ade80]" />
          </div>
        ))}
      </div>

      {/* Logout Link */}
      <div className="flex justify-center mt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-white/30 hover:text-red-400 transition-colors text-xs font-medium group"
        >
          <span>تسجيل الخروج</span>
          <LogOut className="h-3.5 w-3.5 group-hover:translate-x-[-2px] transition-transform" />
        </button>
      </div>
    </div>
  );
}
