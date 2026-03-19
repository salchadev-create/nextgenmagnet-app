import React from 'react';

export const LogoutButton: React.FC<{
  onClick?: () => void | Promise<void>;
  className?: string;
}> = ({ onClick, className = '' }) => {
  const handleClick = async () => {
    if (onClick) {
      try {
        await onClick();
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ${className}`}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      <span>Çıkış Yap</span>
    </button>
  );
};
