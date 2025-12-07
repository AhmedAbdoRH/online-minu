
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
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Link href="/" className='flex items-center gap-2'>
                        <div className="relative h-10 w-32">
                            <Image
                                src="/mainlogo.png"
                                alt="Online Catalog"
                                fill
                                className="object-contain object-left"
                                priority
                            />
                        </div>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
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
                <div className="hidden md:flex items-center gap-4">
                    {/* Micro Note */}
                    <span className="text-[10px] text-muted-foreground hidden lg:inline-block">
                        احصل على متجرك المصغّر خلال دقائق
                    </span>
                    <Button variant="ghost" asChild>
                        <Link href="/login">تسجيل دخول</Link>
                    </Button>
                    <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all">
                        <Link href="/signup">ابدأ مجاناً</Link>
                    </Button>
                </div>

                {/* Mobile Menu */}
                <Sheet>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                        <div className="flex flex-col gap-6 mt-10">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-lg font-medium hover:text-primary transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="flex flex-col gap-4 mt-4">
                                <Button variant="outline" asChild className="w-full">
                                    <Link href="/login">تسجيل دخول</Link>
                                </Button>
                                <Button asChild className="w-full">
                                    <Link href="/signup">ابدأ مجاناً</Link>
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}
