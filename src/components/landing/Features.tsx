
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
        <section id="features" className="py-16 sm:py-20 md:py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10 sm:mb-12 md:mb-16 space-y-2 sm:space-y-3 md:space-y-4">
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold font-headline">ميزات تفصيلية</h2>
                    <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4 sm:px-0">كل ما تحتاجه لإدارة متجرك بنجاح</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="group p-4 sm:p-6 md:p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3 sm:mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                                <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                            </div>
                            <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground mb-3 sm:mb-4 md:mb-6 line-clamp-2 text-sm sm:text-sm md:text-base">
                                {feature.description}
                            </p>
                            <Button variant="link" className="p-0 h-auto text-primary group-hover:underline text-xs sm:text-sm md:text-base">
                                شاهد كيف <ArrowRight className="mr-2 w-3 h-3 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
