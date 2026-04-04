'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

type CheckState = 'loading' | 'redirecting';

export default function ProductEntryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<CheckState>('loading');

  useEffect(() => {
    // Auth yüklenirken bekle
    if (authLoading) return;

    if (!id) {
      router.replace('/error-page?reason=no_id');
      return;
    }

    const checkAndRoute = async () => {
      try {
        const collectionName =
          process.env.NEXT_PUBLIC_COLLECTION_NAME || 'activeTravelProduct';

        const firestore = getDb();
        const docRef = doc(firestore, collectionName, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          router.replace('/error-page?reason=not_found');
          return;
        }

        // ID geçerli — localStorage'a kaydet
        localStorage.setItem('product_id', id);
        setState('redirecting');

        const data = docSnap.data();
        const hasEmail = !!(data?.eMail && String(data.eMail).trim() !== '');
        const storedEmail = hasEmail ? String(data.eMail).trim().toLowerCase() : null;

        if (user) {
          // Zaten giriş yapmış kullanıcı (Senaryo 4)
          if (hasEmail && storedEmail) {
            // Email kayıtlı varsa, kontrol et
            const userEmail = user.email?.trim().toLowerCase() ?? '';
            if (userEmail !== storedEmail) {
              // Email eşleşmiyor → yetkisiz
              localStorage.removeItem('product_id');
              router.replace('/error-page?reason=unauthorized');
              return;
            }
          }
          // Email eşleşiyor veya email kayıtlı değil → dashboard'a git
          router.replace('/');
        } else {
          // Giriş yapılmamış → login'e git (Senaryo 1)
          router.replace(`/login?id=${id}`);
        }
      } catch (err) {
        console.error('Firestore kontrol hatası:', err);
        router.replace('/error-page?reason=connection');
      }
    };

    checkAndRoute();
  }, [id, router, user, authLoading]);

  // Her durumda sadece loading spinner göster, yönlendirme useEffect halleder
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-emerald-500 animate-spin" />
      <p className="text-gray-500 text-sm font-medium">
        {state === 'redirecting' ? 'Yönlendiriliyor...' : 'Kontrol ediliyor...'}
      </p>
    </div>
  );
}
