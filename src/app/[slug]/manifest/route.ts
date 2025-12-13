import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;

  try {
    const supabase = await createClient();

    const { data: catalog, error } = await supabase
      .from("catalogs")
      .select("name, display_name, logo_url, slogan")
      .eq("name", slug)
      .single();

    if (error || !catalog) {
      // Return default manifest if catalog not found
      return NextResponse.json({
        name: "متجر",
        short_name: "متجر",
        description: "متجر إلكتروني",
        start_url: `/${slug}`,
        display: "standalone",
        background_color: "#1A1F2C",
        theme_color: "#00D1C9",
        orientation: "portrait-primary",
        icons: [
          {
            src: "/icons/icon-192.png",
            type: "image/png",
            sizes: "192x192",
          },
          {
            src: "/icons/icon-512.png",
            type: "image/png",
            sizes: "512x512",
          },
        ],
      });
    }

    const storeName = catalog.display_name || catalog.name;
    const logoUrl = catalog.logo_url;

    // Build icons array
    const icons = [];
    
    if (logoUrl) {
      // Use store logo for PWA icons
      icons.push(
        {
          src: logoUrl,
          type: "image/png",
          sizes: "192x192",
          purpose: "any maskable",
        },
        {
          src: logoUrl,
          type: "image/png",
          sizes: "512x512",
          purpose: "any maskable",
        }
      );
    } else {
      // Fallback to default icons
      icons.push(
        {
          src: "/icons/icon-192.png",
          type: "image/png",
          sizes: "192x192",
        },
        {
          src: "/icons/icon-512.png",
          type: "image/png",
          sizes: "512x512",
        }
      );
    }

    const manifest = {
      name: storeName,
      short_name: storeName.length > 12 ? storeName.substring(0, 12) : storeName,
      description: catalog.slogan || `متجر ${storeName}`,
      start_url: `/${slug}`,
      scope: `/${slug}`,
      display: "standalone",
      background_color: "#1A1F2C",
      theme_color: "#00D1C9",
      orientation: "portrait-primary",
      icons,
    };

    return NextResponse.json(manifest, {
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error generating manifest:", error);
    
    return NextResponse.json({
      name: "متجر",
      short_name: "متجر",
      start_url: `/${slug}`,
      display: "standalone",
      background_color: "#1A1F2C",
      theme_color: "#00D1C9",
      icons: [
        {
          src: "/icons/icon-192.png",
          type: "image/png",
          sizes: "192x192",
        },
      ],
    });
  }
}
