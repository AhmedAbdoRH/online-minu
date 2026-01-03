'use client';

import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Catalog, CategoryWithSubcategories } from "@/lib/types";
import { StorefrontView } from "@/components/menu/StorefrontView";
import { Head } from "@/components/common/Head";
import { InstallPrompt } from "@/components/common/InstallPrompt";

type CatalogPageData = Catalog & {
    categories: CategoryWithSubcategories[];
};

export default function ClientCatalogPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const [data, setData] = useState<CatalogPageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchData() {
            if (!slug) return;
            try {
                const supabase = createClient();
                const { data: catalog, error: catalogError } = await supabase
                    .from("catalogs")
                    .select("*")
                    .eq("name", slug)
                    .single();

                if (catalogError || !catalog) {
                    console.error(`Error fetching catalog '${slug}':`, catalogError);
                    setError(true);
                    setLoading(false);
                    return;
                }

                const { data: categories, error: categoriesError } = await supabase
                    .from("categories")
                    .select(`*, menu_items ( * )`)
                    .eq("catalog_id", catalog.id)
                    .order("parent_category_id", { ascending: true })
                    .order("name", { ascending: true });

                if (categoriesError) {
                    console.error("Error fetching categories:", categoriesError);
                    setData({ ...catalog, categories: [] });
                    setLoading(false);
                    return;
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

                setData({ ...catalog, categories: rootCategories });
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError(true);
                setLoading(false);
            }
        }

        fetchData();
    }, [slug]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (error || !data) return <div className="min-h-screen flex items-center justify-center">Store not found</div>;

    const storeName = data.display_name || data.name;
    const titleWithSlogan = data.slogan ? `${storeName} | ${data.slogan}` : storeName;

    return (
        <>
            <Head
                faviconUrl={data.logo_url || undefined}
                storeName={titleWithSlogan}
            />
            <InstallPrompt
                storeName={data.display_name || data.name}
                storeLogo={data.logo_url || undefined}
            />
            <StorefrontView catalog={data} categories={data.categories} />
        </>
    );
}
