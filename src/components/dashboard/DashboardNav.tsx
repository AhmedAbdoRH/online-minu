'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home,
  Package,
  Settings,
  Tags,
  LogOut,
  PanelLeft,
  MessageCircle,
  Zap,
  Package as PackageIcon,
  Building
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Catalog } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { logout } from '@/app/actions/auth';
import type { User } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'لوحة التحكم' },
  { href: '/dashboard/categories', icon: Tags, label: 'التصنيفات' },
  { href: '/dashboard/items', icon: PackageIcon, label: 'المنتجات' },
];

const getPlanDetails = (plan: string) => {
  switch (plan?.toLowerCase()) {
    case 'pro':
      return {
        label: 'الباقة الاحترافية',
        className: 'relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white shadow-lg border-0',
        icon: Zap,
      };
    case 'business':
      return {
        label: 'باقة الأعمال',
        className: 'relative overflow-hidden bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white shadow-lg border-0',
        icon: Building,
      };
    default:
      return {
        label: 'الباقة الأساسية',
        className: 'relative overflow-hidden bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-white shadow-lg border-0',
        icon: PackageIcon,
      };
  }
};

export function DashboardNav({ user, catalog }: { user: User; catalog: Catalog | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const closeSheet = () => setIsSheetOpen(false);

  const handleNavClick = (href: string) => {
    if (href !== pathname) {
      setIsLoading(true);
    }
    closeSheet();
  };

  // Reset loading when pathname changes
  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  return (
    <TooltipProvider>
      {/* Loading Bar */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted overflow-hidden">
          <div className="h-full bg-brand-primary animate-loading-bar" />
        </div>
      )}
      <aside className="fixed inset-y-0 right-0 z-10 hidden w-14 flex-col border-l bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="https://online-catalog.net"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-9 w-9 shrink-0 items-center justify-center"
          >
            <div className="relative h-9 w-9">
              <Image
                src="/logo.png"
                alt={APP_NAME}
                fill
                className="object-contain transition-all group-hover:scale-110"
              />
            </div>
            <span className="sr-only">{APP_NAME}</span>
          </Link>
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                    pathname === item.href ? "bg-accent text-accent-foreground" : ""
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="left" sideOffset={5}>{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <ThemeToggle />
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="https://wa.me/201008116452"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="sr-only">تواصل مع الدعم الفني</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="left">تواصل مع الدعم الفني</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/dashboard/settings"
                onClick={() => handleNavClick('/dashboard/settings')}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                  pathname === '/dashboard/settings' ? 'bg-accent text-accent-foreground' : ''
                )}
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">الإعدادات</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="left">الإعدادات</TooltipContent>
          </Tooltip>
          <form action={logout}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="submit" variant="ghost" size="icon" className="h-9 w-9 md:h-8 md:w-8 text-muted-foreground transition-colors hover:text-foreground">
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">تسجيل الخروج</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">تسجيل الخروج</TooltipContent>
            </Tooltip>
          </form>
        </nav>
      </aside>
      <header className="sticky top-0 z-30 flex h-auto min-h-14 items-center gap-4 border-b bg-background px-4 pt-10 pb-2 sm:pt-0 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:pr-20">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
              <PanelLeft className="h-5 w-5 transform scale-x-[-1]" />
              <span className="sr-only">فتح القائمة</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-xs pt-10">
            <div className="flex items-center justify-between mb-6">
              <Link
                href="https://online-catalog.net"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeSheet}
                className="group flex h-12 w-12 shrink-0 items-center justify-center"
              >
                <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-white/10 p-2 ring-1 ring-white/20">
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <span className="sr-only">{APP_NAME}</span>
              </Link>
              <ThemeToggle />
            </div>
            <nav className="grid gap-6 text-lg font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={cn("flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground", pathname === item.href ? "text-foreground" : "")}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
              <Link
                href="https://wa.me/201008116452"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeSheet}
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <MessageCircle className="h-5 w-5" />
                تواصل مع الدعم الفني
              </Link>
              <Link
                href="/dashboard/settings"
                onClick={() => handleNavClick('/dashboard/settings')}
                className={cn("flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground", pathname === '/dashboard/settings' ? "text-foreground" : "")}
              >
                <Settings className="h-5 w-5" />
                الإعدادات
              </Link>
              <form action={logout}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  onClick={closeSheet}
                >
                  <LogOut className="h-5 w-5" />
                  تسجيل الخروج
                </Button>
              </form>
            </nav>
          </SheetContent>
        </Sheet>

        {catalog && (
          <div className="flex items-center gap-3 flex-1 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 overflow-hidden">
              <h1 className="text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
                {pathname === '/dashboard' ? 'لوحة التحكم' :
                  pathname === '/dashboard/categories' ? 'التصنيفات' :
                    pathname === '/dashboard/items' ? 'المنتجات' :
                      pathname === '/dashboard/settings' ? 'إعدادات المتجر' : 'لوحة التحكم'}
              </h1>
              <Badge className={cn(getPlanDetails(catalog.plan || 'basic').className, "text-[9px] sm:text-xs px-1.5 sm:px-3 py-0 sm:py-0.5 items-center gap-1 font-bold rounded-full shrink-0 w-fit")}>
                {(() => {
                  const Details = getPlanDetails(catalog.plan || 'basic');
                  return (
                    <>
                      <Details.icon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span>{Details.label}</span>
                    </>
                  );
                })()}
              </Badge>
            </div>
            <p className="hidden md:block text-xs text-muted-foreground border-r pr-4 truncate">نظرة عامة على متجرك الإلكتروني</p>
          </div>
        )}
      </header>
    </TooltipProvider>
  );
}
