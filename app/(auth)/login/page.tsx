'use client';

import Link from 'next/link';
import React, { useState, useCallback } from 'react';
import { AuthHeader, GoogleLoginButton, AuthFooter } from '@/components/auth';

export default function LoginPage() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = useCallback(async () => {
    setIsGoogleLoading(true);
    try {
      // Firebase Google Login buraya gelecek
      console.log("Google Login tetiklendi");
      // await signInWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      setIsGoogleLoading(false);
    }
  }, []);

  return (
    <div className="relative flex flex-col justify-between min-h-screen p-6 overflow-hidden bg-black">
      {/* Arka Plan Glow Efekti */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full h-[40%] bg-[radial-gradient(circle,rgba(19,91,236,0.15)_0%,rgba(18,18,18,0)_70%)] pointer-events-none z-0" />

      {/* Branding Section - Top */}
      <AuthHeader 
        title="Welcome Back" 
        subtitle="Log in to your account and continue your journey." 
      />

      {/* Login Actions - Center */}
      <main className="relative z-10 w-full max-w-sm mx-auto space-y-6 text-center">
        <GoogleLoginButton 
          onClick={handleGoogleLogin}
          isLoading={isGoogleLoading}
        />
        
        <p className="text-sm text-gray-500">
          Don't have an account? 
          <Link 
            href="/signup"
            className="text-primary font-semibold hover:underline ml-1"
          >
            Sign up
          </Link>
        </p>
      </main>

      {/* Footer - Bottom */}
      <div className="relative z-10 text-center">
        <AuthFooter brandName="Souvenir" />
      </div>
    </div>
  );
}