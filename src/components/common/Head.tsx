'use client';

import { useEffect } from 'react';

interface HeadProps {
  faviconUrl?: string;
  storeName?: string;
}

export function Head({ faviconUrl, storeName }: HeadProps) {
  useEffect(() => {
    // Remove existing favicons and manifest
    const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
    existingFavicons.forEach(favicon => favicon.remove());
    
    // Remove existing manifest
    const existingManifest = document.querySelectorAll('link[rel="manifest"]');
    existingManifest.forEach(manifest => manifest.remove());

    // Add new favicon if provided
    if (faviconUrl) {
      // Function to create favicon with image optimization
      const createFavicon = (rel: string, href: string, sizes?: string, type?: string) => {
        const link = document.createElement('link');
        link.rel = rel;
        link.href = href;
        if (sizes) link.sizes = sizes;
        if (type) link.type = type;
        document.head.appendChild(link);
      };

      // Create optimized favicon URLs with different sizes
      const baseUrl = faviconUrl.split('?')[0]; // Remove existing query params
      
      // Standard favicon (32x32)
      createFavicon('icon', `${baseUrl}?w=32&h=32&fit=crop&q=80`, '32x32', 'image/png');
      
      // Small favicon (16x16)
      createFavicon('icon', `${baseUrl}?w=16&h=16&fit=crop&q=80`, '16x16', 'image/png');
      
      // Apple touch icon (180x180)
      createFavicon('apple-touch-icon', `${baseUrl}?w=180&h=180&fit=crop&q=90`, '180x180', 'image/png');
      
      // Android Chrome icon (192x192)
      createFavicon('icon', `${baseUrl}?w=192&h=192&fit=crop&q=90`, '192x192', 'image/png');
      
      // Large icon for high-resolution displays
      createFavicon('icon', `${baseUrl}?w=512&h=512&fit=crop&q=90`, '512x512', 'image/png');
      
      // Set dynamic manifest for PWA
      const manifest = document.createElement('link');
      manifest.rel = 'manifest';
      // Use dynamic manifest route based on current URL with cache busting
      const currentPath = window.location.pathname;
      const slug = currentPath.split('/')[1];
      const timestamp = Date.now();
      manifest.href = slug ? `/${slug}/manifest?v=${timestamp}` : '/manifest.json';
      document.head.appendChild(manifest);

      // Add theme-color meta tag
      const themeColor = document.createElement('meta');
      themeColor.name = 'theme-color';
      themeColor.content = '#00D1C9';
      document.head.appendChild(themeColor);

      // Add apple-mobile-web-app-capable
      const appleCapable = document.createElement('meta');
      appleCapable.name = 'apple-mobile-web-app-capable';
      appleCapable.content = 'yes';
      document.head.appendChild(appleCapable);

      // Add apple-mobile-web-app-status-bar-style
      const appleStatusBar = document.createElement('meta');
      appleStatusBar.name = 'apple-mobile-web-app-status-bar-style';
      appleStatusBar.content = 'default';
      document.head.appendChild(appleStatusBar);
    }

    // Update document title if store name is provided
    if (storeName) {
      document.title = storeName;
    }

    // Cleanup function
    return () => {
      const addedElements = document.querySelectorAll('link[rel*="icon"], link[rel="manifest"], meta[name="theme-color"], meta[name="apple-mobile-web-app-capable"], meta[name="apple-mobile-web-app-status-bar-style"]');
      addedElements.forEach(element => element.remove());
    };
  }, [faviconUrl, storeName]);

  return null; // This component doesn't render anything
}
