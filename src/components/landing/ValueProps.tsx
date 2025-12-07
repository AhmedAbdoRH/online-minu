
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
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {values.map((item, index) => (
                        <div key={index} className="flex flex-col items-center text-center p-6 rounded-2xl bg-secondary/20 hover:bg-secondary/40 transition-colors border border-transparent hover:border-primary/10">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                                <item.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                            <p className="text-muted-foreground">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
