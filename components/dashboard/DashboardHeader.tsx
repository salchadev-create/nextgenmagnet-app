import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import { useState, useRef, useEffect } from 'react';

interface DashboardHeaderProps {
  onBookIconClick?: () => void;
}

export default function DashboardHeader({ onBookIconClick }: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm p-3">
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
            <div className="absolute left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg min-w-32">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  // Logout işlemi burada yapılacak
                  router.push('/login');
                }}
                className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors text-gray-700 hover:text-purple-600 border-0"
              >
                <Image
                  src="/icons/logout.svg"
                  alt="Logout"
                  width={20}
                  height={20}
                />
                <span className="text-sm font-medium">Çıkış Yap</span>
              </button>
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
