import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithPopup,
  GoogleAuthProvider,
  User,
  Auth,
  OAuthCredential,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthResult {
  user: User | null;
  isNewUser: boolean;
  accessToken: string | null;
}

export const useGoogleAuth = () => {
  const router = useRouter();

  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    try {
      if (!auth || !db) {
        throw new Error('Firebase not initialized');
      }

      const provider = new GoogleAuthProvider();
      // Google Drive dosya erişim izni
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      
      // Google Sign-In popup'ı aç
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Google OAuth access token'ını al (Drive için)
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken ?? null;

      // Access token'ı localStorage'da sakla
      if (accessToken) {
        localStorage.setItem('google_access_token', accessToken);
      }

      // Kullanıcı bilgilerini Firestore'da kontrol et
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      let isNewUser = false;

      // Eğer kullanıcı yeni ise, Firestore'da kaydet
      if (!userDoc.exists()) {
        isNewUser = true;
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Mevcut kullanıcı ise lastLogin'i güncelle
        await setDoc(
          userDocRef,
          {
            updatedAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      return { user, isNewUser, accessToken };
    } catch (error) {
      console.error('Google Sign-In error:', error);
      throw error;
    }
  }, []);

  const handleGoogleLogin = useCallback(async () => {
    try {
      const result = await signInWithGoogle();
      
      // Başarılı login sonrası dashboard'a yönlendir
      router.push('/');
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [signInWithGoogle, router]);

  return {
    signInWithGoogle,
    handleGoogleLogin,
  };
};
