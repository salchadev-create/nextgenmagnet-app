import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface DashboardHeaderProps {
  onBookIconClick?: () => void;
}

export default function DashboardHeader({ onBookIconClick }: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, userProfile } = useAuth();
  const { bgColor, setBgColor, bgColors } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const isNotePage = pathname === '/note';
  
  // Dışarıya tıklandığında menüyü kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);
  
  const handleIconClick = () => {
    if (isNotePage) {
      router.push('/');
    } else {
      router.push('/note');
      onBookIconClick?.();
    }
  };

  return (
    <div className="sticky top-0 z-50 border-b border-gray-200 shadow-sm p-3" style={{ backgroundColor: bgColor }}>
      {/* Top Navigation */}
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-8 h-8 flex items-center justify-center shrink-0 cursor-pointer hover:opacity-60 transition-opacity"
          >
            <Image
              src="/icons/hamburger.svg"
              alt="Menu"
              width={32}
              height={32}
            />
          </button>
          
          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg min-w-48">
              {/* User Info + Logout */}
              {userProfile && (
                <div className="px-4 py-3 border-b border-gray-100 text-sm flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900">{userProfile.displayName}</div>
                    <div className="text-gray-500 text-xs truncate">{userProfile.email}</div>
                  </div>
                  <button
                    onClick={async () => {
                      setIsMenuOpen(false);
                      setIsLoggingOut(true);
                      try {
                        await logout();
                      } catch (error) {
                        console.error('Logout error:', error);
                      } finally {
                        window.location.href = '/login';
                      }
                    }}
                    disabled={isLoggingOut}
                    title={isLoggingOut ? 'Çıkılıyor...' : 'Çıkış Yap'}
                    className="shrink-0 flex items-center justify-center hover:opacity-60 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed border-0 bg-transparent p-1"
                  >
                    <Image
                      src="/icons/logout.svg"
                      alt="Logout"
                      width={20}
                      height={20}
                    />
                  </button>
                </div>
              )}

              {/* Background Color Picker */}
              <div className="px-4 py-3 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Arka Plan Rengi</p>
                <div className="grid grid-cols-4 gap-2">
                  {bgColors.map((color) => (
                    <button
                      key={color.value}
                      title={color.label}
                      onClick={() => setBgColor(color.value)}
                      className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none"
                      style={{
                        backgroundColor: color.value,
                        borderColor: bgColor === color.value ? '#6366f1' : '#d1d5db',
                        boxShadow: bgColor === color.value ? '0 0 0 2px #6366f1' : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Center Title */}
        <svg width="180" height="35" viewBox="0 0 180 35" className="flex-1 mx-auto">
          <defs>
            {/* <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#002563" />
              <stop offset="25%" stopColor="#004080" />
              <stop offset="50%" stopColor="#2d5a1a" />
              <stop offset="75%" stopColor="#8b4513" />
              <stop offset="100%" stopColor="#8b0000" />
            </linearGradient> */}
          </defs>
          <text x="90" y="24" textAnchor="middle" fill="#000000" fontSize="18" fontWeight="900" letterSpacing="0.5">
            Kapadokya Hatırası
          </text>
        </svg>
        
        {/* Right Icon Button */}
        <div className="flex items-center gap-3 shrink-0">
          
          <button
            onClick={handleIconClick}
            className="cursor-pointer hover:opacity-60 transition-opacity flex items-center justify-center text-gray-600 hover:text-purple-600"
            title={isNotePage ? "Galeriye dön" : "Notlara git"}
          >
            {isNotePage ? (
              <Image
                src="/icons/gallery-icon.svg"
                alt="Gallery"
                width={32}
                height={32}
              />
            ) : (
              <Image
                src="/icons/notes-icon.svg"
                alt="Notes"
                width={32}
                height={32}
              />
            )}
          </button>
          {/* <Image
            src="/icons/logout.svg"
            alt="Logo Icon"
            width={32}
            height={32}
            className="cursor-pointer hover:opacity-60 transition-opacity"
          /> */}
        </div>
      </div>
    </div>
  );
}
