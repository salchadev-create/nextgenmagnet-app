'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEllipsisV ,faEllipsis,faXmark } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import Footer from '@/components/common/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { getOrCreateAppFolder, uploadFileToDrive } from '@/lib/googleDrive';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, accessToken } = useAuth();
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragStart, setDragStart] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Loading seçili değilse ve user yok ise, login sayfasına yönlendir
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // 2.5 saniye sonra splash screen'i gizle
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    // Önce local preview için base64'e çevir
    const fileArray = Array.from(files);
    const previewPromises = fileArray.map(
      (file) =>
        new Promise<{ dataUrl: string; file: File }>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) =>
            resolve({ dataUrl: ev.target?.result as string, file });
          reader.readAsDataURL(file);
        })
    );

    const previews = await Promise.all(previewPromises);
    // Ekranda hemen göster
    setUploadedPhotos((prev) => [...prev, ...previews.map((p) => p.dataUrl)]);

    // Google Drive'a yükle
    try {
      const token = accessToken ?? localStorage.getItem('google_access_token');
      if (!token) {
        setUploadError('Google Drive erişim izni bulunamadı. Lütfen tekrar giriş yapın.');
        setIsUploading(false);
        return;
      }

      const folderId = await getOrCreateAppFolder(token);

      for (const { file } of previews) {
        await uploadFileToDrive(token, file, folderId);
      }

      setShowUploadSuccess(true);
      setTimeout(() => setShowUploadSuccess(false), 3000);
    } catch (err: unknown) {
      console.error('Drive yükleme hatası:', err);
      const message = err instanceof Error ? err.message : String(err);
      setUploadError(`Drive yükleme başarısız: ${message}`);
      setTimeout(() => setUploadError(null), 5000);
    } finally {
      setIsUploading(false);
      // Input'u temizle ki aynı dosya tekrar seçilebilsin
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Slideshow effect
  useEffect(() => {
    if (uploadedPhotos.length === 0) return;

    const interval = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % uploadedPhotos.length);
    }, 3000); // Change photo every 3 seconds

    return () => clearInterval(interval);
  }, [uploadedPhotos.length]);

  const displayPhoto = uploadedPhotos.length > 0 ? uploadedPhotos[currentPhotoIndex] : '/images/seyehat.png';

  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedPhotoIndex(null);
    setShowMenu(false);
  };

  const handleNextPhoto = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex + 1) % uploadedPhotos.length);
      setShowMenu(false);
    }
  };

  const handleDeletePhoto = () => {
    if (selectedPhotoIndex !== null) {
      const newPhotos = uploadedPhotos.filter((_, index) => index !== selectedPhotoIndex);
      setUploadedPhotos(newPhotos);
      setShowMenu(false);
      setShowDeleteSuccess(true);
      setTimeout(() => setShowDeleteSuccess(false), 3000);

      // Close modal or go to previous photo
      if (newPhotos.length === 0) {
        setSelectedPhotoIndex(null);
      } else if (selectedPhotoIndex >= newPhotos.length) {
        setSelectedPhotoIndex(selectedPhotoIndex - 1);
      }
    }
  };

  const handlePrevPhoto = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex - 1 + uploadedPhotos.length) % uploadedPhotos.length);
    }
  };

  // Handle swipe/drag navigation
  const handleMouseDown = (e: React.MouseEvent) => {
    if (selectedPhotoIndex === null) return;
    setIsDragging(true);
    setDragStart(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || selectedPhotoIndex === null) return;
    setIsDragging(false);
    
    const dragEnd = e.clientX;
    const diff = dragStart - dragEnd;

    // If dragged more than 50px, change photo
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Dragged left, show next photo
        handleNextPhoto();
      } else {
        // Dragged right, show previous photo
        handlePrevPhoto();
      }
    }
  };

  // Handle touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (selectedPhotoIndex === null) return;
    setIsDragging(true);
    setDragStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging || selectedPhotoIndex === null) return;
    setIsDragging(false);
    
    const dragEnd = e.changedTouches[0].clientX;
    const diff = dragStart - dragEnd;

    // If swiped more than 50px, change photo
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swiped left, show next photo
        handleNextPhoto();
      } else {
        // Swiped right, show previous photo
        handlePrevPhoto();
      }
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;
      
      if (e.key === 'ArrowRight') handleNextPhoto();
      if (e.key === 'ArrowLeft') handlePrevPhoto();
      if (e.key === 'Escape') handleCloseModal();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex]);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div
      className="flex flex-col h-screen bg-white"
      initial={{ y: '-100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '-100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200, duration: 0.5 }}
    >
      {/* Splash Screen - World Travel GIF */}
      {showSplash && (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
          <div className="flex flex-col items-center gap-4 bg-white rounded-lg p-8">
            <img 
              src="/gifs/world_travel.gif" 
              alt="Loading..." 
              className="w-48 h-48 bg-white"
            />
          </div>
        </div>
      )}

      <div className={`transition-opacity duration-500 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        <DashboardHeader />
      </div>
      
      {/* Scrollable Content Section - Photo + Gallery */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full h-3/4 bg-gray-200">
          <img
            src={displayPhoto}
            alt="Slideshow photo"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Upload & Gallery Section */}
        <div className="px-1 py-1">
          <div className="grid grid-cols-3 gap-1 px-1 py-1">
            {/* Uploaded Photos */}
            {uploadedPhotos.map((photo, index) => (
              <div
                key={index}
                className="aspect-square rounded-none overflow-hidden cursor-pointer hover:opacity-80 transition"
                onClick={() => handlePhotoClick(index)}
              >
                <img
                  src={photo}
                  alt={`Uploaded photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            
            {/* Upload Box - Inside Grid */}
            <div
              onClick={!isUploading ? handleUploadClick : undefined}
              className={`aspect-square border-2 border-dashed rounded-none flex flex-col items-center justify-center transition ${
                isUploading
                  ? 'border-blue-300 bg-blue-50 cursor-wait'
                  : 'border-gray-300 cursor-pointer hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin w-6 h-6 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span className="text-xs text-blue-500 font-semibold text-center px-1">Drive'a yükleniyor...</span>
                </>
              ) : (
                <>
                  <Image src="/icons/upload.svg" alt="Upload" width={24} height={24} className="mb-2" />
                  <span className="text-xs text-gray-500 font-semibold">Fotoğraf Yükle</span>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>
        <div className='px-6 mt-16'>
          <Footer />
        </div>
      
      </div>

      {/* Photo Modal */}
      {selectedPhotoIndex !== null && (
        <div 
          className="fixed inset-0 z-50 flex flex-col overflow-hidden" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
          onClick={handleCloseModal}
        >
          {/* Top Bar */}
          <div className="flex justify-between items-center p-3 relative shrink-0" style={{ backgroundColor: 'transparent' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleCloseModal}
              className="text-white text-2xl hover:opacity-75 transition"
            >
              <FontAwesomeIcon icon={faXmark} size="sm" />
            </button>
            <span className="text-white text-sm">
              {selectedPhotoIndex + 1} of {uploadedPhotos.length}
            </span>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-white text-2xl hover:opacity-75 transition"
              >
                <FontAwesomeIcon icon={faEllipsis} size="sm" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-12 bg-gray-800 rounded shadow-lg z-10" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={handleDeletePhoto}
                    className="w-full text-left px-6 py-3 text-gray-300 hover:bg-gray-800 transition text-sm font-medium flex items-center gap-2"
                  >
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z" />
                    </svg>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Photo Display */}
          <div
            className="flex-1 flex items-center justify-center cursor-grab active:cursor-grabbing select-none overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setIsDragging(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={uploadedPhotos[selectedPhotoIndex]}
              alt={`Photo ${selectedPhotoIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              draggable="false"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Bottom Bar with Actions */}
          <div className="flex justify-end items-end p-6 shrink-0" style={{ backgroundColor: 'transparent' }} onClick={(e) => e.stopPropagation()}>
            <button className="flex items-center justify-center text-white bg-gray-800 hover:opacity-75 transition p-3 rounded">
              <i className="fas fa-download text-lg"></i>
            </button>
          </div>

          {/* Delete Success Toast - Inside Modal */}
          {showDeleteSuccess && (
            <motion.div
              className="absolute bottom-6 right-6 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Fotoğraf başarıyla silindi!</span>
            </motion.div>
          )}
        </div>
      )}

      {/* Upload Success Toast */}
      {showUploadSuccess && (
        <motion.div
          className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Fotoğraf Drive'a yüklendi!</span>
        </motion.div>
      )}

      {/* Upload Error Toast */}
      {uploadError && (
        <motion.div
          className="fixed bottom-6 left-6 right-6 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{uploadError}</span>
        </motion.div>
      )}

      
    </motion.div>
  );
}
