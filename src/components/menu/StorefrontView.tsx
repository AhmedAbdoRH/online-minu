/**
 * Luxe Glass 2025 Storefront
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import Image from "next/image";
import Link from "next/link";
import type { Catalog, CategoryWithSubcategories, MenuItem } from "@/lib/types";
import { ShareButtons } from "./ShareButtons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  LayoutList,
  Rows3,
  PanelTop,
  Home,
  Menu,
  Palette,
  Settings,
  MessageCircle,
  Lock,
  Sparkles,
  Crown,
} from "lucide-react";

type ViewMode = "masonry" | "grid" | "list" | "compact";

type LuxeCatalog = Catalog & {
  cover_image_url?: string | null;
  description?: string | null;
  status?: string | null;
  is_open?: boolean | null;
};

type LuxeCategory = CategoryWithSubcategories & {
  description?: string | null;
};

type StorefrontViewProps = {
  catalog: Catalog;
  categories: CategoryWithSubcategories[];
};

const NEW_ITEM_THRESHOLD_DAYS = 21;
const cardLiftSteps = [-8, -12, -16, -10];

function flattenMenuItems(categories: CategoryWithSubcategories[]): MenuItem[] {
  const items: MenuItem[] = [];
  const walk = (cats: CategoryWithSubcategories[]) => {
    for (const cat of cats) {
      if (cat.menu_items?.length) items.push(...cat.menu_items);
      if (cat.subcategories?.length) walk(cat.subcategories);
    }
  };
  walk(categories);
  return items;
}

function formatPrice(value: MenuItem["price"]) {
  if (value === null || value === undefined) return "—";
  const numeric = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numeric)) return `${value}`;
  return `${numeric.toLocaleString("ar-SA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ج.م`;
}

function isNewItem(item: MenuItem) {
  if (!item.created_at) return false;
  const created = new Date(item.created_at).getTime();
  if (Number.isNaN(created)) return false;
  const diffDays = (Date.now() - created) / (1000 * 60 * 60 * 24);
  return diffDays <= NEW_ITEM_THRESHOLD_DAYS;
}

function isPopularItem(item: MenuItem) {
  const inferredPopular =
    typeof (item as any).is_popular === "boolean"
      ? (item as any).is_popular
      : Number(item.price ?? 0) >= 45;
  return inferredPopular;
}

type MenuItemCardProps = {
  item: MenuItem;
  catalogName: string;
  categoryName?: string;
  viewMode: ViewMode;
  index: number;
};

function MenuItemCard({ item, catalogName, categoryName, viewMode, index }: MenuItemCardProps) {
  const href = `/c/${catalogName}/item/${item.id}`;
  const isCompact = viewMode === "compact";
  const isList = viewMode === "list";
  const lift = cardLiftSteps[index % cardLiftSteps.length];
  const newItem = isNewItem(item);
  const popular = isPopularItem(item);

  const imageWrapperClasses = cn(
    "relative overflow-hidden rounded-[1.5rem] bg-muted/40",
    isList
      ? "w-36 shrink-0 aspect-[4/5]"
      : isCompact
        ? "w-24 shrink-0 aspect-[3/4]"
        : "w-full aspect-[4/5]"
  );

  const contentPadding = isList || isCompact ? "py-4 pr-3" : "pt-5 px-5 pb-6";

  return (
    <motion.article
      whileHover={{ y: lift }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className={cn(
        "group relative overflow-hidden rounded-[1.8rem] border border-white/15 bg-white/10 p-3 text-right shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-[20px] dark:bg-slate-950/30",
        isList || isCompact ? "flex gap-4" : "flex flex-col gap-4"
      )}
    >
      <Link href={href} className={cn("flex flex-col gap-4", isList || isCompact ? "flex-1" : "")}>
        <div className={imageWrapperClasses}>
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover transition-transform duration-[700ms] group-hover:scale-[1.12]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/60 px-3 py-1 text-[11px] text-foreground">
                <Sparkles className="h-3 w-3" />
                صورة المنتج قريبًا
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-transparent opacity-80" />
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute inset-0 rounded-[1.5rem] shadow-[inset_0_0_45px_rgba(255,255,255,0.18)]" />
          </div>
          <div className="pointer-events-none absolute bottom-3 left-4 rounded-full bg-black/70 px-3 py-1 text-[12px] font-semibold text-white">
            {formatPrice(item.price)}
          </div>
        </div>

        <div className={cn("flex flex-col gap-3", contentPadding)}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {categoryName ?? "منتج"}
            </p>
            <div className="flex items-center gap-2 text-[11px] font-semibold">
              {newItem && (
                <span className="inline-flex -rotate-2 items-center rounded-full bg-gradient-to-r from-brand-primary to-brand-accent px-3 py-0.5 text-[10px] text-white shadow-lg">
                  جديد
                </span>
              )}
              {(item as any).is_featured && (
                <span className="inline-flex items-center gap-1 rounded-full border border-brand-luxury/50 bg-brand-luxury/10 px-3 py-0.5 text-[10px] text-brand-luxury">
                  مميز
                </span>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground md:text-xl">{item.name}</h3>
            {item.description && (
              <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[18px] font-black text-brand-primary">{formatPrice(item.price)}</p>
            {popular && (
              <span className="inline-flex items-center gap-1 rounded-full border border-brand-primary/40 bg-brand-primary/10 px-2.5 py-1 text-[11px] font-semibold text-brand-primary">
                <Crown className="h-3.5 w-3.5" />
                الأكثر طلبًا
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-y-4 right-4 w-9 rounded-full bg-brand-primary/20 blur-2xl" />
        <div className="absolute inset-y-4 left-4 w-9 rounded-full bg-brand-primary/10 blur-2xl" />
      </div>
    </motion.article>
  );
}

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-gradient-to-t from-background/95 via-background/90 to-transparent backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between px-6 py-3 text-[11px] font-medium text-muted-foreground">
        <button className="flex flex-col items-center gap-1 text-brand-primary">
          <Home className="h-5 w-5" />
          <span>الرئيسية</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Menu className="h-5 w-5" />
          <span>التصنيفات</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Palette className="h-5 w-5" />
          <span>المظهر</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Settings className="h-5 w-5" />
          <span>الإعدادات</span>
        </button>
      </div>
    </nav>
  );
}

function AddToHomeCTA({ show, onDismiss }: { show: boolean; onDismiss: () => void }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0, transition: { type: "spring", stiffness: 220 } }}
          exit={{ opacity: 0, y: 50 }}
          onClick={onDismiss}
          className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-[min(90%,400px)] items-center justify-between rounded-full bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-[0_30px_65px_rgba(0,209,201,0.45)]"
        >
          <span>أضف المنيو للشاشة الرئيسية</span>
          <span className="text-xs opacity-80">تم</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export function StorefrontView({ catalog, categories }: StorefrontViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("masonry");
  const [showInstallHint, setShowInstallHint] = useState(false);
  const [mounted, setMounted] = useState(false);
  const luxeCatalog = catalog as LuxeCatalog;

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    const alreadyShown = window.localStorage.getItem("om-pwa-install-hint");
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;
    if (!alreadyShown && !isStandalone) {
      const timer = setTimeout(() => {
        setShowInstallHint(true);
        window.localStorage.setItem("om-pwa-install-hint", "1");
      }, 2600);
      return () => clearTimeout(timer);
    }
  }, []);

  const catalogUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://online-menu.app/c/${catalog.name}`;

  const allItems = useMemo(() => flattenMenuItems(categories), [categories]);
  const heroImage =
    luxeCatalog.cover_image_url ??
    allItems.find((item) => Boolean(item.image_url))?.image_url ??
    "/public/placeholder.svg";

  const catalogDescription = luxeCatalog.description ?? "";
  const isCatalogClosed = luxeCatalog.is_open === false || luxeCatalog.status === "closed";

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background p-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          <div className="glass-surface h-48 animate-pulse rounded-[2rem]" />
          <div className="glass-surface h-32 animate-pulse rounded-[2rem]" />
          <div className="glass-surface h-72 animate-pulse rounded-[2rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,_rgba(0,209,201,0.25),transparent_60%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.18),transparent_62%)] bg-background pb-32">
      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeOut" } }}
        className="relative mx-auto mt-6 aspect-[16/8] w-[min(92vw,1200px)] overflow-hidden rounded-[2.5rem] border border-white/15 shadow-[0_55px_120px_rgba(15,23,42,0.55)]"
      >
        {heroImage && (
          <Image src={heroImage} alt="غلاف المتجر" fill className="object-cover" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/75" />
        {isCatalogClosed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/40 text-white backdrop-blur-md">
            <Lock className="h-8 w-8" />
            <p className="text-lg font-semibold">المتجر مغلق مؤقتًا</p>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 px-10 pb-10">
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { delay: 0.15, type: "spring", stiffness: 180 } }}
            className="inline-flex items-center gap-3 rounded-full bg-white/15 px-4 py-2 text-[12px] uppercase tracking-[0.4em] text-white backdrop-blur"
          >

          </motion.div>
          <motion.h1
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)", transition: { delay: 0.25, duration: 0.9, ease: "easeOut" } }}
            className="font-headline text-4xl font-extrabold text-white md:text-5xl"
          >
            {catalog.name}
          </motion.h1>
          {catalogDescription && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.35 } }}
              className="max-w-2xl text-sm text-white/80 md:text-base"
            >
              {catalogDescription}
            </motion.p>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.4, type: "spring" } }}
          className="absolute top-10 left-10 hidden rounded-full bg-white/15 px-4 py-2 text-xs font-medium text-white backdrop-blur lg:flex"
        >
          +{allItems.length} منتج فاخر
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0, transition: { delay: 0.5, type: "spring", stiffness: 140 } }}
          className="pointer-events-auto absolute -right-10 top-10 hidden rotate-[-8deg] rounded-[1.5rem] border border-white/40 bg-white/80 p-3 shadow-[0_35px_80px_rgba(15,23,42,0.55)] backdrop-blur-xl md:flex"
        >
          <QRCodeCanvas value={catalogUrl} size={120} bgColor="transparent" fgColor="#0F172A" />
        </motion.div>
      </motion.section>

      <main className="mx-auto -mt-32 flex w-[min(94vw,1180px)] flex-col gap-8">
        <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-[0_30px_70px_rgba(15,23,42,0.45)] backdrop-blur-[18px] dark:bg-slate-950/40 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center rounded-full bg-brand-primary/15 px-3 py-1 text-[11px] font-medium text-brand-primary">
                المنيو العامة
              </span>
              <span>اختر طريقة العرض المفضلة لديك</span>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-white/10 p-1 text-[11px] text-muted-foreground shadow-inner backdrop-blur">
              {(["masonry", "grid", "list", "compact"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-3 py-1 transition",
                    viewMode === mode
                      ? "bg-brand-primary text-white shadow-[0_10px_25px_rgba(0,209,201,0.45)]"
                      : "hover:text-foreground"
                  )}
                >
                  {mode === "masonry" && <Rows3 className="ml-1 h-3.5 w-3.5" />}
                  {mode === "grid" && <LayoutGrid className="ml-1 h-3.5 w-3.5" />}
                  {mode === "list" && <LayoutList className="ml-1 h-3.5 w-3.5" />}
                  {mode === "compact" && <LayoutGrid className="ml-1 h-3.5 w-3.5" />}
                  <span className="capitalize">{mode}</span>
                </button>
              ))}
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <Button size="sm" className="rounded-full bg-brand-primary px-4 text-[13px] shadow-[0_20px_40px_rgba(0,209,201,0.45)]">
                <Rows3 className="ml-2 h-4 w-4" />
                عرض الكتالوج
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full border-white/30 bg-white/60 text-[13px] shadow-sm backdrop-blur"
              >
                <PanelTop className="ml-2 h-4 w-4" />
                تثبيت كتطبيق
              </Button>
            </div>
          </div>
        </div>

        <section className="space-y-10">
          {categories.length === 0 && (
            <div className="rounded-[2rem] border border-dashed border-white/25 bg-white/5 px-6 py-16 text-center text-sm text-muted-foreground">
              سيتم عرض المنتجات هنا بمجرد إضافتها من لوحة التحكم.
            </div>
          )}

          {categories.map((category, categoryIndex) => {
            const luxeCategory = category as LuxeCategory;
            const categoryDescription = luxeCategory.description ?? "";
            return (
              <motion.section
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.08 }}
                className="space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-headline text-2xl font-bold text-foreground md:text-3xl">
                      {category.name}
                    </h2>
                    {categoryDescription && (
                      <p className="text-sm text-muted-foreground">{categoryDescription}</p>
                    )}
                  </div>
                  <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[11px] text-muted-foreground">
                    {category.menu_items.length} منتج
                  </div>
                </div>

                <div
                  className={cn(
                    viewMode === "masonry" && "masonry-columns",
                    viewMode === "grid" &&
                    "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4",
                    (viewMode === "list" || viewMode === "compact") && "flex flex-col gap-3"
                  )}
                >
                  {category.menu_items.map((item, itemIndex) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      catalogName={catalog.name}
                      categoryName={category.name}
                      viewMode={viewMode}
                      index={itemIndex}
                    />
                  ))}
                </div>

                {category.subcategories?.length > 0 && (
                  <div className="space-y-6 border-r border-dashed border-brand-primary/20 pr-4">
                    {category.subcategories.map((sub, subIndex) => {
                      const luxeSub = sub as LuxeCategory;
                      const subDescription = luxeSub.description ?? "";
                      return (
                        <motion.div
                          key={sub.id}
                          initial={{ opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.35,
                            delay: 0.12 + subIndex * 0.08,
                            ease: [0.22, 0.61, 0.36, 1],
                          }}
                          className="space-y-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h3 className="text-sm font-semibold text-foreground md:text-base">
                                {sub.name}
                              </h3>
                              {subDescription && (
                                <p className="text-xs text-muted-foreground">{subDescription}</p>
                              )}
                            </div>
                            <span className="rounded-full bg-muted px-3 py-1 text-[10px] text-muted-foreground">
                              {sub.menu_items.length} منتج
                            </span>
                          </div>
                          <div
                            className={cn(
                              viewMode === "masonry" && "masonry-columns",
                              viewMode === "grid" &&
                              "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4",
                              (viewMode === "list" || viewMode === "compact") && "flex flex-col gap-3"
                            )}
                          >
                            {sub.menu_items.map((item, itemIndex) => (
                              <MenuItemCard
                                key={item.id}
                                item={item}
                                catalogName={catalog.name}
                                categoryName={sub.name}
                                viewMode={viewMode}
                                index={itemIndex}
                              />
                            ))}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.section>
            );
          })}
        </section>
      </main>

      <a
        href={`https://wa.me/?text=${encodeURIComponent(
          `تفضل قائمة طعام ${catalog.name}: ${catalogUrl}`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 left-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_30px_60px_rgba(37,211,102,0.55)] transition-transform hover:-translate-y-1 md:bottom-14"
        aria-label="مشاركة المنيو عبر واتساب"
      >
        <MessageCircle className="h-6 w-6" />
      </a>

      <AddToHomeCTA show={showInstallHint} onDismiss={() => setShowInstallHint(false)} />
      <BottomNav />
    </div >
  );
}

