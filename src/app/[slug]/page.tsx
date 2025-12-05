import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Catalog, CategoryWithSubcategories } from "@/lib/types";
import { StorefrontView } from "@/components/menu/StorefrontView";

type Props = {
  params: { slug: string };
};

type CatalogPageData = Catalog & {
  categories: CategoryWithSubcategories[];
};

async function getCatalogData(slug: string): Promise<CatalogPageData | null> {
  try {
    const supabase = await createClient();
    console.log(`Fetching catalog for slug: ${slug}`);

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

export async function generateStaticParams() {
  return [];
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
    title: `قائمة ${data.name} - أونلاين منيو`,
    description: `تصفح قائمة الطعام الفاخرة الخاصة بـ ${data.name} في أونلاين منيو.`,
    openGraph: {
      title: `قائمة طعام ${data.name}`,
      description: `تصفح قائمة الطعام الخاصة بـ ${data.name}`,
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


