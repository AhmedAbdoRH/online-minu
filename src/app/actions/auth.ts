"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const supabase = await createClient();

    console.log("Attempting login for:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error.message);
      return redirect(`/login?message=${encodeURIComponent("خطأ: " + error.message)}`);
    }

    console.log("Login successful, redirecting to dashboard. Session:", data.session ? "Created" : "No Session");
    return redirect("/dashboard");
  } catch (err: any) {
    console.error("Login exception:", err);
    return redirect(`/login?message=${encodeURIComponent("خطأ في الاتصال بالخادم")}`);
  }
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const originHeader = (await headers()).get("origin");
    const fallbackOrigin = process.env.NODE_ENV === 'production'
      ? "https://online-catalog.net"
      : "http://localhost:9003";
    const redirectTo = `${originHeader || fallbackOrigin}/auth/callback`;

    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      console.error("Signup error:", error.message);
      return redirect(`/signup?message=${encodeURIComponent("خطأ: " + error.message)}`);
    }

    return redirect(`/login?message=${encodeURIComponent("تم إرسال رابط التأكيد إلى بريدك الإلكتروني")}`);
  } catch (err: any) {
    console.error("Signup exception:", err);
    return redirect(`/signup?message=${encodeURIComponent("خطأ في الاتصال بالخادم")}`);
  }
}

export async function logout() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Logout error:", err);
  }
  return redirect("/");
}
