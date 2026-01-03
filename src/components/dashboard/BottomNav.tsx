"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Tags, Plus, X, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import * as motion from "framer-motion/client";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ItemForm } from "./ItemForm";
import { createClient } from "@/lib/supabase/client";
import type { Category, Catalog } from "@/lib/types";

const navItems = [
  {
    label: "التصنيفات",
    href: "/dashboard/categories",
    icon: Tags,
  },
  {
    label: "المنتجات",
    href: "/dashboard/items",
    icon: Package,
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: catalogData } = await supabase
      .from("catalogs")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (catalogData) {
      setCatalog(catalogData);
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .eq("catalog_id", catalogData.id);
      
      setCategories(categoriesData || []);
    }
  };

  useEffect(() => {
    if (isAddItemOpen) {
      fetchData();
    }
  }, [isAddItemOpen]);

  useEffect(() => {
    fetchData();

    // Show tooltip after 3 seconds
    const showTimer = setTimeout(() => {
      setShowTooltip(true);
    }, 3000);

    // Hide tooltip after another 4 seconds (total 7 seconds)
    const hideTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 7000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 150 }}
      className="fixed bottom-0 left-0 right-0 z-50 block sm:hidden"
    >
      <div className="relative flex h-24 w-full items-center justify-center border-t border-white/20 bg-gradient-to-b from-brand-primary to-brand-primary/90 px-4 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.9)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,179,0,0.05),_transparent)]" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-accent/40 to-transparent" />
        
        {/* Floating Home Button - Above the bar, centered, circular, neutral */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <Link href="/dashboard">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-[#0a0a0a]/40 backdrop-blur-xl shadow-2xl transition-all duration-300",
                pathname === "/dashboard" ? "ring-2 ring-brand-accent/50 scale-105 bg-brand-primary/40" : "hover:bg-white/5"
              )}
            >
              <Home className={cn("h-8 w-8", pathname === "/dashboard" ? "text-brand-accent" : "text-white/80")} />
            </motion.div>
          </Link>
          <span className="mt-1.5 text-[10px] font-bold text-white/40 tracking-widest uppercase">الرئيسية</span>
        </div>

        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <div key={item.href} className="flex items-center flex-1 h-full">
              <Link
                href={item.href}
                className="relative flex h-full w-full flex-col items-center justify-center pt-2 transition-all"
              >
                <div
                  className={cn(
                    "relative flex flex-col items-center justify-center transition-all duration-300 px-12 py-4 min-w-[140px]",
                    isActive
                      ? "scale-110"
                      : "opacity-70 hover:opacity-100"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-8 w-8 mb-2",
                      isActive ? "text-brand-accent" : "text-white"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[14px] font-extrabold tracking-wide transition-all duration-300",
                      isActive ? "text-brand-accent" : "text-white/90"
                    )}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute -bottom-1 h-[3px] w-24 rounded-full bg-brand-accent"
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    />
                  )}
                </div>
              </Link>
              
              {/* Vertical Separator - More prominent */}
              {index < navItems.length - 1 && (
                <div className="h-10 w-[1.5px] bg-gradient-to-b from-transparent via-brand-accent/30 to-transparent mx-4" />
              )}
            </div>
          );
        })}
      </div>
      <div className="fixed bottom-28 left-4 z-[60] block sm:hidden">
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20, x: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 10, x: -5 }}
              className="absolute bottom-20 left-0 whitespace-nowrap"
            >
              <div className="relative rounded-2xl bg-brand-primary px-4 py-2 text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(0,209,201,0.3)] ring-1 ring-white/20">
                أضف منتجاتك من هنا
                <div className="absolute -bottom-1.5 left-6 h-3 w-3 rotate-45 bg-brand-primary" />
                <button 
                  onClick={() => setShowTooltip(false)}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-lg ring-1 ring-white/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setIsAddItemOpen(true)} 
          aria-label="إضافة منتج جديد"
          disabled={!catalog}
        >
          <motion.div
            initial={{ y: 0 }}
            animate={{ 
              y: [0, -10, 0],
              scale: [1, 1.05, 1],
              rotate: [0, -2, 2, 0]
            }}
            transition={{ 
              y: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
              scale: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
              rotate: { repeat: Infinity, duration: 4, ease: "linear" }
            }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="relative"
          >
            <div className="absolute -inset-5 rounded-full bg-[conic-gradient(from_0deg,rgba(255,152,0,0.3)_0%,transparent_25%,rgba(255,152,0,0.2)_60%,transparent_100%)] blur-2xl opacity-70" />
            <motion.div 
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -inset-1 rounded-full bg-orange-400/20 blur-md" 
            />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#FFC107] via-[#FF9800] to-[#F57C00] text-white shadow-[0_15px_35px_rgba(255,152,0,0.4)] ring-1 ring-white/40">
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.4),_transparent_70%)] opacity-50" />
              <div className="absolute inset-0.5 rounded-full ring-1 ring-white/20" />
              <Plus className="relative h-10 w-10 stroke-[1.5px]" />
            </div>
          </motion.div>
        </button>
      </div>

      <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
        <DialogContent className="w-full h-[100dvh] sm:max-w-[500px] sm:h-auto sm:max-h-[90vh] top-1/2 sm:top-1/2 translate-y-[-50%] p-0 sm:p-6 overflow-y-auto rounded-none sm:rounded-lg border-none sm:border">
          <div className="p-6 pt-20 sm:pt-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-bold text-center sm:text-right">إضافة منتج جديد</DialogTitle>
            </DialogHeader>
            {catalog && (
              <ItemForm
                catalogId={catalog.id}
                catalogPlan={catalog.plan}
                categories={categories}
                onSuccess={() => setIsAddItemOpen(false)}
                onCancel={() => setIsAddItemOpen(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
