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
  MessageCircle
} from 'lucide-react';
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
  { href: '/dashboard/items', icon: Package, label: 'المنتجات' },
];

export function DashboardNav({ user }: { user: User }) {
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
                src="/mainlogo.png"
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
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:pr-20">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
              <PanelLeft className="h-5 w-5 transform scale-x-[-1]" />
              <span className="sr-only">فتح القائمة</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-xs">
            <div className="flex items-center justify-between mb-6">
              <Link
                href="https://online-catalog.net"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeSheet}
                className="group flex h-12 w-12 shrink-0 items-center justify-center"
              >
                <div className="relative h-12 w-12">
                  <Image
                    src="/mainlogo.png"
                    alt={APP_NAME}
                    fill
                    className="object-contain transition-all group-hover:scale-110"
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
      </header>
    </TooltipProvider>
  );
}
