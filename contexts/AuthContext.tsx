'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut, Auth } from 'firebase/auth';
import { getFirebaseAuth, getDb } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  accessToken: string | null;
  productLocation: string | null;
  setProductLocation: (location: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [productLocation, setProductLocation] = useState<string | null>(null);

  // localStorage'daki token'ı başlangıçta oku
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('google_access_token');
      if (token) setAccessToken(token);
    }
  }, []);

  useEffect(() => {
    const firebaseAuth = getFirebaseAuth();

    const unsubscribe = onAuthStateChanged(firebaseAuth as Auth, async (currentUser) => {
      try {
        if (currentUser) {
          setUser(currentUser);

          // Firestore'dan kullanıcı profili getir
          const firestore = getDb();
          const userDocRef = doc(firestore, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          } else {
            // Fallback profil oluştur
            setUserProfile({
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
            });
          }
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(getFirebaseAuth() as Auth);
      setUser(null);
      setUserProfile(null);
      setAccessToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('google_access_token');
        localStorage.removeItem('product_id');
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        logout,
        isAuthenticated: !!user,
        accessToken,
        productLocation,
        setProductLocation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
