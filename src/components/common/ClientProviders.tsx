"use client";

import { useEffect, type ReactNode } from "react";

export default function ClientProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Register PWA service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('SW registered: ', registration);
        }).catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
      });
    }
  }, []);

  return <>{children}</>;
}
