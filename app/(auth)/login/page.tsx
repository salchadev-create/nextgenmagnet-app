'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { AuthHeader, GoogleLoginButton } from '@/components/auth';
import Footer from '@/components/common/Footer';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { getDb, getFirebaseAuth } from '@/lib/firebase';

type ButtonHint = null | 'no_id' | 'checking' | 'not_found' | 'wrong_email'; // | 'found'

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

      // 3. E-mail kontrolü
      const data = docSnap.data();
      const hasEmail = !!(data?.e_mail && String(data.e_mail).trim() !== '');
      const storedEmail = hasEmail ? String(data.e_mail).trim().toLowerCase() : null;

      // 4. ID geçerli → Google ile giriş yap
      setHint(null);
      localStorage.setItem('product_id', productId);
      const authResult = await signInWithGoogle();

      // 5. E-mail dolu ise → giriş yapan kullanıcının e-maili eşleşiyor mu kontrol et
      if (hasEmail && storedEmail) {
        const loginEmail = authResult?.user?.email?.trim().toLowerCase() ?? '';
        if (loginEmail !== storedEmail) {
          // Eşleşmiyor → oturumu kapat, uyarı göster
          const firebaseAuth = getFirebaseAuth();
          await signOut(firebaseAuth);
          localStorage.removeItem('google_access_token');
          localStorage.removeItem('product_id');
          setHint('wrong_email');
          setIsGoogleLoading(false);
          return;
        }
      }

      // 6. Giriş başarılı → e-mail durumuna göre yönlendir
      if (hasEmail) {
        // E-mail dolu → direkt anasayfaya git
        router.replace('/');
      } else {
        // E-mail boş → PIN sayfasına git
        router.replace(`/pin?id=${productId}`);
      }
    } catch (err) {
      console.error('Login hatası:', err);
      setHint(null);
      setIsGoogleLoading(false);
    }
  };

  const hintConfig: Record<Exclude<ButtonHint, null>, { text: string; color: string }> = {
    no_id:       { text: '⚠ Giriş için geçerli bir ürün bağlantısı gerekli.', color: 'text-amber-500' },
    checking:    { text: '🔍 Ürün kontrol ediliyor...', color: 'text-gray-400' },
    not_found:   { text: "✕ Bu ID'ye ait ürün bulunamadı.", color: 'text-red-500' },
    wrong_email: { text: '✕ Bu ürün başka bir e-posta adresiyle kayıtlı. Lütfen farklı bir mail adresi ile deneyiniz.', color: 'text-red-500' },
    // found:     { text: '✓ Ürün doğrulandı, giriş yapılıyor...', color: 'text-emerald-500' },
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-white">
      {showSplash && (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50" />
      )}

      {/* İçerik alanı — flex-1 ile footer'ı aşağıya iter */}
      <div className={`flex-1 flex flex-col items-center justify-center gap-8 px-6 py-12 transition-opacity duration-500 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        <AuthHeader
          title="Hoşgeldiniz!"
          subtitle="Hatıralarınızı magnete sığdırdık..."
        />

        <div className="w-full max-w-sm space-y-3 text-center">
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
            <a href="https://accounts.google.com/signup" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline ml-1">
              Kayıt Ol
            </a>
          </p>
        </div>
      </div>

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
