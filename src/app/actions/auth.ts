"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signInWithGoogle() {
    const supabase = await createClient();
    const origin = (await headers()).get("origin") || "http://localhost:9004";

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/callback`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            }
        }
    });

    if (error) {
        console.error("Google sign in error:", error.message);
        redirect(`/login?message=${encodeURIComponent("حدث خطأ أثناء تسجيل الدخول بجوجل")}`);
    }

    if (data.url) {
        redirect(data.url);
    }
}

export async function login(formData: FormData) {
    // Redirect to Google OAuth
    await signInWithGoogle();
}

export async function signup(formData: FormData) {
    // Redirect to Google OAuth (same as login for OAuth)
    await signInWithGoogle();
}

export async function signUpWithEmail(email: string, password: string) {
    // Basic validation
    if (!email || !password) {
        return { error: "البريد الإلكتروني وكلمة المرور مطلوبان" };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { error: "البريد الإلكتروني غير صحيح" };
    }

    if (password.length < 6) {
        return { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" };
    }

    const supabase = await createClient();

    try {
        console.log("Attempting email signup for:", email);
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${(await headers()).get("origin") || "http://localhost:9004"}/auth/callback`
            }
        });

        if (error) {
            console.error("Email signup error:", error.message);
            let errorMessage = "حدث خطأ أثناء إنشاء الحساب";
            if (error.message.includes("User already registered")) {
                errorMessage = "هذا البريد الإلكتروني مسجل بالفعل";
            } else if (error.message.includes("Invalid email")) {
                errorMessage = "البريد الإلكتروني غير صحيح";
            } else if (error.message.includes("Password should be")) {
                errorMessage = "كلمة المرور ضعيفة جدًا";
            }
            return { error: errorMessage };
        }

        console.log("Email signup successful");
        if (data.user && !data.session) {
            // User created but email confirmation required
            return { success: true, message: "تم إرسال رابط التأكيد إلى بريدك الإلكتروني" };
        }

        // Auto sign in if no email confirmation needed
        return { success: true };

    } catch (error) {
        console.error("Email signup error:", error);
        return { error: "حدث خطأ غير متوقع أثناء إنشاء الحساب" };
    }
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect("/");
}

export async function resetPassword(formData: FormData) {
    const email = formData.get("email") as string;

    // Basic validation
    if (!email) {
        return redirect(`/forgot-password?message=${encodeURIComponent("البريد الإلكتروني مطلوب")}`);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return redirect(`/forgot-password?message=${encodeURIComponent("البريد الإلكتروني غير صحيح")}`);
    }

    const supabase = await createClient();

    try {
        // Get the origin for the redirect URL
        const originHeader = (await headers()).get("origin");
        const fallbackOrigin = process.env.NODE_ENV === 'production'
            ? "https://online-catalog.net"
            : "http://localhost:9003";
        const redirectTo = `${originHeader || fallbackOrigin}/reset-password`;

        console.log("Attempting password reset for:", email);
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectTo
        });

        if (error) {
            console.error("Password reset error:", error.message);
            let errorMessage = "حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور";
            if (error.message.includes("Unable to validate email address")) {
                errorMessage = "البريد الإلكتروني غير صحيح";
            }
            return redirect(`/forgot-password?message=${encodeURIComponent("خطأ: " + errorMessage)}`);
        }

        console.log("Password reset email sent successfully");
        return redirect(`/forgot-password?message=${encodeURIComponent("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني")}`);

    } catch (error) {
        console.error("Password reset error:", error);
        return redirect(`/forgot-password?message=${encodeURIComponent("حدث خطأ غير متوقع أثناء إرسال رابط إعادة تعيين كلمة المرور")}`);
    }
}

export async function updatePassword(formData: FormData) {
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const token = formData.get("token") as string;

    // Basic validation
    if (!password || !confirmPassword || !token) {
        return { error: "جميع الحقول مطلوبة" };
    }

    if (password !== confirmPassword) {
        return { error: "كلمة المرور وتأكيد كلمة المرور لا يتطابقان" };
    }

    // Password validation
    if (password.length < 8) {
        return { error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" };
    }

    if (!/(?=.*[a-z])/.test(password)) {
        return { error: "كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل" };
    }

    if (!/(?=.*[A-Z])/.test(password)) {
        return { error: "كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل" };
    }

    if (!/(?=.*\d)/.test(password)) {
        return { error: "كلمة المرور يجب أن تحتوي على رقم واحد على الأقل" };
    }

    const supabase = await createClient();

    try {
        // Set the auth session using the token
        const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
            type: 'recovery',
            token_hash: token
        });

        if (sessionError) {
            console.error("Session verification error:", sessionError.message);
            return redirect(`/reset-password?message=${encodeURIComponent("خطأ: رابط إعادة تعيين كلمة المرور غير صحيح أو منتهي الصلاحية")}`);
        }

        // Update the user's password
        const { error: updateError } = await supabase.auth.updateUser({
            password: password
        });

        if (updateError) {
            console.error("Password update error:", updateError.message);
            return redirect(`/reset-password?message=${encodeURIComponent("خطأ: حدث خطأ أثناء تحديث كلمة المرور")}`);
        }

        console.log("Password updated successfully");
        return redirect(`/login?message=${encodeURIComponent("تم تحديث كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول")}`);

    } catch (error) {
        console.error("Password update error:", error);
        return redirect(`/reset-password?message=${encodeURIComponent("خطأ: حدث خطأ غير متوقع أثناء تحديث كلمة المرور")}`);
    }
}
