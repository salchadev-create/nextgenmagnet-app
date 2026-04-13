'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { AuthHeader, GoogleLoginButton } from '@/components/auth';
import Footer from '@/components/common/Footer';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { getDb, getFirebaseAuth } from '@/lib/firebase';
import cumalikizikBg from '@/app/assets/images/cumalikizik/background.png';
import ayvalikBg from '@/app/assets/images/ayvalik/background.png';

type ButtonHint = null | 'no_id' | 'checking' | 'not_found';

const LOCATION_BACKGROUNDS: Record<string, string> = {
  'cumalıkızık': cumalikizikBg.src ?? (cumalikizikBg as unknown as string),
  'ayvalık': ayvalikBg.src ?? (ayvalikBg as unknown as string),
};

function LoginContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const router = useRouter();

  const { signInWithGoogle } = useGoogleAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [hint, setHint] = useState<ButtonHint>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [firestoreDone, setFirestoreDone] = useState(false);

  // Sayfa açıldığında otomatik olarak ürün kontrolü yap
  useEffect(() => {
    const checkProductOnPageLoad = async () => {
      if (!productId) {
        setHint('no_id');
        setFirestoreDone(true);
        return;
      }

      setHint('checking');
      
      // Timeout ile hata kontrolü (10 saniye)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), 10000)
      );

      try {
        const firestore = getDb();
        const collectionName = process.env.NEXT_PUBLIC_COLLECTION_NAME || 'activeTravelProduct';
        
        // Timeout ile beraber getDoc yapıştır
        const docSnap = await Promise.race([
          getDoc(doc(firestore, collectionName, productId)),
          timeoutPromise
        ]) as any;

        if (!docSnap.exists()) {
          console.log('Ürün bulunamadı:', productId);
          setHint('not_found');
        } else {
          console.log('Ürün bulundu:', productId);
          // Ürün bulundu, hint'i temizle
          setHint(null);
          // location kontrolü → arkaplan belirle
          const data = docSnap.data();
          const location: string = (data?.location ?? '').toLowerCase().trim();
          const bg = LOCATION_BACKGROUNDS[location] ?? null;
          console.log('[BG DEBUG] location:', JSON.stringify(location), '| bg:', bg, '| map:', LOCATION_BACKGROUNDS);
          setBackgroundImage(bg);
        }
      } catch (err) {
        console.error('Ürün kontrol hatası:', err);
        setHint('not_found');
      } finally {
        setFirestoreDone(true);
      }
    };

    checkProductOnPageLoad();
  }, [productId]);

  // Firestore bittikten sonra splash'ı kaldır (min 800ms göster)
  useEffect(() => {
    if (!firestoreDone) return;
    const timer = setTimeout(() => setShowSplash(false), 300);
    return () => clearTimeout(timer);
  }, [firestoreDone]);

  // Firestore 3 saniyeden uzun sürerse splash'ı yine de kaldır
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleLogin = async () => {
    // Ürün kontrol başarısız ise işlemi durdur
    if (hint === 'not_found' || hint === 'no_id') {
      return;
    }

    setIsGoogleLoading(true);

    // Timeout ile hata kontrolü (15 saniye)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Operation timeout')), 15000)
    );

    try {
      // ID yoksa → butona mesaj bas, işlemi durdur
      if (!productId) {
        setHint('no_id');
        setIsGoogleLoading(false);
        return;
      }

      // 2. Ürün verilerini getir
      const firestore = getDb();
      const collectionName = process.env.NEXT_PUBLIC_COLLECTION_NAME || 'activeTravelProduct';
      
      const docSnap = await Promise.race([
        getDoc(doc(firestore, collectionName, productId)),
        timeoutPromise
      ]) as any;

      if (!docSnap.exists()) {
        setHint('not_found');
        setIsGoogleLoading(false);
        return;
      }

      // 3. E-mail kontrolü
      const data = docSnap.data();
      const hasEmail = !!(data?.eMail && String(data.eMail).trim() !== '');
      const storedEmail = hasEmail ? String(data.eMail).trim().toLowerCase() : null;

      // 4. Google ile giriş yap
      setHint(null);
      localStorage.setItem('product_id', productId);
      
      const authResult = await Promise.race([
        signInWithGoogle(),
        timeoutPromise
      ]) as any;

      // 5. E-mail dolu ise → giriş yapan kullanıcının e-maili eşleşiyor mu kontrol et
      if (hasEmail && storedEmail) {
        const loginEmail = authResult?.user?.email?.trim().toLowerCase() ?? '';
        if (loginEmail !== storedEmail) {
          // Eşleşmiyor → oturumu kapat, error page'e yönlendir (Senaryo 3)
          const firebaseAuth = getFirebaseAuth();
          await signOut(firebaseAuth);
          localStorage.removeItem('google_access_token');
          localStorage.removeItem('product_id');
          setIsGoogleLoading(false);
          router.replace('/error-page?reason=unauthorized');
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

  const hintConfig: Record<Exclude<ButtonHint, null>, { text: string; color: string; darkColor: string }> = {
    no_id:       { text: '⚠ Giriş için geçerli bir ürün bağlantısı gerekli.', color: 'text-amber-500', darkColor: 'text-amber-300' },
    checking:    { text: '🔍 Ürün kontrol ediliyor...', color: 'text-gray-400', darkColor: 'text-white/70' },
    not_found:   { text: "✕ Bu ID'ye ait ürün bulunamadı.", color: 'text-red-500', darkColor: 'text-red-300' },
  };

  return (
    <div
      className={`relative flex flex-col min-h-screen ${backgroundImage ? '' : 'bg-white'}`}
      style={
        backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }
          : undefined
      }
    >
      {showSplash && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={backgroundImage ? {
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : { backgroundColor: 'white' }} />
      )}

      {/* Arkaplan görseli varken karartma overlay */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-black/60 z-0" />
      )}

      {/* İçerik alanı — flex-1 ile footer'ı aşağıya iter */}
      <div className={`relative z-10 flex-1 flex flex-col items-center justify-center gap-8 px-6 py-12 transition-opacity duration-500 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        <AuthHeader
          title="Hoşgeldiniz!"
          subtitle="Hatıralarınızı magnete sığdırdık..."
          dark={!!backgroundImage}
        />

        <div className="w-full max-w-sm space-y-3 text-center">
          <GoogleLoginButton
            onClick={handleGoogleLogin}
            isLoading={isGoogleLoading}
          />

          {hint && (
            <p className={`text-xs font-medium transition-all ${backgroundImage ? hintConfig[hint].darkColor : hintConfig[hint].color}`}>
              {hintConfig[hint].text}
            </p>
          )}

          <p
            className="text-sm pt-2"
            style={{ color: backgroundImage ? 'rgba(255,255,255,0.85)' : '#6b7280' }}
          >
            Hesabınız yok mu?
            <a
              href="https://accounts.google.com/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:underline ml-1"
              style={{ color: backgroundImage ? '#ffffff' : 'var(--color-primary, #6366f1)' }}
            >
              Kayıt Ol
            </a>
          </p>
        </div>
      </div>

      {!showSplash && (
        <div className={`relative z-10 w-full ${backgroundImage ? '[&_footer]:bg-transparent [&_footer]:border-white/20 [&_footer]:text-white [&_footer_p]:text-white/70 [&_footer_a]:text-white/70 [&_footer_svg]:text-white/70' : ''}`}>
          <Footer hideLogo />
        </div>
      )}
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
