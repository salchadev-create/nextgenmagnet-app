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
          process.env.NEXT_PUBLIC_COLLECTION_NAME || 'products';

        console.log('=== [id] PAGE DEBUG ===');
        console.log('id param:', id);
        console.log('collectionName:', collectionName);
        console.log('NEXT_PUBLIC_COLLECTION_NAME env:', process.env.NEXT_PUBLIC_COLLECTION_NAME);
        console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID env:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

        const firestore = getDb();
        console.log('firestore instance:', firestore ? `OK (projectId: ${firestore.app.options.projectId}, databaseId: ${(firestore as unknown as {_databaseId?: {databaseId?: string}})._databaseId?.databaseId})` : 'UNDEFINED');

        const docRef = doc(firestore, collectionName, id);
        console.log('docRef path:', docRef.path);

        const docSnap = await getDoc(docRef);
        console.log('docSnap.exists():', docSnap.exists());
        if (docSnap.exists()) {
          console.log('docSnap.data():', docSnap.data());
        }

        if (!docSnap.exists()) {
          router.replace('/error-page?reason=not_found');
          return;
        }

        // ID geçerli — localStorage'a kaydet
        localStorage.setItem('product_id', id);
        setState('redirecting');

        const data = docSnap.data();
        const hasEmail = !!(data?.e_mail && String(data.e_mail).trim() !== '');

        if (user) {
          // Zaten giriş yapmış
          if (hasEmail) {
            // E-mail dolu → direkt dashboard'a git
            router.replace('/');
          } else {
            // E-mail boş → PIN sayfasına git
            router.replace(`/pin?id=${id}`);
          }
        } else {
          // Giriş yapılmamış → her iki durumda da önce login'e git
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
