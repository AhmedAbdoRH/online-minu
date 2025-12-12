'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { createCatalog } from '@/app/actions/catalog';
import { SubmitButton } from '@/components/common/SubmitButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

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

export function OnboardingForm({ userPhone }: OnboardingFormProps) {
  const [state, formAction] = useActionState(createCatalog, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [catalogName, setCatalogName] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    name: '',
    whatsapp_number: '',
    logo: null as File | null,
    cover: null as File | null,
  });
  const [selectedCountry, setSelectedCountry] = useState({
    code: '+20',
    name: 'مصر'
  });
  const [nameError, setNameError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (state?.message) {
      toast({
        title: 'خطأ في الإنشاء',
        description: state.message,
        variant: 'destructive'
      });
    }
  }, [state, toast]);

  useEffect(() => {
    if (!state?.message) {
      formRef.current?.reset();
      setCatalogName('');
    }
  }, [state]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitFormData = new FormData();
    
    // Add all form fields
    submitFormData.append('display_name', formData.display_name);
    submitFormData.append('name', formData.name);
    submitFormData.append('whatsapp_number', selectedCountry.code + formData.whatsapp_number);
    submitFormData.append('country_code', selectedCountry.code);
    
    // Add file objects if they exist
    if (formData.logo) {
      submitFormData.append('logo', formData.logo);
    }
    if (formData.cover) {
      submitFormData.append('cover', formData.cover);
    }
    
    formAction(submitFormData);
  };

  const handleFileChange = async (field: 'logo' | 'cover', file: File | null) => {
    if (file) {
      setIsUploading(true);
      // Simulate upload delay or add actual upload logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
      handleInputChange(field, file);
      setIsUploading(false);
    } else {
      handleInputChange(field, null);
    }
  };

  const handleInputChange = (field: string, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateCatalogName = (value: string) => {
    const cleanValue = value.toLowerCase();
    
    // Check for invalid characters
    if (!/^[a-z0-9-]*$/.test(cleanValue)) {
      setNameError('يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط');
      return false;
    }
    
    // Check minimum length
    if (cleanValue.length < 3) {
      setNameError('يجب أن يكون الاسم 3 أحرف على الأقل');
      return false;
    }
    
    // Check for consecutive dashes
    if (cleanValue.includes('--')) {
      setNameError('لا يمكن استخدام شرطتين متتالين');
      return false;
    }
    
    // Check for starting or ending with dash
    if (cleanValue.startsWith('-') || cleanValue.endsWith('-')) {
      setNameError('لا يمكن أن يبدأ أو ينتهي الاسم بشرطة');
      return false;
    }
    
    setNameError('');
    return true;
  };

  // Auto focus on first input when step changes
  useEffect(() => {
    const focusFirstInput = () => {
      let inputId = '';
      if (currentStep === 1) inputId = 'display_name';
      else if (currentStep === 2) inputId = 'whatsapp_number';
      
      if (inputId) {
        const input = document.getElementById(inputId) as HTMLInputElement;
        if (input) {
          setTimeout(() => input.focus(), 100);
        }
      }
    };
    focusFirstInput();
  }, [currentStep]);

  // Initial focus on component mount to show keyboard immediately
  useEffect(() => {
    const input = document.getElementById('display_name') as HTMLInputElement;
    if (input) {
      setTimeout(() => input.focus(), 300);
    }
  }, []);

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2 pb-3 border-b border-border/30">
              <Label htmlFor="display_name">اسم المتجر للعرض</Label>
              <Input
                id="display_name"
                name="display_name"
                placeholder="مثال: متجر الفتح"
                className="placeholder:text-muted-foreground/50 bg-white text-black h-12 sm:h-10"
                required
                minLength={3}
                maxLength={50}
                value={formData.display_name}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                autoFocus
              />
              <p className="text-xs text-muted-foreground/70">
                هذا هو الاسم الذي سيظهر للعملاء في صفحة الكتالوج
              </p>
            </div>

            <div className="space-y-2 pb-3 border-b border-border/30">
              <Label htmlFor="name">
                اسم الكتالوج للرابط
                <span className="font-light text-sm text-muted-foreground mr-2">(باللغة الإنجليزية)</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="my-store"
                className="placeholder:text-muted-foreground/50 bg-white text-black h-12 sm:h-10"
                required
                pattern="^[a-z0-9-]+$"
                title="يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط"
                minLength={3}
                value={formData.name}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase();
                  validateCatalogName(value);
                  handleInputChange('name', value);
                  setCatalogName(value);
                }}
              />
              {nameError && (
                <p className="text-xs text-red-500 mt-1">
                  {nameError}
                </p>
              )}
              <p className="text-xs text-muted-foreground/70">
                سيتم استخدام هذا الاسم في رابط الكتالوج الخاص بك
              </p>
              {catalogName && (
                <div className="mt-2 p-3 bg-brand-primary/10 border border-brand-primary/20 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">الرابط النهائي سيكون:</div>
                  <div className="font-mono text-sm font-bold text-brand-primary">
                    https://online-catalog.net/{catalogName}
                  </div>
                </div>
              )}
              {!catalogName && (
                <div className="mt-2 p-3 bg-muted/50 rounded-lg border border-border/30">
                  <div className="text-xs text-muted-foreground mb-1">مثال:</div>
                  <div className="font-mono text-sm text-muted-foreground">
                    https://online-catalog.net/my-store
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2 pb-3 border-b border-border/30">
              <Label htmlFor="whatsapp_number">رقم واتساب المتجر</Label>
              <div className="flex gap-2" dir="ltr">
                <select
                  value={selectedCountry.code}
                  onChange={(e) => {
                    const country = countries.find(c => c.code === e.target.value);
                    if (country) setSelectedCountry(country);
                  }}
                  className="bg-white text-[#1e3a5f] border border-border/30 rounded-md px-3 py-2 h-12 sm:h-10 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code} className="text-[#1e3a5f]">
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <Input
                  id="whatsapp_number"
                  name="whatsapp_number"
                  placeholder="500000000"
                  className="placeholder:text-muted-foreground/50 bg-white text-black h-12 sm:h-10 flex-1"
                  value={formData.whatsapp_number}
                  onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
                  required
                  type="tel"
                  pattern="[0-9]{7,15}"
                  title="يرجى إدخال رقم هاتف صحيح"
                />
              </div>
              <p className="text-xs text-muted-foreground/70">
                هذا الرقم سيستخدم لاستقبال طلبات العملاء عبر واتساب
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="logo" className="text-sm font-medium">
                لوجو / صورة المتجر
              </Label>
              <div className="flex items-center justify-center">
                <label 
                  htmlFor="logo" 
                  className="relative group cursor-pointer w-full"
                >
                  <div className="w-24 h-24 mx-auto rounded-full border-4 border-dashed border-border hover:border-brand-primary transition-all duration-200 flex flex-col items-center justify-center bg-muted/20 hover:bg-brand-primary/5 hover:shadow-lg hover:-translate-y-1">
                    {formData.logo ? (
                      <div className="relative w-full h-full rounded-full overflow-hidden">
                        <img 
                          src={URL.createObjectURL(formData.logo)} 
                          alt="Logo preview" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-full">
                          <div className="text-white text-xs text-center">
                            <div>تغيير</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-8 h-8 mx-auto mb-1 rounded-full bg-brand-primary/10 flex items-center justify-center">
                          <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <div className="font-medium">إضافة لوجو</div>
                          <div className="text-muted-foreground/70">صورة المتجر</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    id="logo"
                    name="logo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleInputChange('logo', e.target.files?.[0] || null)}
                    disabled={false}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cover" className="text-sm font-medium">
                صورة الغلاف
              </Label>
              <label 
                htmlFor="cover" 
                className="relative group cursor-pointer block"
              >
                <div className="w-full h-20 rounded-xl border-4 border-dashed border-border hover:border-brand-primary transition-all duration-200 flex flex-col items-center justify-center bg-muted/20 hover:bg-brand-primary/5 overflow-hidden hover:shadow-lg hover:-translate-y-1">
                  {formData.cover ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={URL.createObjectURL(formData.cover)} 
                        alt="Cover preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="text-xs font-medium">تغيير</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto mb-1 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <div className="font-medium">إضافة صورة</div>
                        <div className="text-muted-foreground/70">الغلاف</div>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  id="cover"
                  name="cover"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleInputChange('cover', e.target.files?.[0] || null)}
                  disabled={false}
                />
              </label>
            </div>
            
            {isUploading && (
              <div className="text-center py-2">
                <div className="inline-flex items-center gap-2 text-sm text-brand-primary">
                  <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                  جاري تحميل الصور...
                </div>
              </div>
            )}
            
            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground/60">
                هذه الخطوة اختيارية. يمكنك إضافة اللوجو والغلاف لاحقاً من الإعدادات
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {/* Step indicators */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            currentStep >= 1 ? 'bg-brand-primary text-white' : 'bg-muted text-muted-foreground'
          }`}>
            1
          </div>
          <div className={`h-1 w-16 ${
            currentStep >= 2 ? 'bg-brand-primary' : 'bg-muted'
          }`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            currentStep >= 2 ? 'bg-brand-primary text-white' : 'bg-muted text-muted-foreground'
          }`}>
            2
          </div>
          <div className={`h-1 w-16 ${
            currentStep >= 3 ? 'bg-brand-primary' : 'bg-muted'
          }`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            currentStep >= 3 ? 'bg-brand-primary text-white' : 'bg-muted text-muted-foreground'
          }`}>
            3
          </div>
        </div>
      </div>

      {renderStep()}

      {/* Hidden inputs to submit form data */}
      <input type="hidden" name="display_name" value={formData.display_name} />
      <input type="hidden" name="name" value={formData.name} />
      <input type="hidden" name="whatsapp_number" value={selectedCountry.code + formData.whatsapp_number} />

      {/* Navigation buttons */}
      <div className="flex justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className={currentStep === 1 ? 'invisible' : ''}
        >
          السابق
        </Button>

        {currentStep < 3 ? (
          <Button type="button" onClick={nextStep} className="w-full">
            التالي
          </Button>
        ) : (
          <SubmitButton 
            pendingText="جاري الإنشاء..." 
            className="w-full"
            disabled={false}
          >
            إنشاء كتالوجي
          </SubmitButton>
        )}
      </div>
    </form>
  );
}