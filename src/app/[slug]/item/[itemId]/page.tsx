import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShareButtons } from "@/components/menu/ShareButtons";
import type { Catalog, MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles, Clock, Flame, MessageCircle } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import RelatedProductImage from "@/components/RelatedProductImage";

type Props = {
  params: Promise<{
    slug: string;
    itemId: string;
  }>;
};

type ProductPageData = {
  catalog: Catalog;
  product: MenuItem;
  categoryName?: string;
  related: MenuItem[];
};

async function getProductData(slug: string, itemId: string): Promise<ProductPageData | null> {
  const supabase = await createClient();

  const { data: catalog } = await supabase
    .from("catalogs")
    .select("*")
    .eq("name", slug)
    .single();

  if (!catalog) {
    return null;
  }

  const { data: product } = await supabase
    .from("menu_items")
    .select("*")
    .eq("id", itemId)
    .eq("catalog_id", catalog.id)
    .single();

  if (!product) {
    return null;
  }

  const { data: category } = await supabase
    .from("categories")
    .select("name")
    .eq("id", product.category_id)
    .maybeSingle();

  const { data: related } = await supabase
    .from("menu_items")
    .select("*")
    .eq("catalog_id", catalog.id)
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .limit(4);

  return {
    catalog,
    product,
    categoryName: category?.name ?? undefined,
    related: related ?? [],
  };
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await getProductData(resolvedParams.slug, resolvedParams.itemId);
  if (!data) {
    return {
      title: "المنتج غير متاح",
    };
  }

  const { product, catalog } = data;
  const shopTitle = catalog.display_name || "المتجر";

  return {
    title: `${product.name} | ${shopTitle}`,
    description: product.description ?? `اكتشف المنتج ${product.name} من ${shopTitle}.`,
    openGraph: {
      title: `${product.name} | ${shopTitle}`,
      description: product.description ?? "",
      images: product.image_url
        ? [
          {
            url: product.image_url,
            width: 1200,
            height: 800,
            alt: product.name,
          },
        ]
        : undefined,
    },
      };
}

