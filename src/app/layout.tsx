import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import ClientProviders from '@/components/common/ClientProviders';
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: 'أونلاين منيو',
  description: 'منصتك الفاخرة لإنشاء قائمة طعام إلكترونية عربية جاهزة للمشاركة خلال دقائق.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#00D1C9',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.cdnfonts.com/css/satoshi"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={cn(
          "font-body antialiased min-h-screen bg-background text-foreground",
          "selection:bg-brand-primary/10 selection:text-brand-primary"
        )}
      >
        <ClientProviders>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
