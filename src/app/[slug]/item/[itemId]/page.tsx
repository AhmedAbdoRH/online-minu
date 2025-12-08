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

type Props = {
  params: {
    slug: string;
    itemId: string;
  };
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
  const data = await getProductData(params.slug, params.itemId);
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
  const data = await getProductData(params.slug, params.itemId);

  if (!data) {
    notFound();
  }

  const { catalog, product, categoryName, related } = data;
  const productUrl = `https://online-catalog.net/${catalog.name}/item/${product.id}`;
  const whatsappText = encodeURIComponent(
    `أرغب في طلب ${product.name} من ${catalog.display_name}. التفاصيل: ${productUrl}`
  );
  const sellerWhatsAppNumber = catalog.whatsapp_number;

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,_rgba(0,209,201,0.2),transparent_55%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.8),transparent_60%)] bg-background pb-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pt-10 md:px-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <Link
            href={`/${catalog.name}`}
            className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary/80"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للمنيو
          </Link>
          <span className="hidden text-xs text-muted-foreground md:inline-flex">
            صفحة منتج فاخرة من منظومة أونلاين كاتلوج للمحال والمتاجر
          </span>
        </div>

        <section className="glass-surface grid gap-6 rounded-3xl bg-white/80 p-4 shadow-2xl backdrop-blur-2xl dark:bg-slate-900/80 md:grid-cols-[1.15fr_0.85fr] md:p-6">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-white/30 bg-gradient-to-br from-slate-900/60 to-slate-900/30 text-white shadow-[0_20px_55px_rgba(15,23,42,0.4)]">
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
                <Sparkles className="h-10 w-10 text-brand-primary" />
                <p className="text-sm">صورة المنتج ستظهر هنا بعد رفعها من لوحة التحكم</p>
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
                <p className="text-sm text-muted-foreground">
                  ضمن قسم <span className="text-brand-primary font-semibold">{categoryName}</span>
                </p>
              )}
            </div>
            <p className="text-base leading-relaxed text-muted-foreground">
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
                <p className="text-sm text-muted-foreground">جرّب منتجات أخرى من نفس الفئة</p>
              </div>
              <Link
                href={`/${catalog.name}`}
                className="text-sm text-brand-primary hover:text-brand-primary/80"
              >
                استعرض المنيو كاملة
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/${catalog.name}/item/${item.id}`}
                  className={cn(
                    "glass-surface glass-surface-hover group flex flex-col rounded-2xl p-3 text-right",
                    "transition-transform duration-200"
                  )}
                >
                  <div className="relative h-36 overflow-hidden rounded-xl bg-muted/40">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
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
