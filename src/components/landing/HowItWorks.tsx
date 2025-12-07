
import { UserPlus, PackagePlus, Share } from 'lucide-react';

const steps = [
    {
        icon: UserPlus,
        title: "سجّل حساباً",
        description: "ادخل اسم متجرك، بريدك، واختر الرابط.",
        step: "01"
    },
    {
        icon: PackagePlus,
        title: "أضف منتجاتك",
        description: "صور، سعر، وصف، وتصنيف في أقسام.",
        step: "02"
    },
    {
        icon: Share,
        title: "شارك وابدأ البيع",
        description: "شارك رابط المتجر أو استخدم QR واستقبل الطلبات عبر واتساب.",
        step: "03"
    }
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 bg-secondary/10">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold font-headline">طريقة العمل خطوة بخطوة</h2>
                    <p className="text-xl text-muted-foreground">ثلاث خطوات بسيطة تفصلك عن متجرك الرقمي</p>
                </div>

                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-[20%] left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 -z-10" />

                    {steps.map((item, index) => (
                        <div key={index} className="flex flex-col items-center text-center group">
                            <div className="relative mb-8">
                                <div className="w-20 h-20 rounded-full bg-background border-4 border-secondary shadow-xl flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-300">
                                    <item.icon className="w-8 h-8 text-primary" />
                                </div>
                                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-lg">
                                    {item.step}
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                            <p className="text-muted-foreground max-w-xs">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
