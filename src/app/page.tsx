import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: 'أونلاين منيو - منصة قوائم الطعام الرقمية',
  description: 'أنشئ قائمة طعامك الإلكترونية بسهولة ووفر تجربة طلب سلسة لعملائك',
};

export default function HomePage() {
  const features = [
    {
      title: 'تصميم عصري',
      description: 'قوائم طعام جذابة وسهلة التصفح تعكس هوية مطعمك',
      icon: '🎨',
    },
    {
      title: 'سهولة الاستخدام',
      description: 'واجهة بسيطة وسهلة الاستخدام للعملاء والمسؤولين',
      icon: '✨',
    },
    {
      title: 'متوافق مع الجوال',
      description: 'يعمل بشكل ممتاز على جميع الأجهزة الذكية',
      icon: '📱',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary mb-6">
            قائمة طعامك الإلكترونية بلمسة عصرية
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            أنشئ قائمة طعام إلكترونية جذابة لمطعمك أو مقهاك بسهولة وسرعة
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">
                ابدأ مجاناً
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">
                تعرف على المزيد
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            لماذا تختار منصتنا؟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <CardHeader>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">جاهز لبدء رحلتك معنا؟</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            انشئ قائمة طعامك الإلكترونية اليوم واجعل طلب عملائك أسهل من أي وقت مضى
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">
              سجل مجاناً الآن
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} أونلاين منيو. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
}
