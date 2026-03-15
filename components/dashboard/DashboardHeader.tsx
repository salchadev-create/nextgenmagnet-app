import Image from 'next/image';
import Link from 'next/link';

interface DashboardHeaderProps {
  onBookIconClick?: () => void;
}

export default function DashboardHeader({ onBookIconClick }: DashboardHeaderProps) {
  return (
    <div className="bg-gray-800 text-white p-6">
      {/* Top Navigation */}
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold">Kululu</span>
        <Link
          href="/note"
          className="cursor-pointer hover:opacity-75 transition-opacity"
        >
          <img
            src="/icons/book.png"
            alt="Book icon"
            className="w-6 h-6 brightness-0 invert"
          />
        </Link>
      </div>
    </div>
  );
}
