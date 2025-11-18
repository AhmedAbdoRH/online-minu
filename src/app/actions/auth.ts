"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect("/login?message=Could not authenticate user");
  }

  return redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const originHeader = headers().get("origin");
  const fallbackOrigin = "http://localhost:9002";
  const redirectTo = `${originHeader || fallbackOrigin}/auth/callback`;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  if (error) {
    console.error(error);
    return redirect("/signup?message=Could not authenticate user");
  }

  // A confirmation email is sent. For this demo, we'll redirect to a page that tells the user to check their email.
  // In a real app, you might want to handle this more gracefully.
  return redirect("/login?message=تم إرسال رابط التأكيد إلى بريدك الإلكتروني");
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect("/");
}
