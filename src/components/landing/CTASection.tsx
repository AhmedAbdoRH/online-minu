import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CTASection() {
    return (
        <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 text-center border border-primary/20">
                    <div className="max-w-2xl mx-auto">
                        <h3 className="text-2xl font-bold mb-4">ابدأ رحلتك الآن</h3>
                        <p className="text-muted-foreground mb-6">
                            انضم إلى آلاف التجار الذين يستخدمون منصتنا لإدارة متاجرهم الرقمية بسهولة وفعالية
                        </p>
                        <div className="flex justify-center">
                            <Button asChild size="lg" className="gap-2 h-14 px-8 text-base font-medium">
                                <Link href="/signup">
                                    ابدأ الآن
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
