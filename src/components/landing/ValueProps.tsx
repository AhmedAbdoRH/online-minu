
import { Zap, Layout, Share2 } from 'lucide-react';

const values = [
    {
        icon: Zap,
        title: "سهل وسريع",
        description: "سجّل وأطلق متجرك خلال دقائق."
    },
    {
        icon: Layout,
        title: "مظهر احترافي",
        description: "واجهات جاهزة تعرض منتجاتك بأفضل شكل."
    },
    {
        icon: Share2,
        title: "قابل للمشاركة",
        description: "رابط واحد، مشاركة على أي منصة أو QR."
    }
];

export default function ValueProps() {
    return (
        <section className="py-14 sm:py-16 md:py-20 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                    {values.map((item, index) => (
                        <div key={index} className="flex flex-col items-center text-center p-4 sm:p-6 md:p-8 rounded-2xl bg-secondary/20 hover:bg-secondary/40 transition-colors border border-transparent hover:border-primary/10 group">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3 sm:mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                                <item.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                            </div>
                            <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3">{item.title}</h3>
                            <p className="text-muted-foreground text-sm sm:text-sm md:text-base">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
