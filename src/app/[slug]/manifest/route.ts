import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  let resolvedParams: { slug: string };
  
  try {
    resolvedParams = await params;
    const supabase = await createClient();
    
    // Fetch store data
    const { data: catalog, error } = await supabase
      .from('catalogs')
      .select('*')
      .eq('name', resolvedParams.slug)
      .single();

    if (error || !catalog) {
      // Return default manifest if store not found
      return NextResponse.json({
        name: "كتالوج",
        short_name: "كتالوج",
        description: "منصة إنشاء الكتالوجات الإلكترونية",
        start_url: `/${resolvedParams.slug}`,
        display: "standalone",
        background_color: "#000000",
        theme_color: "#00D1C9",
        orientation: "portrait-primary",
        icons: [
          {
            src: "/icon.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icon.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      });
    }

    const storeName = catalog.display_name || catalog.name;
    const description = catalog.description || `كتالوج ${storeName} الإلكتروني`;

    // Build manifest with store-specific data
    const manifest = {
      name: storeName,
      short_name: storeName,
      description: description,
      start_url: `/${resolvedParams.slug}`,
      display: "standalone" as const,
      background_color: "#000000",
      theme_color: "#00D1C9",
      orientation: "portrait-primary" as const,
      icons: catalog.logo_url ? [
        {
          src: catalog.logo_url,
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable"
        },
        {
          src: catalog.logo_url,
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable"
        }
      ] : [
        {
          src: "/icon.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "/icon.png",
          sizes: "512x512",
          type: "image/png"
        }
      ]
    };

    return NextResponse.json(manifest);
  } catch (error) {
    console.error('Error generating manifest:', error);
    
    // Try to get params for fallback
    try {
      resolvedParams = await params;
    } catch {
      resolvedParams = { slug: 'default' };
    }
    
    // Return fallback manifest
    return NextResponse.json({
      name: "كتالوج",
      short_name: "كتالوج",
      description: "منصة إنشاء الكتالوجات الإلكترونية",
      start_url: `/${resolvedParams.slug}`,
      display: "standalone",
      background_color: "#000000",
      theme_color: "#00D1C9",
      orientation: "portrait-primary",
      icons: [
        {
          src: "/icon.png",
          sizes: "192x192",
          type: "image/png"
        }
      ]
    });
  }
}
