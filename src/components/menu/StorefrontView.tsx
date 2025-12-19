/**
 * Luxe Glass 2025 Storefront
 */
"use client";

import { useEffect, useMemo, useState, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X as XIcon,
  ShoppingCart,
  Plus,
  Sparkles,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Menu as MenuIcon,
  LayoutGrid,
  LayoutList,
  Rows3,
  PanelTop,
  Home,
  Palette,
  Settings,
  Lock,
  Crown
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOnClickOutside } from '@/hooks/use-click-outside';
import { cn } from "@/lib/utils";
import { CartProvider } from '@/components/cart/CartContext';
import { useCart } from '@/components/cart/CartContext';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { CartButton } from '@/components/cart/CartButton';
import Image from 'next/image';
import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import type { Catalog, CategoryWithSubcategories, MenuItem } from '@/lib/types';

type ViewMode = "masonry" | "grid" | "list" | "compact";

type LuxeCatalog = Catalog & {
  cover_url?: string | null;
  description?: string | null;
  status?: string | null;
  is_open?: boolean | null;
  theme?: string | null;
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

function filterMenuItems(items: MenuItem[], searchTerm: string): MenuItem[] {
  if (!searchTerm.trim()) return items;

  const normalizedSearch = searchTerm.toLowerCase().trim();
  return items.filter(item =>
    item.name.toLowerCase().includes(normalizedSearch) ||
    (item.description && item.description.toLowerCase().includes(normalizedSearch))
  );
}

function filterCategoriesBySearch(categories: CategoryWithSubcategories[], searchTerm: string): CategoryWithSubcategories[] {
  if (!searchTerm.trim()) return categories;

  return categories.map(category => ({
    ...category,
    menu_items: filterMenuItems(category.menu_items, searchTerm),
    subcategories: category.subcategories.map(subcategory => ({
      ...subcategory,
      menu_items: filterMenuItems(subcategory.menu_items, searchTerm)
    }))
  })).filter(category =>
    category.menu_items.length > 0 ||
    category.subcategories.some(sub => sub.menu_items.length > 0)
  );
}

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
  return `${numeric.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} EGP`;
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
  theme?: string | null;
};

// Get card colors based on theme
const getCardColors = (theme?: string | null) => {
  switch (theme) {
    case 'gradient-1': return 'from-purple-900/40 to-purple-950/20'; // بنفسجي
    case 'gradient-2': return 'from-red-900/40 to-red-950/20'; // أحمر داكن
    case 'gradient-3': return 'from-orange-900/40 to-orange-950/20'; // برتقالي
    case 'gradient-4': return 'from-green-900/40 to-green-950/20'; // أخضر
    case 'gradient-5': return 'from-blue-900/40 to-blue-950/20'; // أزرق
    case 'gradient-6': return 'from-pink-900/40 to-pink-950/20'; // وردي
    case 'gradient-7': return 'from-amber-900/40 to-amber-950/20'; // ذهبي
    case 'gradient-8': return 'from-teal-900/40 to-teal-950/20'; // تركوازي
    case 'gradient-9': return 'from-gray-800/40 to-gray-900/20'; // رمادي
    default: return 'bg-muted/40'; // افتراضي
  }
};

