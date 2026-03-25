'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { AuthHeader, GoogleLoginButton } from '@/components/auth';
import Footer from '@/components/common/Footer';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

export default function LoginPage() {
  const { handleGoogleLogin: handleGoogleLoginFromHook } = useGoogleAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 2.5 saniye sonra splash screen'i gizle
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      await handleGoogleLoginFromHook();
    } catch (error) {
      console.error('Google login error:', error);
      setError(error instanceof Error ? error.message : 'Giriş yapılırken bir hata oluştu');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen p-6 bg-white">
      {/* Splash Screen - Walking GIF */}
      {showSplash && (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
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
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
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