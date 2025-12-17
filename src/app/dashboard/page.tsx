import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/dashboard/OnboardingForm";
import { CopyLinkButton } from "@/components/dashboard/CopyLinkButton";
import { QRCodeButton } from "@/components/dashboard/QRCodeButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { APP_URL } from "@/lib/constants";
import { Eye, Settings, Package, Tags, ArrowRight, Zap, Crown, Building } from "lucide-react";
import * as motion from "framer-motion/client";
import { Badge } from "@/components/ui/badge";

const getPlanDetails = (plan: string) => {
  switch (plan?.toLowerCase()) {
    case 'pro':
      return {
        label: 'الباقة الاحترافية',
        className: 'relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white shadow-lg shadow-orange-500/30 border-0',
        icon: Zap,
        glowColor: 'shadow-orange-400/50'
      };
    case 'business':
      return {
        label: 'باقة الأعمال',
        className: 'relative overflow-hidden bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 border-0',
        icon: Building,
        glowColor: 'shadow-purple-400/50'
      };
    case 'basic':
    default:
      return {
        label: 'الباقة الأساسية',
        className: 'relative overflow-hidden bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/30 border-0',
        icon: Package,
        glowColor: 'shadow-teal-400/50'
      };
  }
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Extract phone number from user email (format: phone@catalog.app)
  const userPhone = user.email?.replace('@catalog.app', '') || '';

  const { data: catalog } = await supabase
    .from("catalogs")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!catalog) {
    return (
      <div className="max-w-3xl mx-auto pt-8 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          {/* Background Decorative Element */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-luxury/10 rounded-full blur-[100px] pointer-events-none" />

          <Card className="glass-surface border-white/10 overflow-hidden shadow-2xl">
            <div className="p-1"> {/* Thin border container */}
              <div className="px-6 py-12 md:px-12">
                <OnboardingForm userPhone={userPhone} />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Get categories count
  const { count: categoriesCount } = await supabase
    .from("categories")
    .select("*", { count: 'exact', head: true })
    .eq("catalog_id", catalog.id);

  // Get items count
  const { count: itemsCount } = await supabase
    .from("menu_items")
    .select("*", { count: 'exact', head: true })
    .eq("catalog_id", catalog.id);

  const catalogUrl = process.env.NODE_ENV === 'production'
    ? `https://online-catalog.net/${catalog.name}`
    : `${APP_URL}/${catalog.name}`;

  // Always use production URL for QR code
  const qrCodeUrl = `https://online-catalog.net/${catalog.name}`;

  const planDetails = getPlanDetails(catalog.plan || 'basic');

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">لوحة التحكم</h1>
            <Badge className={`${planDetails.className} text-sm px-4 py-1.5 items-center gap-2 font-bold rounded-full`}>
              <planDetails.icon className="h-4 w-4" />
              <span>{planDetails.label}</span>
            </Badge>
          </div>
          <p className="text-muted-foreground">نظرة عامة على متجرك الإلكتروني</p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/dashboard/settings">
            <Settings className="h-4 w-4" />
            إعدادات المتجر
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
              <span className="text-xl">رابط المتجر الخاص بك</span>
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-brand-primary text-primary-foreground hover:bg-brand-primary/80">نشط</span>
            </CardTitle>
            <CardDescription>شارك هذا الرابط مع عملائك للوصول إلى متجرك.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-4 z-10 relative">
            <div className="flex-1 bg-background/50 p-3 rounded-lg border border-border/50 w-full font-mono text-sm flex items-center justify-between gap-2">
              <Link href={catalogUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors truncate">
                {catalogUrl}
              </Link>
              <QRCodeButton url={qrCodeUrl} storeName={catalog.name} />
            </div>
            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
              <Button variant="default" className="flex-1 sm:flex-none gap-2" asChild>
                <Link href={catalogUrl} target="_blank">
                  <Eye className="h-4 w-4" />
                  عرض المتجر
                </Link>
              </Button>
              <CopyLinkButton url={catalogUrl} />
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
          <Link href="/dashboard/categories" className="block h-full">
            <Card className="glass-surface-hover h-full flex flex-col cursor-pointer transition-all hover:scale-[1.02]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tags className="h-5 w-5 text-brand-accent" />
                  إدارة التصنيفات
                </CardTitle>
                <CardDescription>نظم متجرك عن طريق إضافة وتعديل التصنيفات.</CardDescription>
                <div className="mt-2 text-sm text-muted-foreground">
                  إجمالي التصنيفات: <span className="font-semibold text-foreground">{categoriesCount || 0}</span>
                </div>
              </CardHeader>
              <CardContent className="mt-auto pt-0">
                <div className="w-full group bg-cyan-500/25 hover:bg-cyan-500/40 border border-cyan-400/40 text-white rounded-md px-4 py-2 flex items-center justify-between">
                  الانتقال إلى التصنيفات
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link href="/dashboard/items" className="block h-full">
            <Card className="glass-surface-hover h-full flex flex-col cursor-pointer transition-all hover:scale-[1.02]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-brand-luxury" />
                  إدارة المنتجات
                </CardTitle>
                <CardDescription>أضف صوراً وأسعاراً ووصفاً لمنتجاتك المميزة.</CardDescription>
                <div className="mt-2 text-sm text-muted-foreground">
                  إجمالي المنتجات: <span className="font-semibold text-foreground">{itemsCount || 0}</span>
                </div>
              </CardHeader>
              <CardContent className="mt-auto pt-0">
                <div className="w-full group bg-cyan-500/25 hover:bg-cyan-500/40 border border-cyan-400/40 text-white rounded-md px-4 py-2 flex items-center justify-between">
                  الانتقال إلى المنتجات
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link href="/dashboard/settings" className="block h-full">
            <Card className="glass-surface-hover h-full flex flex-col cursor-pointer transition-all hover:scale-[1.02]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-brand-primary" />
                  إعدادات المتجر
                </CardTitle>
                <CardDescription>تخصيص مظهر المتجر والمعلومات الأساسية.</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-0">
                <div className="w-full group bg-cyan-500/25 hover:bg-cyan-500/40 border border-cyan-400/40 text-white rounded-md px-4 py-2 flex items-center justify-between">
                  الانتقال إلى الإعدادات
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
