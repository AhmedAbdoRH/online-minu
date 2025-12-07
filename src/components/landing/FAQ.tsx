
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
    {
        q: "هل أحتاج لمهارات تقنية؟",
        a: "لا — المنصة مصممة للاستخدام البسيط بحيث يستطيع أي شخص استخدامها دون خبرة تقنية مسبقة."
    },
    {
        q: "هل أستطيع تعديل الرابط بعد حجزه؟",
        a: "يُفضّل حجز اسم نهائي منذ البداية لثبات علامتك التجارية، ولكن التغيير ممكن بشروط معينة بالتواصل مع الدعم."
    },
    {
        q: "كم عدد المنتجات المسموح بها؟",
        a: "العدد يعتمد على باقتك: باقة Basic تتيح لك 50 منتجاً، باقة Pro تتيح 2000 منتج، وباقة Business غير محدودة."
    },
    {
        q: "هل يوجد دعم فني؟",
        a: "نعم — نوفر دعماً فنياً متميزاً عبر الدردشة الداخلية والبريد الإلكتروني لمساعدتك في أي وقت."
    },
    {
        q: "كيف أستلم المدفوعات؟",
        a: "المنصة توفر نظام عرض وطلب مرن، ويمكنك توجيه العميل للدفع عبر الوسيلة التي تفضلها (مثل التحويل البنكي أو المحافظ الإلكترونية) واستقبال إشعار الدفع عبر واتساب."
    }
];

export default function FAQ() {
    return (
        <section id="faq" className="py-24 bg-background">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold font-headline">أسئلة متكررة</h2>
                    <p className="text-xl text-muted-foreground">إجابات على الأسئلة الشائعة</p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((item, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-lg font-medium text-right">{item.q}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed text-right">
                                {item.a}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
