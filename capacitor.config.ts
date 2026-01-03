import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nextcatalog.app',
  appName: 'NextCatalogApp',
  webDir: 'out',
  server: {
    url: 'https://online-catalog.net',
    cleartext: true
  },
  plugins: {
      GoogleAuth: {
        scopes: ['profile', 'email'],
        serverClientId: '471992011728-o37eenopdmpm81s6npksqjv6j0ug9uhu.apps.googleusercontent.com',
        androidClientId: '471992011728-1n4quq623he5rpvd09hebe3lsbtbvmrt.apps.googleusercontent.com',
        forceCodeForRefreshToken: false,
      },
  },
};

export default config;