function MenuItemCard({ item, catalogName, categoryName, viewMode, index, theme }: MenuItemCardProps) {
  const href = `/${catalogName}/item/${item.id}`;
  const isCompact = viewMode === "compact";
  const isList = viewMode === "list";
  const lift = cardLiftSteps[index % cardLiftSteps.length];
  const newItem = isNewItem(item);
  const popular = isPopularItem(item);
  const { addItem, openCart } = useCart()

  const cardColors = getCardColors(theme);
  const hasGradient = theme && theme !== 'default';

  const imageWrapperClasses = cn(
    "relative overflow-hidden rounded-[1.5rem]",
    hasGradient ? `bg-gradient-to-br ${cardColors}` : cardColors,
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
        </div>

        <div className={cn("flex flex-col gap-3", contentPadding)}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {categoryName ?? "منتج"}
            </p>
            <div className="flex items-center gap-2 text-[11px] font-semibold">
              {newItem && (
                <span className="inline-flex -rotate-2 items-center rounded-full bg-gradient-to-r from-[#ffb347] to-[#61ffd0] px-3 py-0.5 text-[10px] text-white shadow-lg">
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
              <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-foreground/80">
                {item.description}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[18px] font-black text-brand-primary">{formatPrice(item.price)}</p>
          </div>
        </div>
      </Link>

      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-y-4 right-4 w-9 rounded-full bg-brand-primary/20 blur-2xl" />
        <div className="absolute inset-y-4 left-4 w-9 rounded-full bg-brand-primary/10 blur-2xl" />
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4">
        <Button
          type="button"
          variant="ghost"
          size={isCompact ? 'sm' : 'default'}
          className="pointer-events-auto rounded-full text-white/80 hover:text-white bg-white/5 hover:bg-white/10 shadow-md transition-colors flex items-center justify-center gap-0.5 w-16 h-8"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const price = typeof item.price === 'number' ? item.price : Number(item.price || 0)
            addItem({ id: item.id, name: item.name, price: Number.isNaN(price) ? 0 : price }, 1)
          }}
          aria-label="أضف إلى العربة"
        >
          <Plus className="h-3.5 w-3.5 opacity-90" />
          <ShoppingCart className="h-3 w-3" />
        </Button>
      </div>
    </motion.article>
  );
}




