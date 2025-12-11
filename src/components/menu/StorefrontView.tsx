/**
 * Luxe Glass 2025 Storefront
 */
"use client";

import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Catalog, CategoryWithSubcategories, MenuItem } from "@/lib/types";
import { ShareButtons } from "./ShareButtons";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
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
  Search,
  X,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { CartProvider } from '@/components/cart/CartContext'
import { useCart } from '@/components/cart/CartContext'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { CartButton } from '@/components/cart/CartButton'

type ViewMode = "masonry" | "grid" | "list" | "compact";

type LuxeCatalog = Catalog & {
  cover_url?: string | null;
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
};

function MenuItemCard({ item, catalogName, categoryName, viewMode, index }: MenuItemCardProps) {
  const href = `/${catalogName}/item/${item.id}`;
  const isCompact = viewMode === "compact";
  const isList = viewMode === "list";
  const lift = cardLiftSteps[index % cardLiftSteps.length];
  const newItem = isNewItem(item);
  const popular = isPopularItem(item);
  const { addItem, openCart } = useCart()

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
              <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
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
            <Plus className="h-3 w-3 opacity-60" />
            <ShoppingCart className="h-3 w-3" />
          </Button>
      </div>
    </motion.article>
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
          <span>أضف الكتالوج للشاشة الرئيسية</span>
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
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
      : `https://online-catalog.net/${catalog.name}`;


  
  // Apply search filtering first, then category filtering
  const searchFilteredCategories = useMemo(() => 
    filterCategoriesBySearch(categories, searchTerm), 
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
      <div className="relative h-40 bg-gradient-to-r from-[#ffb347] to-[#61ffd0] flex-shrink-0">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          <div className="glass-surface h-48 animate-pulse rounded-[2rem]" />
          <div className="glass-surface h-32 animate-pulse rounded-[2rem]" />
          <div className="glass-surface h-72 animate-pulse rounded-[2rem]" />
        </div>
      </div>
    );
  }

  return (
    <CartProvider storageKey={`oc_cart_${catalog.name}`}>
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,_rgba(0,209,201,0.25),transparent_60%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.18),transparent_62%)] bg-background pb-3">
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
                className="mx-auto max-w-2xl text-sm text-muted-foreground md:text-base"
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
                  className="rounded-full text-white/80 hover:text-white bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors"
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
          <div className="mx-auto w-full max-w-md px-2 mb-4">
            <motion.div 
              className="relative search-container"
              initial={false}
              animate={{
                width: isSearchExpanded || searchTerm ? '100%' : 'auto',
                transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
              }}
            >
              <AnimatePresence mode="wait">
                {!isSearchExpanded && !searchTerm ? (
                  // Collapsed search state - small and compact
                  <motion.button
                    key="collapsed-search"
                    initial={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => {
                      setIsSearchExpanded(true);
                    }}
                    className="absolute inset-0 flex items-center gap-2 w-full h-6 rounded-full bg-white/8 border border-white/15 backdrop-blur-sm hover:bg-white/12 transition-all duration-300 mx-auto px-3 z-10"
                    aria-label="بحث"
                  >
                    <Search className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
                    <span className="text-xs font-light text-muted-foreground/50 truncate">ابحث عن منتج معين</span>
                  </motion.button>
                ) : (
                  // Expanded search state
                  <motion.div 
                    key="expanded-search"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    onAnimationComplete={() => {
                      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                      input?.focus();
                    }}
                    className="relative w-full"
                  >
                    <motion.div 
                      className="absolute inset-0 rounded-full bg-white/8 border border-white/15 backdrop-blur-sm"
                      initial={false}
                      animate={{
                        backgroundColor: isSearchExpanded ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.08)',
                        borderColor: isSearchExpanded ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.15)',
                      }}
                      transition={{ duration: 0.2 }}
                    />
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
                    <Input
                      type="text"
                      placeholder="ابحث عن منتج..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setIsSearchExpanded(true)}
                      onBlur={() => {
                        setIsSearchExpanded(false);
                      }}
                      className="relative z-10 pl-10 pr-8 text-sm bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-10 w-full"
                      style={{ boxShadow: 'none' }}
                    />
                    {searchTerm && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => {
                          setSearchTerm("");
                          const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                          input?.focus();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-20"
                        aria-label="مسح البحث"
                      >
                        <X className="h-3.5 w-3.5" />
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            {searchTerm && (
              <div className="mt-2 text-sm text-muted-foreground text-center">
                تم العثور على {flattenMenuItems(displayedCategories).length} منتج لـ "{searchTerm}"
              </div>
            )}
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
                    : "bg-white/15 text-muted-foreground hover:bg-white/20"
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
                        : "bg-white/15 text-muted-foreground hover:bg-white/20"
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
                      selectedSubcategoryId === null ? "bg-brand-primary text-white" : "bg-white/15 text-muted-foreground hover:bg-white/20"
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
                        selectedSubcategoryId === sub.id ? "bg-brand-primary text-white" : "bg-white/15 text-muted-foreground hover:bg-white/20"
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

            {displayedCategories.map((category, categoryIndex) => {
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
                        viewMode === "masonry" && "masonry-columns",
                        viewMode === "grid" &&
                        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4",
                        (viewMode === "list" || viewMode === "compact") && "flex flex-col gap-3"
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
            })}
          </section>
        </main>

        {/* WhatsApp Floating Button */}
        {catalog.whatsapp_number && (
          <a
            href={`https://wa.me/${catalog.whatsapp_number.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
              `مرحباً، أود الاستفسار عن منتجاتكم من كتالوج ${catalog.name}`
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
      
      {/* Fixed Footer */}
      <Footer />
      
    </div>
    </CartProvider>
  );
}
