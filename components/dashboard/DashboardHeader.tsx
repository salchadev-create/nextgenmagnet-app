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
    <div className="bg-gray-800 text-white p-6">
      {/* Top Navigation */}
      <div className="flex justify-between items-center h-8">
        <span className="text-lg font-semibold">Kululu</span>
        <button
          onClick={handleIconClick}
          className="cursor-pointer hover:opacity-75 transition-opacity flex items-center justify-center"
          title={isNotePage ? "Galeriye dön" : "Notlara git"}
        >
          {isNotePage ? (
            <FontAwesomeIcon icon={faImages} size="lg" className="text-white" />
          ) : (
            <FontAwesomeIcon icon={faPenToSquare} size="lg" className="text-white" />
          )}
        </button>
      </div>
    </div>
  );
}
