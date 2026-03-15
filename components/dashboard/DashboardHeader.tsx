import Image from 'next/image';

export default function DashboardHeader() {
  return (
    <div className="bg-black text-white p-6">
      {/* Top Navigation */}
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold">Kululu</span>
        <div className="cursor-pointer hover:opacity-75 transition-opacity">
          <img
            src="/icons/book.png"
            alt="Book icon"
            className="w-6 h-6 brightness-0 invert"
          />
        </div>
      </div>
    </div>
  );
}
