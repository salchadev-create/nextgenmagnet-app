'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useCallback } from 'react';
import { AuthHeader, GoogleLoginButton } from '@/components/auth';
import Footer from '@/components/common/Footer';

export default function LoginPage() {
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
      {/* Header - Logo and Title */}
      <div className="relative z-10 flex flex-col items-center gap-3 w-full max-w-sm pt-24">
        <AuthHeader 
          title="Hoşgeldiniz!" 
          subtitle="Hatıralarınızı magnete sığdırdık..." 
        />
      </div>

      {/* Center - Login Actions */}
      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm">
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

      <Footer />
    </div>
  );
}