'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState, Suspense } from 'react';
import { convertArabicNumerals } from '@/lib/utils';

function VerifyOtpContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const phone = searchParams.get('phone') || '';
    const type = searchParams.get('type') || 'sms';
    const initialMessage = searchParams.get('message');

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(initialMessage || '');

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const supabase = createClient();
        const verificationType = type === 'signup' ? 'phone_change' : 'sms';
        // Note: verifyOtp with 'sms' usually works for both signup/login if using phone auth.
        // If type was signup, it implies we are verifying the phone number.

        // Supabase verifyOtp type: 'sms', 'phone_change', 'recovery', 'signup', 'invite', 'magiclink', 'email_change'
        // For phone login/signup, 'sms' is typical.

        const { data, error } = await supabase.auth.verifyOtp({
            phone,
            token: otp,
            type: 'sms',
        });

        if (error) {
            console.error('OTP verification error:', error.message);
            setMessage('خطأ: رمز التحقق غير صحيح أو منتهي الصلاحية');
            setLoading(false);
        } else {
            // Success
            router.push('/dashboard');
        }
    };

    const isSignup = type === 'signup';

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle className="text-center">
                        {isSignup ? 'تأكيد رقم الهاتف' : 'التحقق من رمز OTP'}
                    </CardTitle>
                    <CardDescription className="text-center">
                        لقد أرسلنا رمز تحقق إلى رقم هاتفك {phone}. يرجى إدخال الرمز أدناه.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="grid gap-4" onSubmit={handleVerify}>
                        <div className="grid gap-2">
                            <Label htmlFor="otp">رمز التحقق (OTP)</Label>
                            <Input
                                id="otp"
                                name="otp"
                                type="tel"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                required
                                className="text-center text-lg tracking-widest"
                                maxLength={6}
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(convertArabicNumerals(e.target.value))}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'جاري التحقق...' : (isSignup ? 'تأكيد وإنشاء الحساب' : 'تحقق وتسجيل الدخول')}
                        </Button>
                        {message && (
                            <p className="mt-4 p-4 bg-destructive/15 text-destructive text-center rounded-md text-sm">
                                {message}
                            </p>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div>جاري التحميل...</div>}>
            <VerifyOtpContent />
        </Suspense>
    );
}