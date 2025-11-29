import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/dashboard/OnboardingForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { APP_URL } from "@/lib/constants";
import { Clipboard, Eye, Settings, Package, Tags, ArrowRight } from "lucide-react";
import * as motion from "framer-motion/client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: catalog, error } = await supabase
    .from("catalogs")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!catalog) {
    return (
      <div className="max-w-2xl mx-auto pt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-surface border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl text-brand-primary">مرحباً بك في قائمة طعامي!</CardTitle>
              <CardDescription className="text-lg">
                خطوتك الأولى هي إنشاء الكتالوج الخاص بك. الرجاء تعبئة المعلومات التالية للبدء.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OnboardingForm />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const catalogUrl = `${APP_URL}/c/${catalog.name}`;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-1">نظرة عامة على متجرك الإلكتروني</p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/dashboard/settings">
            <Settings className="h-4 w-4" />
            إعدادات الكتالوج
          </Link>
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-brand-primary/10 to-brand-luxury/5 border-brand-primary/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">رابط الكتالوج الخاص بك</span>
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-brand-primary text-primary-foreground hover:bg-brand-primary/80">نشط</span>
            </CardTitle>
            <CardDescription>شارك هذا الرابط مع عملائك للوصول إلى قائمتك.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-4 z-10 relative">
            <div className="flex-1 bg-background/50 p-3 rounded-lg border border-border/50 w-full font-mono text-sm truncate">
              <Link href={catalogUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors">
                {catalogUrl}
              </Link>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="default" className="flex-1 sm:flex-none gap-2" asChild>
                <Link href={catalogUrl} target="_blank">
                  <Eye className="h-4 w-4" />
                  عرض الكتالوج
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-surface-hover h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tags className="h-5 w-5 text-brand-accent" />
                إدارة الفئات
              </CardTitle>
              <CardDescription>نظم قائمتك عن طريق إضافة وتعديل الفئات.</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-0">
              <Button asChild className="w-full group" variant="ghost">
                <Link href="/dashboard/categories" className="justify-between">
                  الانتقال إلى الفئات
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-surface-hover h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-brand-luxury" />
                إدارة المنتجات
              </CardTitle>
              <CardDescription>أضف صوراً وأسعاراً ووصفاً لأطباقك المميزة.</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-0">
              <Button asChild className="w-full group" variant="ghost">
                <Link href="/dashboard/items" className="justify-between">
                  الانتقال إلى المنتجات
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
