'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { User } from '@supabase/supabase-js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Catalog } from '@/lib/types';

function getInitials(name: string | undefined, email: string | undefined, phone: string | undefined) {
  if (name) return name.substring(0, 2).toUpperCase();
  if (phone) return phone.substring(0, 2).toUpperCase();
  if (email) return email.substring(0, 2).toUpperCase();
  return 'U';
}

function getDisplayIdentifier(email: string | undefined, phone: string | undefined) {
  if (phone) return phone;
  if (email && email.includes('@catalog.app')) {
    return email.replace('@catalog.app', '');
  }
  return email || 'Unknown';
}

interface HeaderProps {
  user: User | null;
  catalog?: Catalog | null;
}

export default function Header({ user, catalog }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex-1 flex items-center">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <UtensilsCrossed className="w-6 h-6 text-primary" />
            <span className="text-lg">{catalog?.display_name || catalog?.name || APP_NAME}</span>
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.user_metadata.avatar_url} alt={catalog?.display_name || getDisplayIdentifier(user.email, user.user_metadata?.phone)} />
                    <AvatarFallback>{getInitials(catalog?.display_name ?? undefined, user.email, user.user_metadata?.phone)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {catalog?.display_name || catalog?.name || APP_NAME}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {getDisplayIdentifier(user.email, user.user_metadata?.phone)}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">لوحة التحكم</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Button
                  variant="ghost"
                  className="w-full justify-start px-2 py-1.5 text-sm"
                  onClick={handleLogout}
                >
                  تسجيل الخروج
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/login">تسجيل الدخول</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
