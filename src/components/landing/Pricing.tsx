
import { Check, X, Package, Zap, Crown, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const plans = [
    {
        name: "Basic",
        price: "مجاناً",
        description: "للمتاجر الصغيرة والناشئة",
        icon: Package,
        features: [
            { text: "50 منتج", included: true },
            { text: "5 تصنيفات", included: true },
            { text: "لوحة تحكم أساسية", included: true },
            { text: "رابط مخصص", included: true },
            { text: "دعم فني", included: true },
        ],
        cta: "ابدأ مجاناً",
        ctaLink: "/signup",
        popular: true
    },
    {
        name: "Pro",
        price: "2000 ج.م",
        period: "/ سنوياً",
        description: "للمتاجر المتنامية التي تحتاج المزيد",
        icon: Zap,
        features: [
            { text: "عدد غير محدود من المنتجات والتصنيفات", included: true },
            { text: "أنماط مظهر متعددة للمتجر", included: true },
            { text: "إزالة شعار المنصة", included: true },
            { text: "دعم فني أولوية", included: true },
        ],
        cta: "اشترك الآن",
        ctaLink: "https://wa.me/201008116452?text=أرغب%20في%20الاشتراك%20في%20باقة%20البرو%20المهنية%20(2000%20ج.م%20سنوياً)",
        popular: false
    },
    {
        name: "Business",
        price: "ابتداء من 5000 ج.م",
        description: "للشركات التي تحتاج حلولاً مخصصة",
        icon: Building,
        features: [
            { text: "موقع ومتجر إلكتروني كامل", included: true },
            { text: "نطاق خاص (Domain)", included: true },
            { text: "تصميم مخصص بالكامل", included: true },
            { text: "لوحة تحكم متقدمة", included: true },
        ],
        cta: "اعرف اكثر",
        ctaLink: "https://onlinecatalog.netlify.app/",
        popular: false
    }
];

export default function Pricing() {
    return (
        <section id="pricing" className="py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold font-headline">باقات الأسعار</h2>
                    <p className="text-xl text-muted-foreground">اختر الباقة المناسبة لحجم تجارتك</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <div key={index} className={`relative rounded-3xl p-8 border flex flex-col h-full ${plan.popular ? 'border-primary shadow-2xl scale-105 z-10 bg-primary/5' : 'border-border bg-card'}`}>

                            <div className="mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-[#ffb800]/5 flex items-center justify-center text-primary mb-4 mx-auto">
                                    <plan.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                <div className="text-muted-foreground mb-4 h-10">{plan.description}</div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black">{plan.price}</span>
                                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                                </div>
                            </div>

                            <ul className="space-y-4 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        {feature.included ? (
                                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                                                <Check className="w-3 h-3" />
                                            </div>
                                        ) : (
                                            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
                                                <X className="w-3 h-3" />
                                            </div>
                                        )}
                                        <span className={`text-sm ${feature.included ? '' : 'text-muted-foreground line-through'}`}>
                                            {feature.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                variant={plan.popular ? "default" : "outline"}
                                className={`w-full rounded-xl py-6 text-lg mt-8 ${plan.popular ? 'shadow-lg shadow-primary/20' : ''}`}
                                asChild
                            >
                                <Link href={plan.ctaLink}>{plan.cta}</Link>
                            </Button>

                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
