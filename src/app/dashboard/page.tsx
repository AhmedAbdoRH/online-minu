import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AutoCatalogCreator } from "@/components/dashboard/AutoCatalogCreator";
import { CopyLinkButton } from "@/components/dashboard/CopyLinkButton";
import { QRCodeButton } from "@/components/dashboard/QRCodeButton";
import { SettingsForm } from "@/components/dashboard/SettingsForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { APP_URL } from "@/lib/constants";
import { Eye, Settings, Package, Tags, ArrowRight, Zap, Crown, Building, PlusCircle, Palette } from "lucide-react";
import * as motion from "framer-motion/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
      <div className="w-full max-w-4xl mx-auto pt-0 md:pt-8 px-0 md:px-4 min-h-[100dvh] flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative flex-1 flex flex-col"
        >
          {/* Background Decorative Element */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none hidden md:block" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-luxury/10 rounded-full blur-[100px] pointer-events-none hidden md:block" />

          <Card className="glass-surface border-0 md:border border-white/10 overflow-hidden shadow-none md:shadow-2xl flex-1 flex flex-col bg-transparent md:bg-white/5">
            <div className="p-0 flex-1 flex flex-col"> 
              <div className="px-4 py-6 md:px-12 md:py-12 flex-1 flex flex-col">
                <AutoCatalogCreator
                  userPhone={userPhone}
                  userEmail={user.email || undefined}
                  userName={user.user_metadata?.full_name || user.user_metadata?.name}
                />
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

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-brand-primary/10 to-brand-luxury/5 border-brand-primary/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <CardHeader className="py-4 px-4 sm:py-5 sm:px-6">
            <CardTitle className="flex items-center gap-2">
              <span className="text-base sm:text-lg">المتجر الخاص بك نشط ✨</span>
            </CardTitle>
            <CardDescription className="hidden sm:block text-xs">شارك هذا الرابط مع عملائك للوصول إلى متجرك.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 z-10 relative py-4 px-4 sm:px-6 pt-0">
            <div className="flex-1 bg-background/50 p-2 sm:p-3 rounded-lg border border-border/50 w-full font-mono text-xs sm:text-sm flex items-center justify-between gap-2">
              <Link href={catalogUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors truncate">
                {catalogUrl}
              </Link>
              <QRCodeButton url={qrCodeUrl} storeName={catalog.name} />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="default" size="sm" className="flex-1 sm:flex-none gap-1.5 text-xs sm:text-sm bg-gradient-to-r from-[#006060] to-[#8B8000] hover:brightness-110 transition-all shadow-lg border-0 text-white font-bold" asChild>
                <Link href={catalogUrl} target="_blank">
                  <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  عرض المتجر
                </Link>
              </Button>
              <CopyLinkButton url={catalogUrl} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {/* Categories Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col"
        >
          <Link href="/dashboard/categories" className="block group">
            <Card className="glass-surface-hover flex flex-col cursor-pointer transition-all hover:scale-[1.01] rounded-b-none border-b-0">
              <CardHeader className="p-3 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-brand-accent/20 text-brand-accent">
                    <Tags className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                    {categoriesCount || 0} تصنيف
                  </span>
                </div>
                <CardTitle className="text-sm sm:text-lg mt-3">
                  أضف تصنيفاتك الآن
                </CardTitle>
                <CardDescription className="text-[10px] sm:text-xs line-clamp-1">
                  نظّم منتجاتك في مجموعات سهلة
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-5 pt-0">
                <div className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white rounded-lg px-3 py-2 flex items-center justify-center gap-2 text-[11px] sm:text-sm font-medium transition-all group-hover:shadow-lg group-hover:shadow-brand-accent/30">
                  <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>إضافة تصنيف جديد</span>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/categories" className="block group">
            <div className="glass-surface-hover border border-t-0 p-2 sm:p-3 rounded-b-xl flex items-center justify-between transition-all hover:bg-white/5">
              <span className="text-[10px] sm:text-xs font-medium text-muted-foreground group-hover:text-foreground">إدارة التصنيفات</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground group-hover:translate-x-[-2px] transition-all" />
            </div>
          </Link>
        </motion.div>

        {/* Products Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col"
        >
          <Link href="/dashboard/items" className="block group">
            <Card className="glass-surface-hover flex flex-col cursor-pointer transition-all hover:scale-[1.01] rounded-b-none border-b-0">
              <CardHeader className="p-3 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-brand-luxury/20 text-brand-luxury">
                    <Package className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                    {itemsCount || 0} منتج
                  </span>
                </div>
                <CardTitle className="text-sm sm:text-lg mt-3">
                  أضف منتجاتك الآن
                </CardTitle>
                <CardDescription className="text-[10px] sm:text-xs line-clamp-1">
                  أضف صوراً وأسعاراً لمنتجاتك
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-5 pt-0">
                <div className="w-full bg-brand-luxury hover:bg-brand-luxury/90 text-white rounded-lg px-3 py-2 flex items-center justify-center gap-2 text-[11px] sm:text-sm font-medium transition-all group-hover:shadow-lg group-hover:shadow-brand-luxury/30">
                  <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>إضافة منتج جديد</span>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/items" className="block group">
            <div className="glass-surface-hover border border-t-0 p-2 sm:p-3 rounded-b-xl flex items-center justify-between transition-all hover:bg-white/5">
              <span className="text-[10px] sm:text-xs font-medium text-muted-foreground group-hover:text-foreground">إدارة المنتجات</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground group-hover:translate-x-[-2px] transition-all" />
            </div>
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass-surface border-white/10 overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <SettingsForm catalog={catalog} />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
