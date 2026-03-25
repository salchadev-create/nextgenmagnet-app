'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Giriş gerektirmeyen sayfalar
const isPublicRoute = (path: string): boolean => {
  if (path === '/login' || path.startsWith('/login?')) return true;
  if (path === '/error-page' || path.startsWith('/error-page')) return true;
  // /{id} → tek segment rotalar (product entry sayfası)
  if (/^\/[^/]+$/.test(path) && path !== '/login' && !path.startsWith('/error-page')) return true;
  return false;
};

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = isPublicRoute(pathname);

  useEffect(() => {
    if (loading) return;
    // Giriş yapılmamış + korumalı sayfa → error
    if (!user && !isPublicPath) {
      router.replace('/error-page?reason=no_id');
    }
  }, [user, loading, isPublicPath, router]);

  // Auth yüklenirken spinner
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  // Giriş yapılmamış kullanıcı korumalı sayfaya giderse render etme
  if (!user && !isPublicPath) return null;

  return <>{children}</>;
}