export default async function ProductPage({ params }: Props) {
  const resolvedParams = await params;
  const data = await getProductData(resolvedParams.slug, resolvedParams.itemId);

  if (!data) {
    notFound();
  }

  const { catalog, product, categoryName, related } = data;
  const productUrl = `https://online-catalog.net/${catalog.name}/item/${product.id}`;
  const whatsappText = encodeURIComponent(
    `أرغب في طلب ${product.name} من ${catalog.display_name}. التفاصيل: ${productUrl}`
  );
  const sellerWhatsAppNumber = catalog.whatsapp_number;

  // Get theme class based on catalog theme
  const theme = (catalog as any).theme;
  const getThemeClass = () => {
    switch (theme) {
      case 'gradient-1': return 'bg-gradient-1';
      case 'gradient-2': return 'bg-gradient-2';
      case 'gradient-3': return 'bg-gradient-3';
      case 'gradient-4': return 'bg-gradient-4';
      case 'gradient-5': return 'bg-gradient-5';
      case 'gradient-6': return 'bg-gradient-6';
      case 'gradient-7': return 'bg-gradient-7';
      case 'gradient-8': return 'bg-gradient-8';
      case 'gradient-9': return 'bg-gradient-9';
      default: return 'bg-gradient-default';
    }
  };

  // Get card colors based on theme
  const getCardColors = () => {
    switch (theme) {
      case 'gradient-1': return 'from-purple-900/60 to-purple-950/30'; // بنفسجي
      case 'gradient-2': return 'from-red-900/60 to-red-950/30'; // أحمر داكن
      case 'gradient-3': return 'from-orange-900/60 to-orange-950/30'; // برتقالي
      case 'gradient-4': return 'from-green-900/60 to-green-950/30'; // أخضر
      case 'gradient-5': return 'from-blue-900/60 to-blue-950/30'; // أزرق
      case 'gradient-6': return 'from-pink-900/60 to-pink-950/30'; // وردي
      case 'gradient-7': return 'from-amber-900/60 to-amber-950/30'; // ذهبي
      case 'gradient-8': return 'from-teal-900/60 to-teal-950/30'; // تركوازي
      case 'gradient-9': return 'from-gray-800/60 to-gray-900/30'; // رمادي
      default: return 'from-slate-900/60 to-slate-900/30'; // افتراضي
    }
  };

  return (
    <div className={cn("relative min-h-screen pb-24", getThemeClass())}>
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pt-10 md:px-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <Link
            href={`/${catalog.name}`}
            className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary/80"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للمتجر
          </Link>
                  </div>

        <section className="glass-surface grid gap-6 rounded-3xl bg-white/10 p-4 shadow-2xl backdrop-blur-2xl md:grid-cols-[1.15fr_0.85fr] md:p-6">
          <div className={cn("relative aspect-square overflow-hidden rounded-[1.5rem] border border-white/30 bg-gradient-to-br text-white shadow-[0_20px_55px_rgba(15,23,42,0.4)] md:aspect-auto md:h-[400px]", getCardColors())}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
            {product.image_url && product.image_url.trim() !== '' ? (
              <ProductImage
                src={product.image_url}
                alt={product.name}
                priority
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
                <Sparkles className="h-10 w-10 text-brand-primary" />
                <p className="text-sm">صورة المنتج ستظهر هنا بعد رفعها من لوحة التحكم</p>
                <p className="text-xs text-muted-foreground">رابط الصورة: {product.image_url || 'غير متوفر'}</p>
              </div>
            )}
            <div className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-brand-primary">
              {product.price} ج.م
            </div>
          </div>

          <div className="flex flex-col gap-4">

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {catalog.display_name}
              </p>
              <h1 className="font-headline text-3xl font-extrabold text-foreground md:text-4xl">
                {product.name}
              </h1>
              {categoryName && (
                <p className="text-sm text-foreground/70">
                  ضمن قسم <span className="text-brand-primary font-semibold">{categoryName}</span>
                </p>
              )}
            </div>
            <p className="text-base leading-relaxed text-foreground/80">
              {product.description ?? "وصف المنتج سيتم إضافته قريبًا لإبراز القصة والنكهة الفريدة."}
            </p>

            <div className="grid gap-3 rounded-2xl border border-dashed border-white/40 bg-white/60 p-4 shadow-inner backdrop-blur dark:bg-slate-950/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">السعر</span>
                <span className="font-semibold text-brand-primary">{product.price} ج.م</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {sellerWhatsAppNumber ? (
                <Button
                  asChild
                  className="flex-1 rounded-full bg-[#25D366] text-sm font-semibold shadow-[0_18px_40px_rgba(37,211,102,0.35)] hover:bg-[#1fb55b]"
                >
                  <a href={`https://wa.me/${sellerWhatsAppNumber.replace(/[^\d]/g, '')}?text=${whatsappText}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="ml-2 h-5 w-5" />
                    اطلب عبر واتساب
                  </a>
                </Button>
              ) : (
                <div className="flex-1 rounded-full border border-dashed border-muted-foreground/30 bg-muted/20 px-4 py-3 text-center text-sm text-muted-foreground">
                  <MessageCircle className="ml-2 inline h-4 w-4" />
                  رقم الواتساب غير متوفر
                </div>
              )}
            </div>



            <ShareButtons catalogName={catalog.display_name || ""} />
          </div>
        </section>

        {related.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline text-xl font-bold text-foreground">منتجات مقترحة</h2>
                <p className="text-sm text-muted-foreground">جرّب منتجات أخرى من نفس التصنيف</p>
              </div>
              <Link
                href={`/${catalog.name}`}
                className="text-sm text-brand-primary hover:text-brand-primary/80"
              >
                استعرض المتجر كامل
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/${catalog.name}/item/${item.id}`}
                  className={cn(
                    "group flex flex-col rounded-2xl p-3 text-right border border-white/15 bg-white/10 backdrop-blur-md",
                    "transition-all duration-200 hover:bg-white/15 hover:border-white/25"
                  )}
                >
                  <div className={cn("relative h-36 overflow-hidden rounded-xl bg-gradient-to-br", getCardColors())}>
                    {item.image_url && item.image_url.trim() !== '' ? (
                      <RelatedProductImage
                        src={item.image_url}
                        alt={item.name}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        صورة المنتج
                      </div>
                    )}
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.description ?? "تفاصيل المنتج ستظهر هنا."}
                    </p>
                    <p className="text-sm font-bold text-brand-primary">{item.price} ج.م</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
