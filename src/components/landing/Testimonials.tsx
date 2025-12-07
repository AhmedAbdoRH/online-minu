
import { Star } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
    {
        text: "فعلت متجري خلال 10 دقائق وبعت أول طلب في نفس اليوم.",
        author: "محمد",
        role: "متجر ملابس رجالية",
        image: "/user1.png" // We don't have this, will fallback or use initial
    },
    {
        text: "المنصة وفرت علي تكاليف إنشاء موقع مكلف، والتصميم خرافي.",
        author: "سارة",
        role: "إكسسوارات هاند ميد",
        image: "/user2.png"
    },
    {
        text: "سهولة التعامل مع الطلبات عبر الواتساب زادت مبيعاتي بشكل ملحوظ.",
        author: "أحمد",
        role: "متجر عطور",
        image: "/user3.png"
    }
];

export default function Testimonials() {
    return (
        <section id="testimonials" className="py-24 bg-gradient-to-t from-secondary/20 to-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold font-headline">قصص نجاح تجارنا</h2>
                    <p className="text-xl text-muted-foreground">انضم إلى آلاف التجار الناجحين</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((item, index) => (
                        <div key={index} className="bg-card p-8 rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-all">
                            <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                            </div>

                            <p className="text-lg mb-6 leading-relaxed">
                                "{item.text}"
                            </p>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-lg">
                                    {item.author[0]}
                                </div>
                                <div>
                                    <div className="font-bold">{item.author}</div>
                                    <div className="text-sm text-muted-foreground">{item.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
