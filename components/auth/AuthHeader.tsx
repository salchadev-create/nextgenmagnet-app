import React from 'react';
import Image from 'next/image';
import logo from '@/app/assets/images/logo.svg';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
  dark?: boolean;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle, dark }) => {
  return (
    <header className="relative z-10 flex flex-col items-center text-center">
      <div className="mb-4">
        <Image
          src={logo}
          alt="Souvenir Logo"
          className="w-48 h-24"
          loading="eager"
        />
      </div>
      <h1
        className="text-3xl font-bold tracking-tight mb-2"
        style={{ color: dark ? '#ffffff' : '#000000' }}
      >{title}</h1>
      <p
        className="text-base max-w-70"
        style={{ color: dark ? 'rgba(255,255,255,0.85)' : '#4b5563' }}
      >{subtitle}</p>
    </header>
  );
};
