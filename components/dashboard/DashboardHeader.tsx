import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImages, faBook ,faPenToSquare} from '@fortawesome/free-solid-svg-icons';
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
    <div className="bg-white border-b border-gray-200 shadow-sm p-3">
      {/* Top Navigation */}
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-lg">K</span>
        </div>
        
        {/* Center Title */}
        <span className="text-lg font-semibold text-gray-900 flex-1 text-center">Kululu</span>
        
        {/* Right Icon Button */}
        <button
          onClick={handleIconClick}
          className="cursor-pointer hover:opacity-60 transition-opacity flex items-center justify-center text-gray-600 hover:text-purple-600 shrink-0"
          title={isNotePage ? "Galeriye dön" : "Notlara git"}
        >
          {isNotePage ? (
            <FontAwesomeIcon icon={faImages} size="lg" />
          ) : (
            <FontAwesomeIcon icon={faPenToSquare} size="lg" />
          )}
        </button>
      </div>
    </div>
  );
}
