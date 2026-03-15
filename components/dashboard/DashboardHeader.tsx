import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface DashboardHeaderProps {
  onBookIconClick?: () => void;
}

export default function DashboardHeader({ onBookIconClick }: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const isNotePage = pathname === '/note';
  
  const handleIconClick = () => {
    if (isNotePage) {
      router.push('/');
    } else {
      router.push('/note');
      onBookIconClick?.();
    }
  };

  return (
    <div className="bg-gray-800 text-white p-6">
      {/* Top Navigation */}
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold">Kululu</span>
        <button
          onClick={handleIconClick}
          className="cursor-pointer hover:opacity-75 transition-opacity p-2"
          title={isNotePage ? "Galeriye dön" : "Notlara git"}
        >
          {isNotePage ? (
            // Gallery Icon
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          ) : (
            // Book Icon
            <img
              src="/icons/book.png"
              alt="Book icon"
              className="w-6 h-6 brightness-0 invert"
            />
          )}
        </button>
      </div>
    </div>
  );
}
