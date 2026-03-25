'use client';

import Link from 'next/link';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { AuthHeader, GoogleLoginButton } from '@/components/auth';
import Footer from '@/components/common/Footer';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { getDb } from '@/lib/firebase';

type ButtonHint = null | 'no_id' | 'checking' | 'not_found' | 'found';

function LoginContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const router = useRouter();

  const { signInWithGoogle } = useGoogleAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [hint, setHint] = useState<ButtonHint>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setHint(null);

    // 1. ID yoksa → butona mesaj bas, işlemi durdur
    if (!productId) {
      setHint('no_id');
      setIsGoogleLoading(false);
      return;
    }

    // 2. ID var → Firestore'da kontrol et
    setHint('checking');
    try {
      const firestore = getDb();
      const collectionName = process.env.NEXT_PUBLIC_COLLECTION_NAME || 'products';
      const docSnap = await getDoc(doc(firestore, collectionName, productId));

      if (!docSnap.exists()) {
        setHint('not_found');
        setIsGoogleLoading(false);
        return;
      }

      // 3. ID geçerli → Google ile giriş yap
      setHint('found');
      localStorage.setItem('product_id', productId);
      await signInWithGoogle();

      // 4. Giriş başarılı → ana sayfaya git
      router.replace('/');
    } catch (err) {
      console.error('Login hatası:', err);
      setHint(null);
      setIsGoogleLoading(false);
    }
  };

  const hintConfig: Record<Exclude<ButtonHint, null>, { text: string; color: string }> = {
    no_id:     { text: '⚠ Giriş için geçerli bir ürün bağlantısı gerekli.', color: 'text-amber-500' },
    checking:  { text: '🔍 Ürün kontrol ediliyor...', color: 'text-gray-400' },
    not_found: { text: "✕ Bu ID'ye ait ürün bulunamadı.", color: 'text-red-500' },
    found:     { text: '✓ Ürün doğrulandı, giriş yapılıyor...', color: 'text-emerald-500' },
  };

  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen p-6 bg-white">
      {showSplash && (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50" />
      )}

      <div className={`relative z-10 flex flex-col items-center gap-3 w-full max-w-sm pt-24 transition-opacity duration-500 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        <AuthHeader
          title="Hoşgeldiniz!"
          subtitle="Hatıralarınızı magnete sığdırdık..."
        />
      </div>

      <div className={`relative z-10 flex flex-col items-center gap-6 w-full max-w-sm transition-opacity duration-500 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        <div className="w-full space-y-3 text-center">
          <GoogleLoginButton
            onClick={handleGoogleLogin}
            isLoading={isGoogleLoading}
          />

          {hint && (
            <p className={`text-xs font-medium transition-all ${hintConfig[hint].color}`}>
              {hintConfig[hint].text}
            </p>
          )}

          <p className="text-sm text-gray-500 pt-2">
            Hesabınız yok mu?
            <Link href="/signup" className="text-primary font-semibold hover:underline ml-1">
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>

      <div className="h-0" />
      {!showSplash && <Footer />}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
