"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
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
}

export async function signup(formData: FormData) {
  const originHeader = (await headers()).get("origin");
  const fallbackOrigin = "http://localhost:9002";
  const redirectTo = `${originHeader || fallbackOrigin}/auth/callback`;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  if (error) {
    console.error(error);
    return redirect("/signup?message=تعذر إنشاء الحساب. يرجى المحاولة مرة أخرى.");
  }

  // A confirmation email is sent. For this demo, we'll redirect to a page that tells the user to check their email.
  // In a real app, you might want to handle this more gracefully.
  return redirect("/login?message=تم إرسال رابط التأكيد إلى بريدك الإلكتروني");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/");
}
