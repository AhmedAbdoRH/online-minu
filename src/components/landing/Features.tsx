
import {
    Palette,
    LayoutDashboard,
    MessageCircle,
    Link as LinkIcon,
    Smartphone,
    Tags,
    ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
    {
        icon: Palette,
        title: "تخصيص الشعار والكفر",
        description: "حافظ على هوية علامتك التجارية مع خيارات تخصيص مرنة."
    },
    {
        icon: LayoutDashboard,
        title: "لوحة تحكم بسيطة",
        description: "إدارة المنتجات، الطلبات، والإحصاءات من مكان واحد."
    },
    {
        icon: MessageCircle,
        title: "تكامل واتساب",
        description: "زر تواصل مباشر للطلبات يسهل عملية البيع."
    },
    {
        icon: LinkIcon,
        title: "روابط وقابلة للمشاركة",
        description: "رابط ثابت + QR Code جاهز للطباعة والنشر."
    },
    {
        icon: Smartphone,
        title: "دعم متعدد الأجهزة",
        description: "تصميم مُحسّن يعمل بكفاءة على الموبايل والكمبيوتر."
    },
    {
        icon: Tags,
        title: "تحكم بالأسعار والتخفيضات",
        description: "إنشاء عروض وخصومات وتعديل الأسعار بسهولة."
    }
];

export default function Features() {
    return (
        <section id="features" className="py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold font-headline">ميزات تفصيلية</h2>
                    <p className="text-xl text-muted-foreground">كل ما تحتاجه لإدارة متجرك بنجاح</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="group p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground mb-6 line-clamp-2">
                                {feature.description}
                            </p>
                            <Button variant="link" className="p-0 h-auto text-primary group-hover:underline">
                                شاهد كيف <ArrowRight className="mr-2 w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
