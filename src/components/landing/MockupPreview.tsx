
import { Button } from "@/components/ui/button";
import { MessageCircle, Search, ShoppingBag } from "lucide-react";
import Link from 'next/link';

export default function MockupPreview() {
    return (
        <section id="mockup" className="py-24 bg-gradient-to-b from-background to-secondary/10 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold font-headline">كيف يظهر متجرك للعملاء</h2>
                    <p className="text-xl text-muted-foreground">تجربة تصفح سلسة وممتعة لعملائك</p>
                </div>

                <div className="relative max-w-4xl mx-auto">
                    {/* Phone/Screen Container */}
                    <div className="relative rounded-[2.5rem] bg-gray-900 p-2 md:p-4 shadow-2xl border-4 border-gray-900 ring-1 ring-white/10">
                        {/* Screen Content */}
                        <div className="relative rounded-[2rem] bg-background overflow-hidden h-[600px] md:h-[700px] w-full flex flex-col">

                            {/* Status Bar (Fake) */}
                            <div className="h-6 bg-primary/5 flex items-center justify-between px-6 text-[10px] text-muted-foreground">
                                <span>9:41</span>
                                <div className="flex gap-1">
                                    <div className="w-3 h-3 rounded-full bg-foreground/20"></div>
                                    <div className="w-3 h-3 rounded-full bg-foreground/20"></div>
                                </div>
                            </div>

                            {/* Header/Cover */}
                            <div className="relative h-40 bg-gradient-to-r from-blue-500 to-purple-600 flex-shrink-0">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50 text-4xl font-bold opacity-20">Cover</div>
                            </div>

                            {/* Store Info */}
                            <div className="px-6 -mt-10 flex flex-col items-center relative z-10">
                                <div className="w-20 h-20 rounded-full bg-card border-4 border-background flex items-center justify-center shadow-md">
                                    <ShoppingBag className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="mt-2 text-xl font-bold">متجر الأناقة</h3>
                                <p className="text-sm text-muted-foreground">أحدث صيحات الموضة العصرية</p>
                            </div>

                            {/* Search */}
                            <div className="px-6 py-4">
                                <div className="relative">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <input type="text" placeholder="ابحث عن منتج..." className="w-full bg-secondary/50 rounded-full py-2 pr-10 pl-4 text-sm outline-none border border-transparent focus:border-primary/50" readOnly />
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="px-6 pb-2 overflow-x-auto flex gap-2 no-scrollbar">
                                {['الكل', 'رجال', 'نساء', 'أطفال', 'أحذية', 'اكسسوارات'].map((cat, i) => (
                                    <div key={i} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                                        {cat}
                                    </div>
                                ))}
                            </div>

                            {/* Products Grid */}
                            <div className="flex-1 overflow-y-auto p-6 pt-2">
                                <div className="grid grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map((item) => (
                                        <div key={item} className="bg-card rounded-xl overflow-hidden border shadow-sm">
                                            <div className="aspect-square bg-muted flex items-center justify-center text-muted-foreground">
                                                صورة {item}
                                            </div>
                                            <div className="p-3">
                                                <div className="font-semibold text-sm mb-1">تيشيرت كلاسيك</div>
                                                <div className="text-primary font-bold text-sm mb-2">120 ر.س</div>
                                                <Button size="sm" className="w-full h-8 text-xs bg-green-600 hover:bg-green-700">
                                                    <MessageCircle className="w-3 h-3 ml-1" /> اطلب
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* About Short */}
                                <div className="mt-8 p-4 bg-secondary/30 rounded-xl text-center">
                                    <h4 className="font-bold mb-2">عن المتجر</h4>
                                    <p className="text-sm text-muted-foreground">نقدم لكم أفضل الخامات والأسعار المنافسة في السوق.</p>
                                </div>
                            </div>

                        </div>

                        {/* Home Button (Fake) */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full"></div>
                    </div>

                    <div className="text-center mt-12">
                        <Button size="lg" asChild className="text-lg px-8 rounded-full shadow-lg">
                            <Link href="https://online-catalog.net/fath" target="_blank" rel="noopener noreferrer">شاهد مثال</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
