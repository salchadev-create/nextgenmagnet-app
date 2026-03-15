import React from 'react';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="relative z-10 mt-16 flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-primary rounded-theme flex items-center justify-center mb-8 shadow-lg shadow-primary/20">
        <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">{title}</h1>
      <p className="text-gray-400 text-base max-w-[280px]">{subtitle}</p>
    </header>
  );
};
