import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Catalog, CategoryWithSubcategories } from "@/lib/types";
import { StorefrontView } from "@/components/menu/StorefrontView";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: { slug: string };
};

type CatalogPageData = Catalog & {
  categories: CategoryWithSubcategories[];
};

async function getCatalogData(slug: string): Promise<CatalogPageData | null> {
  try {
    console.log(`Fetching catalog for slug: ${slug}`);

    // DEBUG MODE: Bypass DB for testing
    if (slug === 'debug-test') {
      return {
        id: 99999,
        user_id: 'debug-user',
        name: 'debug-test',
        display_name: 'Debug Test Store',
        description: 'This is a debug store to test rendering without DB.',
        logo_url: null,
        cover_url: null,
        enable_subcategories: false,
        plan: 'basic',
        created_at: new Date().toISOString(),
        categories: [
          {
            id: 1,
            catalog_id: 99999,
            name: 'Debug Category',
            parent_category_id: null,
            created_at: new Date().toISOString(),
            subcategories: [],
            menu_items: [
              {
                id: 1,
                catalog_id: 99999,
                category_id: 1,
                name: 'Debug Item',
                description: 'Test item',
                price: 100,
                image_url: null,
                created_at: new Date().toISOString()
              }
            ]
          }
        ]
      };
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return null;
    }

    const supabase = await createClient();

    // Test connection?
    // const { count, error: countError } = await supabase.from('catalogs').select('*', { count: 'exact', head: true });
    // if (countError) console.error("Supabase Connection Error:", countError);

    const { data: catalog, error: catalogError } = await supabase
      .from("catalogs")
      .select("*")
      .eq("name", slug)
      .single();

    if (catalogError) {
      console.error(`Error fetching catalog '${slug}':`, catalogError);
      return null;
    }

    if (!catalog) {
      console.log(`Catalog '${slug}' not found.`);
      return null;
    }

    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select(
        `
        *,
        menu_items ( * )
      `
      )
      .eq("catalog_id", catalog.id)
      .order("parent_category_id", { ascending: true })
      .order("name", { ascending: true });

    if (categoriesError) {
      console.error("Error fetching categories and items:", categoriesError);
      return { ...catalog, categories: [] };
    }

    const categoriesMap = new Map<number, CategoryWithSubcategories>();
    const rootCategories: CategoryWithSubcategories[] = [];

    categories?.forEach((category: any) => {
      categoriesMap.set(category.id, {
        ...category,
        subcategories: [],
        menu_items: category.menu_items || [],
      });
    });

    categories?.forEach((category: any) => {
      const categoryNode = categoriesMap.get(category.id)!;
      if (category.parent_category_id && categoriesMap.has(category.parent_category_id)) {
        categoriesMap.get(category.parent_category_id)!.subcategories.push(categoryNode);
      } else {
        rootCategories.push(categoryNode);
      }
    });

    return { ...catalog, categories: rootCategories };
  } catch (error) {
    console.error("Unexpected error in getCatalogData:", error);
    return null;
  }
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await getCatalogData(resolvedParams.slug);
  if (!data) {
    return {
      title: "الكتالوج غير موجود",
    };
  }
  return {
    title: `كتالوج ${data.name} - منظومة أونلاين كاتلوج للمحال والمتاجر`,
    description: `تصفح الكتالوج الفاخر الخاص بـ ${data.name} في منظومة أونلاين كاتلوج للمحال والمتاجر.`,
    openGraph: {
      title: `كتالوج ${data.name}`,
      description: `تصفح الكتالوج الخاص بـ ${data.name}`,
      images: [
        {
          url: data.logo_url || "",
          width: 800,
          height: 600,
          alt: `شعار ${data.name}`,
        },
      ],
    },
  };
}

export default async function CatalogPage({ params }: Props) {
  const resolvedParams = await params;
  const data = await getCatalogData(resolvedParams.slug);

  if (!data) {
    notFound();
  }

  return <StorefrontView catalog={data} categories={data.categories} />;
}
