"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
    const loginMethod = formData.get("loginMethod") as string || "email";
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const countryCode = formData.get("countryCode") as string || "+20";
    const password = formData.get("password") as string;
    
    const supabase = await createClient();

    try {
        if (loginMethod === "phone") {
            // Phone login logic
            if (!phone || !password) {
                return redirect(`/login?message=${encodeURIComponent("رقم الهاتف وكلمة المرور مطلوبة")}`);
            }
            
            const fullPhone = countryCode + phone;
            const phoneEmail = `${fullPhone}@catalog.app`;
            
            console.log("Attempting phone login for:", fullPhone);
            const { data, error } = await supabase.auth.signInWithPassword({
                email: phoneEmail,
                password,
                options: {
                    data: {
                        phone: fullPhone,
                        login_method: 'phone'
                    }
                }
            });

            if (error) {
                console.error("Phone login error:", error.message);
                let errorMessage = "حدث خطأ أثناء تسجيل الدخول";
                if (error.message.includes("Invalid login credentials")) {
                    errorMessage = "رقم الهاتف أو كلمة المرور غير صحيحة";
                }
                return redirect(`/login?message=${encodeURIComponent("خطأ: " + errorMessage)}`);
            }

            // Update user metadata if needed
            if (data.user && !data.user.user_metadata?.phone) {
                await supabase.auth.updateUser({
                    data: {
                        phone: fullPhone,
                        login_method: 'phone'
                    }
                });
            }

        } else {
            // Email login logic (default)
            if (!email || !password) {
                return redirect(`/login?message=${encodeURIComponent("البريد الإلكتروني وكلمة المرور مطلوبة")}`);
            }
            
            console.log("Attempting email login for:", email);
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
                options: {
                    data: {
                        login_method: 'email'
                    }
                }
            });

            if (error) {
                console.error("Email login error:", error.message);
                let errorMessage = "حدث خطأ أثناء تسجيل الدخول";
                if (error.message.includes("Invalid login credentials")) {
                    errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
                }
                return redirect(`/login?message=${encodeURIComponent("خطأ: " + errorMessage)}`);
            }

            // Update user metadata if needed
            if (data.user && !data.user.user_metadata?.login_method) {
                await supabase.auth.updateUser({
                    data: {
                        login_method: 'email'
                    }
                });
            }
        }

        console.log("Login successful, redirecting to dashboard");
        return redirect("/dashboard");

    } catch (error) {
        console.error("Login error:", error);
        return redirect(`/login?message=${encodeURIComponent("حدث خطأ غير متوقع أثناء تسجيل الدخول")}`);
    }
}

export async function signup(formData: FormData) {
    const originHeader = (await headers()).get("origin");
    const fallbackOrigin = process.env.NODE_ENV === 'production'
        ? "https://online-catalog.net"
        : "http://localhost:9003";
    const redirectTo = `${originHeader || fallbackOrigin}/auth/callback`;
    
    const loginMethod = formData.get("loginMethod") as string || "email";
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const countryCode = formData.get("countryCode") as string || "+20";
    const password = formData.get("password") as string;
    
    const supabase = await createClient();

    try {
        if (loginMethod === "phone") {
            // Phone signup logic
            if (!phone || !password) {
                return redirect(`/signup?message=${encodeURIComponent("جميع الحقول مطلوبة")}`);
            }
            
            const fullPhone = countryCode + phone;
            
            if (!/^01[0-9]{9}$/.test(phone)) {
                return redirect(`/signup?message=${encodeURIComponent("رقم الهاتف غير صحيح")}`);
            }
            
            // Password validation
            if (password.length < 8) {
                return redirect(`/signup?message=${encodeURIComponent("كلمة المرور يجب أن تكون 8 أحرف على الأقل")}`);
            }
            
            if (!/(?=.*[a-z])/.test(password)) {
                return redirect(`/signup?message=${encodeURIComponent("كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل")}`);
            }
            
            if (!/(?=.*[A-Z])/.test(password)) {
                return redirect(`/signup?message=${encodeURIComponent("كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل")}`);
            }
            
            if (!/(?=.*\d)/.test(password)) {
                return redirect(`/signup?message=${encodeURIComponent("كلمة المرور يجب أن تحتوي على رقم واحد على الأقل")}`);
            }
            
            const phoneEmail = `${fullPhone}@catalog.app`;
            
            const { error } = await supabase.auth.signUp({
                email: phoneEmail,
                password,
                options: {
                    emailRedirectTo: redirectTo,
                    data: {
                        phone: fullPhone,
                        login_method: 'phone'
                    }
                },
            });

            if (error) {
                console.error("Phone signup error:", error.message);
                let errorMessage = "حدث خطأ أثناء إنشاء الحساب";
                if (error.message.includes("User already registered")) {
                    errorMessage = "رقم الهاتف مسجل بالفعل";
                }
                return redirect(`/signup?message=${encodeURIComponent("خطأ: " + errorMessage)}`);
            }

        } else {
            // Email signup logic (default)
            if (!email || !password) {
                return redirect(`/signup?message=${encodeURIComponent("جميع الحقول مطلوبة")}`);
            }
            
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return redirect(`/signup?message=${encodeURIComponent("البريد الإلكتروني غير صحيح")}`);
            }
            
            // Password validation
            if (password.length < 8) {
                return redirect(`/signup?message=${encodeURIComponent("كلمة المرور يجب أن تكون 8 أحرف على الأقل")}`);
            }
            
            if (!/(?=.*[a-z])/.test(password)) {
                return redirect(`/signup?message=${encodeURIComponent("كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل")}`);
            }
            
            if (!/(?=.*[A-Z])/.test(password)) {
                return redirect(`/signup?message=${encodeURIComponent("كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل")}`);
            }
            
            if (!/(?=.*\d)/.test(password)) {
                return redirect(`/signup?message=${encodeURIComponent("كلمة المرور يجب أن تحتوي على رقم واحد على الأقل")}`);
            }
            
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: redirectTo,
                    data: {
                        login_method: 'email'
                    }
                },
            });

            if (error) {
                console.error("Email signup error:", error.message);
                let errorMessage = "حدث خطأ أثناء إنشاء الحساب";
                if (error.message.includes("User already registered")) {
                    errorMessage = "البريد الإلكتروني مسجل بالفعل";
                }
                return redirect(`/signup?message=${encodeURIComponent("خطأ: " + errorMessage)}`);
            }
        }

        return redirect(`/login?message=${encodeURIComponent("تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول")}`);

    } catch (error) {
        console.error("Signup error:", error);
        return redirect(`/signup?message=${encodeURIComponent("حدث خطأ غير متوقع أثناء إنشاء الحساب")}`);
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
