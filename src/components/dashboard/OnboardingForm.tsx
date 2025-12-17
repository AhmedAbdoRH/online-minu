'use client';

import { useActionState, useEffect, useRef, useState, useCallback } from 'react';
import { createCatalog, checkCatalogName } from '@/app/actions/catalog';
import { SubmitButton } from '@/components/common/SubmitButton';
import { Input } from '@/components/ui/input';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Store,
  Link2,
  MessageCircle,
  ImageIcon,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Check,
  Rocket,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../ui/badge';

const initialState = {
  message: '',
};

interface OnboardingFormProps {
  userPhone?: string;
}

const countries = [
  { code: '+20', name: 'مصر', flag: '🇪🇬' },
  { code: '+966', name: 'السعودية', flag: '🇸🇦' },
  { code: '+971', name: 'الإمارات', flag: '🇦🇪' },
  { code: '+212', name: 'المغرب', flag: '🇲🇦' },
];

const steps = [
  { id: 0, title: 'البداية', emoji: '👋' },
  { id: 1, title: 'اسم المتجر', emoji: '🏪' },
  { id: 2, title: 'الرابط', emoji: '🔗' },
  { id: 3, title: 'واتساب', emoji: '💬' },
  { id: 4, title: 'اللوجو', emoji: '🎨' },
];

