import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Music, Youtube ,Globe} from 'lucide-react';
import logo from '@/app/assets/images/logo.svg';

export default function Footer() {
  return (
    <footer className="text-gray-900 py-4 border-t border-gray-200 w-full bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center">
          {/* Logo */}
          <div className="mb-4">
            <Image src={logo} alt="HappioTag Logo" style={{width: '150px', height: '50px'}} width={120} height={40} />
          </div>

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
              <Youtube size={24} />
            </a>
            <a
              href="https://www.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-purple-500 transition-colors duration-300"
              title="YouTube"
            >
              <Globe size={24} />
            </a>
          </div>
          
          {/* Copyright Text */}
          <p className="text-xs text-gray-500 mt-4">© 2026. HappioTag All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
