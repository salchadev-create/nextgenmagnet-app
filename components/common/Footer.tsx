import Link from 'next/link';
import { Instagram, Music, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white text-gray-900 py-4  border-t border-gray-200 w-full">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          {/* Social Media Icons */}
          <div className="flex gap-6 items-center justify-center">
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-purple-500 transition-colors duration-300"
              title="Instagram"
            >
              <Instagram size={24} />
            </a>
            <a
              href="https://www.tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-purple-500 transition-colors duration-300"
              title="TikTok"
            >
              <Music size={24} />
            </a>
            <a
              href="https://www.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-purple-500 transition-colors duration-300"
              title="YouTube"
            >
              <Youtube size={24} />
            </a>
          </div>
          
          {/* Copyright Text */}
          <p className="text-xs text-gray-500 mt-4">© 2026 NextGenMagnet. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