export function OnboardingForm({ userPhone }: OnboardingFormProps) {
  const [state, formAction] = useActionState(createCatalog, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameError, setNameError] = useState('');
  const [isNameAvailable, setIsNameAvailable] = useState<boolean | null>(null);

  const [formData, setFormData] = useState({
    display_name: '',
    name: '',
    whatsapp_number: userPhone || '',
    logo: null as File | null,
  });

  const [selectedCountry, setSelectedCountry] = useState({
    code: '+20',
    name: 'مصر'
  });

  const { toast } = useToast();

  useEffect(() => {
    if (state?.message) {
      toast({
        title: 'تنبيــه',
        description: state.message,
        variant: 'destructive'
      });
    }
  }, [state, toast]);

  const handleInputChange = (field: string, value: string | File | null) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Smart suggestion for slug when display name changes
      if (field === 'display_name' && typeof value === 'string' && !prev.name) {
        // Simple slugification for English or basic cleanup
        const suggestedSlug = value
          .toLowerCase()
          .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, '') // Keep Arabic, English, numbers
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();

        // Remove non-ASCII for the actual URL slug
        const validSlug = suggestedSlug.replace(/[^\x00-\x7F]/g, '');
        if (validSlug.length >= 3) {
          newData.name = validSlug;
        }
      }

      return newData;
    });
  };

  const validateSlug = useCallback(async (name: string) => {
    if (name.length < 3) {
      setNameError('أقل طول 3 أحرف');
      setIsNameAvailable(null);
      return;
    }

    if (!/^[a-z0-9-]+$/.test(name)) {
      setNameError('أحرف إنجليزية صغيرة وأرقام وشرطات فقط');
      setIsNameAvailable(null);
      return;
    }

    setIsCheckingName(true);
    setNameError('');
    try {
      const available = await checkCatalogName(name);
      setIsNameAvailable(available);
      if (!available) {
        setNameError('هذا الرابط مستخدم بالفعل، جرب غيره');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCheckingName(false);
    }
  }, []);

  // Debounce slug check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.name && currentStep === 2) {
        validateSlug(formData.name);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.name, validateSlug, currentStep]);

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return formData.display_name.length >= 3;
      case 2:
        return formData.name.length >= 3 && isNameAvailable === true && !isCheckingName;
      case 3:
        return formData.whatsapp_number.length >= 7;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    setDirection(1);
    nextStep();
  };

  const handlePrev = () => {
    setDirection(-1);
    prevStep();
  };

  return (
    <div className="relative">
      {/* Decorative Blobs */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-luxury/10 rounded-full blur-3xl pointer-events-none" />

      <form ref={formRef} action={formAction} className="space-y-8 relative z-10">
        {/* Progress Display */}
        {currentStep > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold">
                  {steps[currentStep].emoji} {steps[currentStep].title}
                </Badge>
              </div>
              <div className="flex gap-1.5">
                {steps.slice(1).map((step) => (
                  <div
                    key={step.id}
                    className={`h-2 rounded-full transition-all duration-500 ease-out ${currentStep >= step.id ? 'w-8 bg-primary shadow-[0_0_10px_rgba(0,209,201,0.5)]' : 'w-2 bg-muted/50'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="min-h-[350px] flex flex-col justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
              }}
              className="w-full"
            >
              {currentStep === 0 && (
                <div className="text-center space-y-8 py-4">
                  <motion.div
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: 1, rotate: 3 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="relative mx-auto w-28 h-28 flex items-center justify-center bg-gradient-to-br from-primary via-cyan-400 to-brand-luxury rounded-[2rem] shadow-2xl shadow-primary/20"
                  >
                    <Rocket className="w-14 h-14 text-white animate-bounce-slow" />
                  </motion.div>
                  <div className="space-y-3">
                    <h2 className="text-4xl font-black text-foreground tracking-tight">مرحباً بك في رحلة متجرك الجديد!</h2>
                    <p className="text-muted-foreground text-xl max-w-sm mx-auto leading-relaxed">
                      خلال أقل من 60 ثانية، سنقوم ببناء متجرك الإلكتروني الاحترافي معاً.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="group h-16 px-10 text-xl font-bold rounded-2xl bg-primary hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 active:scale-95"
                  >
                    دعنا نبدأ الرحلة الآن
                    <ArrowLeft className="mr-3 h-6 w-6 transition-transform group-hover:-translate-x-2" />
                  </Button>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="text-center space-y-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-7xl mb-4 inline-block transform hover:scale-110 transition-transform cursor-pointer"
                    >
                      🏪
                    </motion.div>
                    <h2 className="text-3xl font-black">ما هو الاسم المميز لمتجرك؟</h2>
                    <p className="text-muted-foreground text-lg italic">هذا هو الاسم الذي سيعرفه الناس ويحبونه</p>
                  </div>

                  <div className="space-y-5">
                    <div className="relative group">
                      <Store className="absolute right-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="display_name"
                        name="display_name"
                        placeholder="مثال: متجر الهنا للملابس"
                        className="h-20 pr-14 text-2xl text-right bg-background/50 border-2 border-border/50 focus:border-primary transition-all rounded-3xl shadow-lg backdrop-blur-sm"
                        required
                        minLength={3}
                        maxLength={50}
                        value={formData.display_name}
                        onChange={(e) => handleInputChange('display_name', e.target.value)}
                        autoFocus
                      />
                    </div>

                    {formData.display_name.length >= 3 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center gap-3 p-4 bg-primary/10 rounded-2xl border border-primary/20 shadow-sm"
                      >
                        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                        <span className="text-primary font-black text-lg">يا له من اسم رائع! ✨</span>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="text-center space-y-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-7xl mb-4 inline-block transform hover:scale-110 transition-transform"
                    >
                      🌐
                    </motion.div>
                    <h2 className="text-3xl font-black">رابط متجرك على الإنترنت</h2>
                    <p className="text-muted-foreground text-lg italic">عنوانك الفريد الذي ستشاركه مع عملائك</p>
                  </div>

                  <div className="space-y-5">
                    <div className="flex flex-col gap-3" dir="ltr">
                      <div className="flex items-center bg-card/50 backdrop-blur-md rounded-3xl border-2 border-border/50 focus-within:border-primary transition-all overflow-hidden shadow-lg">
                        <div className="px-6 py-6 bg-muted/40 text-muted-foreground font-mono text-base border-r border-border/30 select-none">
                          online-catalog.net/
                        </div>
                        <Input
                          id="name"
                          name="name"
                          placeholder="shop-name"
                          className="h-20 text-xl bg-transparent border-0 focus-visible:ring-0 font-mono flex-1 px-5"
                          required
                          pattern="^[a-z0-9-]+$"
                          minLength={3}
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value.toLowerCase())}
                        />
                        <div className="pr-5 flex items-center">
                          {isCheckingName && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                          {!isCheckingName && isNameAvailable === true && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                              <CheckCircle2 className="h-6 w-6 text-brand-success" />
                            </motion.div>
                          )}
                          {!isCheckingName && isNameAvailable === false && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                              <AlertCircle className="h-6 w-6 text-brand-error" />
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="min-h-[24px] text-center">
                      <AnimatePresence mode="wait">
                        {nameError ? (
                          <motion.p
                            key="error"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-base text-destructive font-bold"
                          >
                            {nameError}
                          </motion.p>
                        ) : (
                          formData.name.length >= 3 && isNameAvailable === true && (
                            <motion.div
                              key="success"
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-base text-brand-success font-bold flex items-center justify-center gap-2"
                            >
                              <Zap className="h-5 w-5 fill-current" />
                              هذا الرابط متاح ومثالي لبراندك!
                            </motion.div>
                          )
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-8">
                  <div className="text-center space-y-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-7xl mb-4 inline-block transform hover:scale-110 transition-transform"
                    >
                      💬
                    </motion.div>
                    <h2 className="text-3xl font-black">طلباتك تصلك على واتساب</h2>
                    <p className="text-muted-foreground text-lg italic">أسهل طريقة للبيع والتواصل مع العملاء</p>
                  </div>

                  <div className="space-y-5">
                    <div className="flex gap-3" dir="ltr">
                      <select
                        value={selectedCountry.code}
                        onChange={(e) => {
                          const country = countries.find(c => c.code === e.target.value);
                          if (country) setSelectedCountry(country);
                        }}
                        className="bg-background/80 border-2 border-border/50 rounded-3xl px-5 py-5 h-20 focus:outline-none focus:border-primary transition-all text-xl font-black min-w-[140px] shadow-lg backdrop-blur-sm"
                      >
                        {countries.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.code}
                          </option>
                        ))}
                      </select>
                      <div className="relative flex-1 group">
                        <MessageCircle className="absolute right-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-brand-success transition-colors" />
                        <Input
                          id="whatsapp_number"
                          name="whatsapp_number"
                          placeholder="1234567890"
                          className="h-20 pr-14 text-2xl bg-background/80 border-2 border-border/50 focus:border-primary transition-all font-mono rounded-3xl shadow-lg backdrop-blur-sm text-right font-black"
                          value={formData.whatsapp_number}
                          onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
                          required
                          type="tel"
                          pattern="[0-9]{7,15}"
                        />
                      </div>
                    </div>

                    {formData.whatsapp_number.length >= 7 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 bg-brand-success/10 border-2 border-brand-success/20 rounded-3xl text-center shadow-sm"
                      >
                        <div className="flex items-center justify-center gap-3 text-brand-success font-black text-lg">
                          <CheckCircle2 className="h-6 w-6" />
                          <span>رائع! سيتم ربط المتجر بهذا الرقم فوراً</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-8">
                  <div className="text-center space-y-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-7xl mb-4 inline-block transform hover:scale-110 transition-transform"
                    >
                      🎨
                    </motion.div>
                    <h2 className="text-3xl font-black">أضف هوية متجرك (اللوجو)</h2>
                    <p className="text-muted-foreground text-lg italic">اللمسة النهائية لمتجر يبدو كالمحترفين</p>
                  </div>

                  <div className="flex justify-center py-4">
                    <label htmlFor="logo" className="block cursor-pointer group relative">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-48 h-48 rounded-[3rem] border-4 border-dashed border-border/50 group-hover:border-primary transition-all duration-500 flex flex-col items-center justify-center bg-card/30 group-hover:bg-primary/5 overflow-hidden shadow-2xl relative backdrop-blur-sm"
                      >
                        {formData.logo ? (
                          <div className="relative w-full h-full p-4">
                            <img
                              src={URL.createObjectURL(formData.logo)}
                              alt="Logo"
                              className="w-full h-full object-cover rounded-[2.5rem]"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                              <span className="text-white text-sm font-black bg-primary px-5 py-2.5 rounded-2xl shadow-lg">تغيير الصورة</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center p-8 space-y-3">
                            <div className="w-16 h-16 mx-auto bg-muted/50 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <ImageIcon className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="text-sm text-muted-foreground font-black tracking-tight">اضغط لرفع اللوجو</div>
                            <div className="text-[10px] text-muted-foreground/60 uppercase font-bold">PNG, JPG, WEBP</div>
                          </div>
                        )}
                      </motion.div>
                      {formData.logo && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-3 -right-3 w-10 h-10 bg-brand-success text-white rounded-full flex items-center justify-center shadow-lg border-4 border-background"
                        >
                          <Check className="w-5 h-5" />
                        </motion.div>
                      )}
                    </label>
                  </div>

                  <div className="bg-muted/30 p-5 rounded-3xl border border-border/50">
                    <p className="text-sm text-center text-muted-foreground italic font-medium leading-relaxed">
                      💡 نصيحة: إذا لم يكن لديك لوجو الآن، لا داعي للقلق! اضغط على "أطلق متجري" وسنقوم بإنشاء متجرك فوراً، ويمكنك إضافة اللوجو في أي وقت لاحقاً.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Hidden inputs */}
        <input type="hidden" name="display_name" value={formData.display_name} />
        <input type="hidden" name="name" value={formData.name} />
        <input type="hidden" name="whatsapp_number" value={selectedCountry.code + formData.whatsapp_number} />

        {/* Navigation */}
        <div className="flex gap-5 pt-8">
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              className="flex-1 h-16 text-xl font-black rounded-2xl border-2 hover:bg-muted transition-all border-border/50 text-muted-foreground"
            >
              السابق
            </Button>
          )}

          {currentStep > 0 && (
            currentStep < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-[2] h-16 text-xl font-black rounded-3xl bg-primary hover:bg-primary/90 transition-all shadow-[0_10px_30px_rgba(0,209,201,0.3)] disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3"
              >
                الخطوة التالية
                <ArrowLeft className="h-6 w-6" />
              </Button>
            ) : (
              <SubmitButton
                pendingText="جاري إطلاق متجرك..."
                className="flex-[2] h-16 text-xl font-black rounded-3xl bg-gradient-to-r from-primary via-cyan-400 to-brand-luxury hover:opacity-90 transition-all shadow-[0_15px_40px_rgba(0,209,201,0.4)] active:scale-95 flex items-center justify-center gap-3"
              >
                أطلق متجري الآن!
                <Rocket className="h-6 w-6 animate-pulse" />
              </SubmitButton>
            )
          )}
        </div>
      </form>

      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) rotate(3deg); }
          50% { transform: translateY(-15px) rotate(-2deg); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}