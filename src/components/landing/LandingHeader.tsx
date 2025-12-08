
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";

export default function LandingHeader() {
    const navLinks = [
        { name: "الميزات", href: "#features" },
        { name: "كيف تعمل", href: "#how-it-works" },
        { name: "الأسعار", href: "#pricing" },
        { name: "تجارب", href: "#testimonials" },
        { name: "الأسئلة", href: "#faq" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative h-8 w-8 sm:h-10 sm:w-10 md:h-10 md:w-10">
                        <Image
                            src="/mainlogo.png"
                            alt="Online Catalog"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <span className="text-lg sm:text-xl font-bold text-foreground">منصة اونلاين كتالوج</span>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-4 lg:gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* CTAs */}
                <div className="hidden md:flex items-center gap-2 lg:gap-4">
                    {/* Micro Note */}
                    <span className="text-[10px] text-muted-foreground hidden xl:inline-block">
                        احصل على متجرك المصغّر خلال دقائق
                    </span>
                    <Button variant="ghost" size="sm" asChild className="px-2 md:px-3">
                        <Link href="/login">تسجيل دخول</Link>
                    </Button>
                    <Button size="sm" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all px-3 md:px-4">
                        <Link href="/signup">ابدأ مجاناً</Link>
                    </Button>
                </div>

                {/* Mobile Menu */}
                <Sheet>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-80 sm:w-96">
                        <div className="flex flex-col gap-6 mt-8">
                            <div className="flex items-center gap-3 mx-auto">
                                <div className="relative h-8 w-8">
                                    <Image
                                        src="/mainlogo.png"
                                        alt="Online Catalog"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <span className="text-xl font-bold text-foreground">منصة اونلاين كتالوج</span>
                            </div>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-lg font-medium hover:text-primary transition-colors py-2 px-4 rounded-lg hover:bg-secondary/50"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="flex flex-col gap-3 mt-6 px-4">
                                <Button variant="outline" asChild className="w-full h-12">
                                    <Link href="/login">تسجيل دخول</Link>
                                </Button>
                                <Button asChild className="w-full h-12">
                                    <Link href="/signup">ابدأ مجاناً</Link>
                                </Button>
                            </div>
                            <div className="text-center text-xs text-muted-foreground mt-4 px-4">
                                احصل على متجرك المصغّر خلال دقائق
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}
