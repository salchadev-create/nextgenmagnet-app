import React from 'react';
import Image from 'next/image';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="relative z-10 flex flex-col items-center text-center">
      <div className="mb-3">
        <Image
          src="/images/logo.svg"
          alt="Souvenir Logo"
          width={64}
          height={64}
          className="w-32 h-32"
        />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2 text-black">{title}</h1>
      <p className="text-gray-600 text-base max-w-[280px]">{subtitle}</p>
    </header>
  );
};
