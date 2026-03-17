import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faTiktok, faYoutube } from '@fortawesome/free-brands-svg-icons';

export default function Footer() {
  return (
    <footer className="bg-white text-white py-4 mt-auto border-t border-gray-200">
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
              <FontAwesomeIcon icon={faInstagram} size="lg" />
            </a>
            <a
              href="https://www.tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-purple-500 transition-colors duration-300"
              title="TikTok"
            >
              <FontAwesomeIcon icon={faTiktok} size="lg" />
            </a>
            <a
              href="https://www.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-purple-500 transition-colors duration-300"
              title="YouTube"
            >
              <FontAwesomeIcon icon={faYoutube} size="lg" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
