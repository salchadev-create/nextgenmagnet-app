'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { AuthHeader } from '@/components/auth';
import Footer from '@/components/common/Footer';
import { getDb } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { getOrCreateAppFolder } from '@/lib/googleDrive';

function PinContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const router = useRouter();
  const { user, accessToken } = useAuth();

  const [pin, setPin] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!productId) {
      router.replace('/error-page?reason=no_id');
      return;
    }

    // Sayfa açılınca e_mail dolu mu kontrol et → doluysa direkt anasayfaya git
    const checkEmail = async () => {
      try {
        const firestore = getDb();
        const collectionName = process.env.NEXT_PUBLIC_COLLECTION_NAME || 'products';
        const docSnap = await getDoc(doc(firestore, collectionName, productId));
        if (docSnap.exists()) {
          const data = docSnap.data();
          const hasEmail = !!(data?.e_mail && String(data.e_mail).trim() !== '');
          if (hasEmail) {
            router.replace('/');
          }
        }
      } catch {
        // kontrol başarısız olursa pin sayfasında kalmaya devam et
      }
    };

    checkEmail();
  }, [productId, router]);

  const handleChange = (index: number, value: string) => {
    // Sadece rakam kabul et
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1); // tek karakter al
    setPin(newPin);
    setError(null);

    // Sonraki input'a geç
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // 6 hane dolunca otomatik submit
    const filled = newPin.join('');
    if (filled.length === 6 && newPin.every(d => d !== '')) {
      submitPin(filled);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newPin = pasted.split('');
      setPin(newPin);
      inputRefs.current[5]?.focus();
      submitPin(pasted);
    }
  };

  const submitPin = async (code: string) => {
    if (!productId) return;
    setIsLoading(true);
    setError(null);

    try {
      const firestore = getDb();
      const collectionName = process.env.NEXT_PUBLIC_COLLECTION_NAME || 'products';
      const docSnap = await getDoc(doc(firestore, collectionName, productId));

      if (!docSnap.exists()) {
        setError("✕ Ürün bulunamadı.");
        setIsLoading(false);
        return;
      }

      const data = docSnap.data();
      const correctPin = data?.password as string | undefined;

      if (!correctPin) {
        setError("✕ Bu ürün için parola tanımlanmamış.");
        setIsLoading(false);
        return;
      }

      if (code !== correctPin) {
        setError("✕ Hatalı parola. Lütfen tekrar deneyin.");
        setPin(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        setIsLoading(false);
        return;
      }

      // Parola doğru → giriş yapan kullanıcının e-mail'ini DB'ye yaz
      const userEmail = user?.email;
      if (!userEmail) {
        setError("✕ Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
        setIsLoading(false);
        return;
      }

      // Drive'da "nextgenmagnet" klasörünü oluştur (veya mevcutsa al)
      const token = accessToken ?? (typeof window !== 'undefined' ? localStorage.getItem('google_access_token') : null);
      if (!token) {
        setError("✕ Google Drive erişim izni bulunamadı. Lütfen tekrar giriş yapın.");
        setIsLoading(false);
        return;
      }

      const folderId = await getOrCreateAppFolder(token);

      // e_mail ve folder_id'yi aynı anda DB'ye yaz
      const firestore2 = getDb();
      const collectionName2 = process.env.NEXT_PUBLIC_COLLECTION_NAME || 'products';
      await updateDoc(doc(firestore2, collectionName2, productId), {
        e_mail: userEmail,
        folder_id: folderId,
      });

      // Anasayfaya yönlendir
      router.replace('/');
    } catch (err) {
      console.error('PIN kontrol hatası:', err);
      setError("✕ Bir hata oluştu. Lütfen tekrar deneyin.");
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = pin.join('');
    if (code.length < 6) {
      setError("⚠ Lütfen 6 haneli parolayı eksiksiz girin.");
      return;
    }
    submitPin(code);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-white">
      {showSplash && (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50" />
      )}

      <div
        className={`flex-1 flex flex-col items-center justify-center gap-8 px-6 py-12 transition-opacity duration-500 ${
          showSplash ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <AuthHeader
          title="Parola Girin"
          subtitle="Devam etmek için 6 haneli parolayı girin."
        />

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6 text-center">
          {/* PIN Kutucukları */}
          <div className="flex justify-center gap-3">
            {pin.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                disabled={isLoading}
                className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all
                  ${digit ? 'border-primary text-primary bg-blue-50' : 'border-gray-200 text-gray-900 bg-white'}
                  ${error ? 'border-red-400 animate-shake' : ''}
                  focus:border-primary focus:ring-2 focus:ring-primary/20
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            ))}
          </div>

          {/* Hata Mesajı */}
          {error && (
            <p className="text-xs font-medium text-red-500 transition-all">{error}</p>
          )}

          {/* Submit Butonu */}
          <button
            type="submit"
            disabled={isLoading || pin.join('').length < 6}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm
              hover:bg-blue-700 active:scale-95 transition-all
              disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
              flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Kontrol ediliyor...
              </>
            ) : (
              'Devam Et'
            )}
          </button>
        </form>
      </div>

      {!showSplash && <Footer />}
    </div>
  );
}

export default function PinPage() {
  return (
    <Suspense>
      <PinContent />
    </Suspense>
  );
}
