import type { NextConfig } from 'next';
import type { RemotePattern } from 'next/dist/shared/lib/image-config';

const nextConfig: NextConfig = {
  /* config options here */
  /* output: 'export', */
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: (() => {
      const patterns: RemotePattern[] = [
        {
          protocol: 'https',
          hostname: 'placehold.co',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'picsum.photos',
          pathname: '/**',
        },
      ];

      // If a Supabase URL is configured in env, add its hostname so storage URLs are allowed
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (supabaseUrl) {
          const u = new URL(supabaseUrl);
          const protocol = u.protocol.replace(':', '') as 'http' | 'https';
          patterns.push({ protocol, hostname: u.hostname, pathname: '/**' });
        }
      } catch (e) {
        // ignore malformed env
      }

      return patterns;
    })(),
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
