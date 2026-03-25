'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const PUBLIC_PATHS = ['/login'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));

  useEffect(() => {
    if (loading) return;

    if (!user && !isPublicPath) {
      router.replace('/login');
    } else if (user && isPublicPath) {
      router.replace('/');
    }
  }, [user, loading, isPublicPath, router]);

  // Auth durumu yüklenirken boş ekran göster (flash önleme)
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  // Giriş yapmamış kullanıcı korumalı sayfaya giderse render etme
  if (!user && !isPublicPath) return null;

  // Giriş yapmış kullanıcı login sayfasına giderse render etme
  if (user && isPublicPath) return null;

  return <>{children}</>;
}
