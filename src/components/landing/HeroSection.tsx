
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Store } from 'lucide-react';

export default function HeroSection() {
    return (
        <section className="relative pt-12 sm:pt-14 md:pt-16 pb-12 sm:pb-20 md:pb-28 lg:pt-16 lg:pb-28 overflow-hidden bg-gradient-to-b from-brand-primary/10 via-background to-background">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-blue-500/10 rounded-full blur-3xl opacity-50" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-20 pt-0 sm:pt-1 md:pt-2 lg:pt-0">

                    {/* Visuals - First on mobile/tablet */}
                    <div className="flex-1 w-full max-w-[320px] sm:max-w-[480px] md:max-w-[580px] lg:max-w-none perspective-1000 order-1 lg:order-2">
                        <div className="relative animate-float">
                            {/* Main Hero Logo */}
                            <div className="relative z-20 rounded-2xl bg-gradient-to-tr from-background to-secondary p-3 sm:p-4 shadow-2xl border border-border/50">
                                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted/50 flex items-center justify-center">
                                    <Image
                                        src="/logo.png"
                                        alt="Online Catalog Logo"
                                        width={300}
                                        height={300}
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                            </div>

                            {/* Floating UI Elements (Decorative) */}
                            <div className="absolute -top-6 -right-6 sm:-top-8 sm:-right-8 md:-top-12 md:-right-12 z-10 bg-card p-2 sm:p-3 md:p-4 rounded-xl shadow-xl border border-border/50 w-24 sm:w-32 md:w-48 animate-pulse-slow">
                                <div className="h-1.5 w-12 sm:w-16 md:w-20 bg-primary/20 rounded mb-1.5 sm:mb-2" />
                                <div className="h-1.5 w-16 sm:w-20 md:w-24 bg-muted rounded" />
                            </div>
                            <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 md:-bottom-8 md:-left-8 z-30 bg-card p-2 sm:p-3 md:p-4 rounded-xl shadow-xl border border-border/50 w-28 sm:w-40 md:w-56 animate-bounce-slow">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs sm:text-sm md:text-base">
                                        ✓
                                    </div>
                                    <div>
                                        <div className="h-1.5 w-16 sm:w-20 md:w-24 bg-primary/20 rounded mb-1" />
                                        <div className="text-[10px] sm:text-xs text-muted-foreground">تم إنشاء الرابط بنجاح</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content - Second on mobile/tablet */}
                    <div className="flex-1 text-center lg:text-right space-y-6 md:space-y-8 order-2 lg:order-1">
                        
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-headline tracking-tight text-foreground leading-[1.3] sm:leading-[1.4]">
                            متجرك الرقمي... <br className="block sm:hidden" />
                            <span className="text-brand-accent bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-[#FF9500]">جاهز في دقائق.</span>
                        </h1>

                        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed px-2 sm:px-0">
                            سجّل، أضف منتجاتك، واحصل على رابط مخصص لمتجرك: <br className="hidden sm:block" />
                            <span className="font-mono text-primary bg-primary/5 px-2 py-1 rounded mt-2 inline-block text-sm sm:text-base" dir="ltr">Online-Catalog.net/your-store</span>
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 md:gap-6 justify-center lg:justify-start px-4 sm:px-0">
                            <Button size="lg" className="h-12 sm:h-14 md:h-16 px-6 sm:px-8 md:px-10 text-base sm:text-lg md:text-xl rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all font-bold group w-full sm:w-auto" asChild>
                                <Link href="/signup">
                                    <ArrowRight className="mr-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                                    ابدأ مجاناً
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-12 sm:h-14 md:h-16 px-6 sm:px-8 md:px-10 text-base sm:text-lg md:text-xl rounded-full border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 w-full sm:w-auto transition-all" asChild>
                                <Link href="https://online-catalog.net/elfath" target="_blank" rel="noopener noreferrer">
                                    اعرض مثال
                                </Link>
                            </Button>
                        </div>

                        {/* Trust Badges or Micro-copy */}
                        <p className="text-xs sm:text-sm text-muted-foreground px-4 sm:px-0">
                            لا حاجة لبطاقة ائتمان — تجربة مجانية بالكامل
                        </p>
                    </div>

                    
                </div>
            </div>
        </section>
    );
}
