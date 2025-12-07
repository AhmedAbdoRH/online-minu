
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Store } from 'lucide-react';

export default function HeroSection() {
    return (
        <section className="relative pt-20 pb-32 overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl opacity-50" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                    {/* Content */}
                    <div className="flex-1 text-center lg:text-right space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                            <Store className="w-4 h-4" />
                            <span>منصة القوائم الرقمية الأولى</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-headline tracking-tight text-foreground leading-[1.1]">
                            متجرك الرقمي... <br />
                            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                                جاهز في دقائق.
                            </span>
                        </h1>

                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            سجّل، أضف منتجاتك، واحصل على رابط مخصص لمتجرك: <br className="hidden sm:block" />
                            <span className="font-mono text-primary bg-primary/5 px-2 py-1 rounded mt-2 inline-block" dir="ltr">Online-Catalog.net/your-store</span>
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                            <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all font-bold group" asChild>
                                <Link href="/signup">
                                    ابدأ مجاناً
                                    <ArrowLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2 hover:bg-secondary/50" asChild>
                                <Link href="#mockup">
                                    شاهد مثال
                                </Link>
                            </Button>
                        </div>

                        {/* Trust Badges or Micro-copy */}
                        <p className="text-sm text-muted-foreground">
                            لا حاجة لبطاقة ائتمان — تجربة مجانية بالكامل
                        </p>
                    </div>

                    {/* Visuals */}
                    <div className="flex-1 w-full max-w-[600px] lg:max-w-none perspective-1000">
                        <div className="relative animate-float">
                            {/* Main Hero Image/Character */}
                            <div className="relative z-20 rounded-2xl bg-gradient-to-tr from-background to-secondary p-4 shadow-2xl border border-border/50">
                                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted/50 flex items-center justify-center">
                                    {/* Placeholder for Character or Interface */}
                                    <Image
                                        src="/caracter.png"
                                        alt="Online Catalog Character"
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                            </div>

                            {/* Floating UI Elements (Decorative) */}
                            <div className="absolute -top-12 -right-12 z-10 bg-card p-4 rounded-xl shadow-xl border border-border/50 w-48 hidden md:block animate-pulse-slow">
                                <div className="h-2 w-20 bg-primary/20 rounded mb-2" />
                                <div className="h-2 w-32 bg-muted rounded" />
                            </div>
                            <div className="absolute -bottom-8 -left-8 z-30 bg-card p-4 rounded-xl shadow-xl border border-border/50 w-56 hidden md:block animate-bounce-slow">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                        ✓
                                    </div>
                                    <div>
                                        <div className="h-2 w-24 bg-primary/20 rounded mb-1" />
                                        <div className="text-xs text-muted-foreground">تم إنشاء الرابط بنجاح</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
