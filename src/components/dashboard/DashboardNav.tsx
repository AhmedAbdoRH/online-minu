
'use client';
import Link from 'next/link';
import {
  Home,
  Package,
  Settings,
  UtensilsCrossed,
  Tags,
  LogOut,
  PanelLeft
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
  { href: '/dashboard/categories', icon: Tags, label: 'الفئات' },
  { href: '/dashboard/items', icon: Package, label: 'المنتجات' },
];

export function DashboardNav({ user }: { user: User }) {
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <aside className="fixed inset-y-0 right-0 z-10 hidden w-14 flex-col border-l bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="#"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <UtensilsCrossed className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">{APP_NAME}</span>
          </Link>
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link href={item.href} className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                  pathname === item.href ? "bg-accent text-accent-foreground" : ""
                )} onClick={() => {
                  // Close mobile sheet if open
                  const sheetTrigger = document.querySelector('[data-state="open"] button') as HTMLButtonElement;
                  if (sheetTrigger) {
                    sheetTrigger.click();
                  }
                }}>
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
                href="/dashboard/settings"
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                  pathname === '/dashboard/settings' ? 'bg-accent text-accent-foreground' : ''
                )}
                onClick={() => {
                  // Close mobile sheet if open
                  const sheetTrigger = document.querySelector('[data-state="open"] button') as HTMLButtonElement;
                  if (sheetTrigger) {
                    sheetTrigger.click();
                  }
                }}
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
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">فتح القائمة</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-xs">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="/dashboard"
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
              >
                <UtensilsCrossed className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">{APP_NAME}</span>
              </Link>
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className={cn("flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground", pathname === item.href ? "text-foreground" : "")} onClick={() => {
                  // Close mobile sheet
                  const sheetContent = document.querySelector('[data-state="open"][role="dialog"]') as HTMLElement;
                  const closeButton = sheetContent?.querySelector('button[data-state="open"]') as HTMLButtonElement;
                  if (closeButton) {
                    closeButton.click();
                  }
                }}>
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
              <div className="px-2.5">
                <ThemeToggle />
              </div>
              <Link
                href="/dashboard/settings"
                className={cn("flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground", pathname === '/dashboard/settings' ? "text-foreground" : "")}
                onClick={() => {
                  // Close mobile sheet
                  const sheetContent = document.querySelector('[data-state="open"][role="dialog"]') as HTMLElement;
                  const closeButton = sheetContent?.querySelector('button[data-state="open"]') as HTMLButtonElement;
                  if (closeButton) {
                    closeButton.click();
                  }
                }}
              >
                <Settings className="h-5 w-5" />
                الإعدادات
              </Link>
              <form action={logout}>
                <Button variant="ghost" className="w-full justify-start gap-4 px-2.5 text-muted-foreground hover:text-foreground">
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
