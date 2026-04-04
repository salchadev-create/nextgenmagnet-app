declare module 'next-pwa' {
  import { NextConfig } from 'next';
  
  interface PWAConfig {
    dest?: string;
    register?: boolean | string;
    skipWaiting?: boolean;
    clientsClaim?: boolean;
    runtimeCaching?: any[];
    publicExcludes?: string[];
    buildExcludes?: string[];
    [key: string]: any;
  }

  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;
  export = withPWA;
}