export function StorefrontView({ catalog, categories }: StorefrontViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("masonry");
  const [mounted, setMounted] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(true);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle clicks outside the search container
  useOnClickOutside(searchContainerRef, () => {
    if (isSearchExpanded || searchTerm) {
      setIsSearchExpanded(false);
      searchInputRef.current?.blur();
      // On mobile, we want to close the keyboard when clicking outside
      if (window.innerWidth < 768) {
        document.activeElement instanceof HTMLElement && document.activeElement.blur();
      }
    }
  });
  const luxeCatalog = catalog as LuxeCatalog;

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

  }, []);

  const catalogUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://online-catalog.net/${catalog.name}`;

  // Apply search filtering first, then category filtering
  const searchFilteredCategories = useMemo(
    () => searchTerm ? filterCategoriesBySearch(categories, searchTerm) : categories,
    [categories, searchTerm]
  );

  const displayedCategories = selectedCategoryId
    ? searchFilteredCategories.filter((c) => c.id === selectedCategoryId)
    : searchFilteredCategories;

  const heroImage = luxeCatalog.cover_url ?? "https://placehold.co/1600x600/png?text=Menu+Cover";

  const catalogDescription = luxeCatalog.description ?? "";
  const catalogSlogan = luxeCatalog.slogan ?? "";
  const isCatalogClosed = luxeCatalog.is_open === false || luxeCatalog.status === "closed";

  if (!mounted) {
    return (
      <div className={cn("fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-gradient-default")}>
        {/* Decorative background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-luxury/10 rounded-full blur-[120px] animate-pulse-slow" />

        <div className="relative flex flex-col items-center gap-8 px-6 text-center">
          {/* Logo Container with Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: { duration: 0.8, ease: "easeOut" }
            }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-full bg-brand-primary/20 blur-2xl animate-pulse" />
            <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-white/20 bg-background/50 p-1.5 backdrop-blur-md shadow-2xl">
              {catalog.logo_url ? (
                <Image
                  src={catalog.logo_url}
                  alt={catalog.name}
                  width={112}
                  height={112}
                  className="h-full w-full rounded-full object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-white/10 to-white/5">
                  <Sparkles className="h-10 w-10 text-brand-primary opacity-50" />
                </div>
              )}
            </div>
          </motion.div>

          {/* Store Name & Loading Text */}
          <div className="space-y-3">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-2xl font-bold text-foreground md:text-3xl"
            >
              {catalog.display_name || catalog.name}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-sm font-medium tracking-widest text-muted-foreground uppercase"
            >
              جاري تحميل المتجر...
            </motion.p>
          </div>

          {/* Elegant Loading Bar */}
          <div className="relative mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
            <div className="absolute inset-y-0 bg-gradient-to-r from-brand-primary via-brand-luxury to-brand-primary animate-loading-bar shadow-[0_0_15px_rgba(0,209,201,0.5)]" />
          </div>

          {/* Slogan if available */}
          {catalog.slogan && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mt-4 max-w-xs text-xs italic text-muted-foreground/60"
            >
              "{catalog.slogan}"
            </motion.p>
          )}
        </div>
      </div>
    );
  }

  // Get theme class based on catalog theme
  const getThemeClass = () => {
    switch (luxeCatalog.theme) {
      case 'gradient-1': return 'bg-gradient-1';
      case 'gradient-2': return 'bg-gradient-2';
      case 'gradient-3': return 'bg-gradient-3';
      case 'gradient-4': return 'bg-gradient-4';
      case 'gradient-5': return 'bg-gradient-5';
      case 'gradient-6': return 'bg-gradient-6';
      case 'gradient-7': return 'bg-gradient-7';
      case 'gradient-8': return 'bg-gradient-8';
      case 'gradient-9': return 'bg-gradient-9';
      default: return 'bg-gradient-default';
    }
  };

  return (
    <CartProvider storageKey={`oc_cart_${catalog.name}`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={cn("relative flex flex-col min-h-screen pb-3", getThemeClass())}
      >
        <div className="relative mx-auto w-[min(92vw,1200px)] pt-2">
          {/* Hero Image Section */}
          {/* Hero Image Section */}
          <motion.section
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeOut" } }}
            className="relative mt-1 aspect-[16/6] w-full overflow-hidden rounded-[2.5rem] border border-white/15 shadow-[0_55px_120px_rgba(15,23,42,0.55)]"
          >
            {heroImage && (
              <div className="absolute inset-0 top-0 h-full w-full">
                <Image
                  src={heroImage}
                  alt="غلاف المتجر"
                  fill
                  className="object-cover object-center"
                  priority
                />
              </div>
            )}

            {isCatalogClosed && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/60 text-white backdrop-blur-md">
                <Lock className="h-12 w-12" />
                <p className="text-xl font-semibold">المتجر مغلق مؤقتًا</p>
              </div>
            )}


          </motion.section>

          {/* Logo and Title Section */}
          <div className="relative z-20 -mt-12 flex flex-col items-center px-4 text-center">
            {luxeCatalog.logo_url && (
              <motion.div
                initial={{ y: 30, opacity: 0, scale: 0.8 }}
                animate={{
                  y: 0,
                  opacity: 1,
                  scale: 1,
                  transition: {
                    delay: 0.3,
                    type: "spring",
                    stiffness: 200,
                    damping: 20
                  }
                }}
                className="h-24 w-24 overflow-hidden rounded-full border-4 border-background bg-background p-1 shadow-xl"
              >
                <Image
                  src={luxeCatalog.logo_url}
                  alt={catalog.name}
                  width={96}
                  height={96}
                  className="h-full w-full rounded-full object-cover"
                />
              </motion.div>
            )}

            <div className="mt-4 space-y-2">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{
                  y: 0,
                  opacity: 1,
                  transition: {
                    delay: 0.4,
                    duration: 0.6,
                    ease: "easeOut"
                  }
                }}
                className="font-heading text-3xl font-bold text-foreground drop-shadow-sm md:text-4xl lg:text-5xl"
              >
                {catalog.display_name || catalog.name}
              </motion.h1>

              {(catalogDescription || catalogSlogan) && (
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{
                    y: 0,
                    opacity: 1,
                    transition: {
                      delay: 0.5,
                      duration: 0.5
                    }
                  }}
                  className="mx-auto max-w-2xl text-sm text-foreground/80 md:text-base"
                >
                  {catalogSlogan || catalogDescription}
                </motion.p>
              )}

              {luxeCatalog.whatsapp_number && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{
                    y: 0,
                    opacity: 1,
                    transition: {
                      delay: 0.6,
                      duration: 0.5
                    }
                  }}
                  className="mt-4"
                >
                  <Button
                    asChild
                    variant="ghost"
                    className="rounded-full text-white hover:text-white bg-[#25D366]/20 hover:bg-[#25D366]/30 transition-colors"
                  >
                    <a
                      href={`https://wa.me/${luxeCatalog.whatsapp_number.replace(/[^\d]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="ml-2 h-5 w-5" />
                      تواصل معنا عبر واتساب
                    </a>
                  </Button>
                </motion.div>
              )}
            </div>
          </div>

          <main className="mx-auto mt-8 flex w-[min(94vw,1180px)] flex-col gap-0">
            {/* Search Section */}
            <div className="mx-auto w-full max-w-md px-1 mb-2 mt-2">
              <motion.div
                ref={searchContainerRef}
                className="relative w-full"
                initial={false}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative w-full">
                  <div className="absolute inset-0 rounded-full bg-white/10 border border-white/15"></div>
                  <Search className="absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground/60" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="ابحث..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsSearchExpanded(true)}
                    className="relative z-10 pr-8 pl-3 py-1.5 text-xs bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-8 w-full"
                    style={{ boxShadow: 'none' }}
                  />
                  {searchTerm && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchTerm("");
                        searchInputRef.current?.focus();
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-20"
                      aria-label="مسح البحث"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Category filter toolbar (pills style) */}
            <div className="mx-auto w-full mt-6">
              <div className="flex items-center gap-3 overflow-x-auto pb-3 px-2">
                <button
                  onClick={() => { setSelectedCategoryId(null); setSelectedSubcategoryId(null); }}
                  aria-pressed={!selectedCategoryId}
                  className={cn(
                    "flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all",
                    !selectedCategoryId
                      ? "bg-gradient-to-r from-[#ffb347] to-[#61ffd0] text-white shadow-lg scale-[1.02]"
                      : "bg-white/15 text-foreground/80 hover:bg-white/20 hover:text-foreground"
                  )}
                >
                  الكل
                </button>

                {categories.map((cat) => {
                  const catItemCount = flattenMenuItems([cat]).length;
                  if (catItemCount === 0) return null;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategoryId(cat.id); setSelectedSubcategoryId(null); }}
                      aria-pressed={selectedCategoryId === cat.id}
                      className={cn(
                        "flex items-center gap-2 flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all",
                        selectedCategoryId === cat.id
                          ? "bg-gradient-to-r from-[#ffb347] to-[#61ffd0] text-white shadow-lg scale-[1.02]"
                          : "bg-white/15 text-foreground/80 hover:bg-white/20 hover:text-foreground"
                      )}
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs opacity-70">({catItemCount})</span>
                    </button>
                  );
                })}
              </div>

              {/* Subcategory strip appears only when a main category is selected */}
              {selectedCategoryId && (() => {
                const main = categories.find((c) => c.id === selectedCategoryId);
                if (!main || !main.subcategories || main.subcategories.length === 0) return null;
                return (
                  <div className="mt-2 flex items-center gap-2 overflow-x-auto px-2">
                    <button
                      onClick={() => setSelectedSubcategoryId(null)}
                      className={cn(
                        "flex-shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition",
                        selectedSubcategoryId === null ? "bg-brand-primary text-white" : "bg-white/15 text-foreground/80 hover:bg-white/20 hover:text-foreground"
                      )}
                    >
                      الكل
                    </button>

                    {main.subcategories.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => setSelectedSubcategoryId(sub.id)}
                        className={cn(
                          "flex-shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition",
                          selectedSubcategoryId === sub.id ? "bg-brand-primary text-white" : "bg-white/15 text-foreground/80 hover:bg-white/20 hover:text-foreground"
                        )}
                      >
                        <span>{sub.name}</span>
                        <span className="ml-2 inline-flex items-center justify-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">{sub.menu_items.length}</span>
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
            <section className="space-y-6">
              {categories.length === 0 && (
                <div className="rounded-[2rem] border border-dashed border-white/25 bg-white/5 px-6 py-16 text-center text-sm text-muted-foreground">
                  سيتم عرض المنتجات هنا بمجرد إضافتها من لوحة التحكم.
                </div>
              )}

              {searchTerm ? (
                // Show search results when there's a search term
                <div className={cn(
                  viewMode === "masonry" && "masonry-columns space-y-4",
                  viewMode === "grid" && "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4",
                  (viewMode === "list" || viewMode === "compact") && "flex flex-col gap-4"
                )}>
                  {flattenMenuItems(searchFilteredCategories).length > 0 ? (
                    flattenMenuItems(searchFilteredCategories).map((item, index) => (
                      <MenuItemCard
                        key={`${item.id}-${index}`}
                        item={item}
                        catalogName={catalog.name}
                        viewMode={viewMode}
                        index={index % cardLiftSteps.length}
                        theme={luxeCatalog.theme}
                      />
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                      لا توجد نتائج للبحث
                    </div>
                  )}
                </div>
              ) : !selectedCategoryId ? (
                // Show all products in a single grid when no category is selected and no search
                <div className={cn(
                  viewMode === "masonry" && "masonry-columns space-y-4",
                  viewMode === "grid" && "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4",
                  (viewMode === "list" || viewMode === "compact") && "flex flex-col gap-4"
                )}>
                  {flattenMenuItems(categories).map((item, index) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      catalogName={catalog.name}
                      viewMode={viewMode}
                      index={index % cardLiftSteps.length}
                      theme={luxeCatalog.theme}
                    />
                  ))}
                </div>
              ) : (
                // Show products by category when a category is selected
                displayedCategories.map((category, categoryIndex) => {
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
                      {/* Main Category Header */}
                      <div className="space-y-4">
                        <div className="hidden flex-wrap items-center justify-between gap-3">
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

                        {/* Main Category Items */}
                        <div
                          className={cn(
                            viewMode === "masonry" && "masonry-columns space-y-4",
                            viewMode === "grid" &&
                            "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4",
                            (viewMode === "list" || viewMode === "compact") && "flex flex-col gap-4"
                          )}
                        >
                          {selectedSubcategoryId === null
                            ? category.menu_items.map((item, itemIndex) => (
                              <MenuItemCard
                                key={item.id}
                                item={item}
                                catalogName={catalog.name}
                                categoryName={category.name}
                                viewMode={viewMode}
                                index={itemIndex}
                              />
                            ))
                            : []}
                        </div>
                      </div>

                      {/* Subcategories Section (appears below main category) */}
                      {category.subcategories?.length > 0 && (
                        <div className="flex flex-col space-y-0 pt-4 border-t border-white/10">
                          {category.subcategories
                            .filter((s) => (selectedSubcategoryId ? s.id === selectedSubcategoryId : true))
                            .map((sub, subIndex) => {
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
                                  className="flex flex-col space-y-4 w-full"
                                >
                                  <div className="hidden items-center justify-between gap-3">
                                    <div>
                                      <h3 className="text-lg font-semibold text-foreground md:text-xl">
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
                })
              )}
            </section>
          </main>

          {/* WhatsApp Floating Button */}
          {catalog.whatsapp_number && (
            <a
              href={`https://wa.me/${catalog.whatsapp_number.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
                `مرحباً، أود الاستفسار عن منتجاتكم من متجر ${catalog.name}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-6 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_30px_60px_rgba(37,211,102,0.55)] transition-transform hover:-translate-y-1 md:bottom-6 hover:bg-[#25D366]"
              aria-label="تواصل مع البائع عبر واتساب"
            >
              <MessageCircle className="h-7 w-7" />
            </a>
          )}

          <CartDrawer catalog={catalog} />
          <CartButton />




        </div>

        {/* Bottom spacing */}
        <div className="h-16"></div>

        <Footer hideFooter={catalog.hide_footer || false} />
      </motion.div>
    </CartProvider>
  );
}
