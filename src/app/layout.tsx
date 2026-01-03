import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import ClientProviders from '@/components/common/ClientProviders';
import { ThemeProvider } from "@/components/theme-provider";
import NextTopLoader from 'nextjs-toploader';

export const metadata: Metadata = {
  title: {
    default: 'منصة اونلاين كاتلوج',
    template: '%s | منصة اونلاين كاتلوج'
  },
    description: 'منصة اونلاين كاتلوج: منصة إنشاء المتجر الرقمي للمحال والمتاجر. سجل مجاناً وأنشئ متجرك خلال دقائق.',
  icons: {
    icon: '/mainlogo.png',
    shortcut: '/mainlogo.png',
    apple: '/mainlogo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: 'https://online-catalog.net',
    title: 'أونلاين كاتلوج | Online Catalog',
    description: 'أنشئ متجرك الرقمي والكاتلوج الخاص بك في دقائق. منصة متكاملة تدعم واتساب، بدون الحاجة لمبرمج.',
    siteName: 'منصة اونلاين كاتلوج',
    images: [
      {
        url: '/mainlogo.png',
        width: 512,
        height: 512,
        alt: 'منصة اونلاين كاتلوج - واجهة المعاينة',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'أونلاين كاتلوج | Online Catalog',
    description: 'أنشئ متجرك الرقمي والكاتلوج الخاص بك في دقائق.',
    images: ['/mainlogo.png'],
  },
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
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '735822915711863');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=735822915711863&ev=PageView&noscript=1"
          />
        </noscript>
      </head>
      <body
        className={cn(
          "font-body antialiased min-h-screen bg-background text-foreground",
          "selection:bg-brand-primary/10 selection:text-brand-primary"
        )}
      >
        <NextTopLoader
          color="#2299DD"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #2299DD,0 0 5px #2299DD"
        />
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
