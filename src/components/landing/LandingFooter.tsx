
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-secondary/10 border-t border-border pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1 space-y-4">
                        <div className="relative h-10 w-32">
                            <Image
                                src="/mainlogo.png"
                                alt="Online Catalog"
                                fill
                                className="object-contain object-left grayscale opacity-80"
                            />
                        </div>
                        <p className="text-muted-foreground text-sm">
                            منصتك المتكاملة لإنشاء كاتلوج رقمي احترافي وإدارة متجرك بسهولة.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <Link href="https://www.facebook.com/OnlineCatalog" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Facebook className="w-5 h-5" /></Link>
                            <Link href="https://www.instagram.com/onlinecatalog.ecommerce/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></Link>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-bold mb-6">المنتج</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="#features" className="hover:text-primary transition-colors">الميزات</Link></li>
                            <li><Link href="#how-it-works" className="hover:text-primary transition-colors">كيف تعمل</Link></li>
                            <li><Link href="#pricing" className="hover:text-primary transition-colors">الأسعار</Link></li>
                            <li><Link href="#testimonials" className="hover:text-primary transition-colors">تجارب العملاء</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-bold mb-6">الدعم</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/login" className="hover:text-primary transition-colors">تسجيل الدخول</Link></li>
                            <li><Link href="/signup" className="hover:text-primary transition-colors">إنشاء حساب</Link></li>
                            <li><a href="mailto:support@online-catalog.net" className="hover:text-primary transition-colors">تواصل معنا</a></li>
                            <li><Link href="#faq" className="hover:text-primary transition-colors">الأسئلة الشائعة</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold mb-6">تواصل معنا</h4>
                        <a
                            href="https://wa.me/201008116452"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors text-sm font-medium"
                        >
                            <MessageCircle className="w-4 h-4" />
                            تواصل معنا عبر واتساب
                        </a>
                    </div>

                </div>

                <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                    <p>© {currentYear} Online Catalog. كل الحقوق محفوظة.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-primary">سياسة الخصوصية</Link>
                        <Link href="/terms" className="hover:text-primary">شروط الاستخدام</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
