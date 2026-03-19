'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useCallback, useEffect } from 'react';
import { AuthHeader, GoogleLoginButton } from '@/components/auth';
import Footer from '@/components/common/Footer';

export default function LoginPage() {
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // 2.5 saniye sonra splash screen'i gizle
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleGoogleLogin = useCallback(async () => {
    setIsGoogleLoading(true);
    try {
      // Firebase Google Login buraya gelecek
      console.log("Google Login tetiklendi");
      // await signInWithGoogle();
      
      // Google login başarılıysa anasayfaya yönlendir
      router.push('/');
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      setIsGoogleLoading(false);
    }
  }, [router]);

  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen p-6 bg-white">
      {/* Splash Screen - Walking GIF */}
      {showSplash && (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
          <div className="flex flex-col items-center gap-4 bg-white rounded-lg p-8">
            <img 
              src="/gifs/world_travel.gif" 
              alt="Loading..." 
              className="w-48 h-48 bg-white"
            />
          </div>
        </div>
      )}

      {/* Header - Logo and Title */}
      <div className={`relative z-10 flex flex-col items-center gap-3 w-full max-w-sm pt-24 transition-opacity duration-500 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        <AuthHeader 
          title="Hoşgeldiniz!" 
          subtitle="Hatıralarınızı magnete sığdırdık..." 
        />
      </div>

      {/* Center - Login Actions */}
      <div className={`relative z-10 flex flex-col items-center gap-6 w-full max-w-sm transition-opacity duration-500 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        <div className="w-full space-y-6 text-center">
          <GoogleLoginButton 
            onClick={handleGoogleLogin}
            isLoading={isGoogleLoading}
          />
          
          <p className="text-sm text-gray-500">
            Hesabınız yok mu? 
            <Link 
              href="/signup"
              className="text-primary font-semibold hover:underline ml-1"
            >
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>

      {/* Bottom Spacer */}
      <div className="h-0" />

      {!showSplash && <Footer />}
    </div>
  );
}