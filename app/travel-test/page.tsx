'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faXmark } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import Footer from '@/components/common/Footer';

type LocalPhoto = {
  id: string;
  name: string;
  src: string;
};

const STATIC_PHOTOS: LocalPhoto[] = [
  { id: 'g1', name: 'Fotoğraf 1', src: '/images/travel-photos/g1.jpg' },
  { id: 'g2', name: 'Fotoğraf 2', src: '/images/travel-photos/g2.jpg' },
  { id: 'g3', name: 'Fotoğraf 3', src: '/images/travel-photos/g3.jpg' },
  { id: 'g4', name: 'Fotoğraf 4', src: '/images/travel-photos/g4.jpg' },
  { id: 'g5', name: 'Fotoğraf 5', src: '/images/travel-photos/g5.jpg' },
  { id: 'g6', name: 'Fotoğraf 6', src: '/images/travel-photos/g6.jpg' },
  { id: 'g7', name: 'Fotoğraf 7', src: '/images/travel-photos/g7.jpg' },
  { id: 'g8', name: 'Fotoğraf 8', src: '/images/travel-photos/g8.jpg' },
  { id: 'g9', name: 'Fotoğraf 9', src: '/images/travel-photos/g9.jpg' },
  { id: 'g10', name: 'Fotoğraf 10', src: '/images/travel-photos/g10.jpg' },
  { id: 'g11', name: 'Fotoğraf 11', src: '/images/travel-photos/g11.jpg' },
  { id: 'g12', name: 'Fotoğraf 12', src: '/images/travel-photos/g12.jpg' },
];

// ─── Note Test ─────────────────────────────────────────────────────────────

const DEFAULT_NOTE = {
  heroImage: '/images/travel-photos/g1.jpg',
  title: 'Amalfi Kıyılarında\nBir Yolculuk',
  dateRange: '14 May 2026',
  location: 'Positano, İtalya',
  pullquote: '"Dünya bir kitaptır ve gezmeyenler sadece bir sayfasını okurlar."',
  body: 'Sorrentine Yarımadası\'nın engebeli kıyılarından geçen yolculuğumuz bir rüya gibiydi. Akdeniz\'in pastel tonlardaki cephelerini yumuşatça aydınlatan sabah ışığına uyandık; kelimelerin anlatmaya yetişemeyeceği anlardı bunlar.\n\nÖğleden sonralarımızı labirent gibi çıkmaçlarda kaybolarak geçirdik; gizli trattoria\'lardan taze makarna kokuları süzülürken antik taş duvarları sardıran bougainvillea\'ların canlı renkleri bizi büyüledi.',
};

const LS_KEY = 'travel_test_note';

function NoteTestPanel() {
  const [entry, setEntry] = useState(DEFAULT_NOTE);
  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState({ ...DEFAULT_NOTE });
  const [showSuccess, setShowSuccess] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setEntry(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleEdit = () => {
    setEditFields({ ...entry });
    setIsEditing(true);
  };

  const handleCancel = () => setIsEditing(false);

  const handleSave = () => {
    if (!editFields.body.trim()) return;
    setEntry({ ...editFields });
    localStorage.setItem(LS_KEY, JSON.stringify(editFields));
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto relative">
      {/* Hero Image */}
      <div className="px-2 pt-2">
        <div className="relative w-full overflow-hidden rounded-2xl" style={{ height: '220px' }}>
          <img src={entry.heroImage} alt="Kapak" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.35) 100%)' }} />
        </div>
      </div>

      {/* Article Card */}
      <div className="px-4 pt-4 pb-10 bg-white">
        {/* Title + Edit */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <h1
            className="text-2xl font-bold text-gray-900 leading-snug"
            style={{ fontFamily: 'var(--font-comfortaa), sans-serif', whiteSpace: 'pre-line' }}
          >
            {entry.title}
          </h1>
          <button
            onClick={handleEdit}
            className="shrink-0 p-2 rounded-full hover:bg-gray-100 transition"
            title="Düzenle"
          >
            <img src="/icons/edit.svg" alt="Düzenle" className="w-7 h-7" />
          </button>
        </div>

        {/* Meta Row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-6 text-xs text-gray-500">
          <span className="flex items-center gap-1 leading-none">
            <svg className="w-3.5 h-3.5 shrink-0 -translate-y-px" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {entry.dateRange}
          </span>
          <span className="flex items-center gap-1 leading-none">
            <svg className="w-3.5 h-3.5 shrink-0 -translate-y-px" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            {entry.location}
          </span>
        </div>

        {/* Pullquote */}
        <blockquote
          className="italic text-gray-600 text-sm leading-relaxed mb-6 text-center px-2"
          style={{ fontFamily: 'var(--font-comfortaa), sans-serif', fontSize: '0.92rem' }}
        >
          {entry.pullquote}
        </blockquote>

        {/* Divider */}
        <div className="flex items-center justify-center mb-6">
          <span className="w-8 h-px bg-gray-300 block" />
          <span className="mx-3 text-gray-300 text-lg">✦</span>
          <span className="w-8 h-px bg-gray-300 block" />
        </div>

        {/* Body */}
        <div
          className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap"
          style={{ fontFamily: 'var(--font-comfortaa), sans-serif', lineHeight: '1.85' }}
        >
          {entry.body}
        </div>
      </div>

      {/* Footer */}
      <div className="px-2 bg-white">
        <Footer />
      </div>

      {/* Edit Bottom Sheet */}
      <AnimatePresence>
        {isEditing && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancel}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl flex flex-col"
              style={{ height: '65vh' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.3 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 80 || info.velocity.y > 400) handleCancel();
              }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1 rounded-full bg-gray-300" />
              </div>
              {/* Sheet Header */}
              <div className="px-5 h-11 flex justify-between items-center border-b border-gray-100 shrink-0">
                <button onClick={handleCancel} className="text-sm text-gray-500 hover:text-gray-800 transition font-medium">
                  İptal
                </button>
                <span className="text-sm font-semibold text-gray-700">Notu Düzenle</span>
                <button
                  onClick={handleSave}
                  disabled={!editFields.body.trim()}
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-800 transition disabled:opacity-40"
                >
                  Kaydet
                </button>
              </div>
              {/* Textarea */}
              <div className="flex-1 px-5 py-4 overflow-hidden">
                <textarea
                  autoFocus
                  value={editFields.body}
                  onChange={(e) => setEditFields({ ...editFields, body: e.target.value })}
                  onPointerDownCapture={(e) => e.stopPropagation()}
                  className="w-full h-full rounded-xl px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none resize-none leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-comfortaa), sans-serif',
                    lineHeight: '1.85',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    border: '1.5px solid #E65100',
                  }}
                  placeholder="Gezi yazınızı buraya yazın…"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-sm z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Not kaydedildi! (localStorage)</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function TravelTestPage() {
  const [activeTab, setActiveTab] = useState<'gallery' | 'note'>('gallery');  const [photos, setPhotos] = useState<LocalPhoto[]>(STATIC_PHOTOS);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const [modalDirection, setModalDirection] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Slideshow effect
  useEffect(() => {
    if (photos.length === 0) return;
    const interval = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [photos.length]);

  const displayPhoto = photos.length > 0 ? photos[currentPhotoIndex].src : '/images/seyehat.png';
  const displayPhotoKey = photos.length > 0 ? photos[currentPhotoIndex].id : 'default';

  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedPhotoIndex(null);
    setShowDeleteConfirm(false);
  };

  const handleNextPhoto = () => {
    if (selectedPhotoIndex !== null) {
      setModalDirection(1);
      setSelectedPhotoIndex((selectedPhotoIndex + 1) % photos.length);
    }
  };

  const handlePrevPhoto = () => {
    if (selectedPhotoIndex !== null) {
      setModalDirection(-1);
      setSelectedPhotoIndex((selectedPhotoIndex - 1 + photos.length) % photos.length);
    }
  };

  const handleDeletePhoto = () => {
    if (selectedPhotoIndex === null) return;
    const newPhotos = photos.filter((_, i) => i !== selectedPhotoIndex);
    setPhotos(newPhotos);
    if (newPhotos.length === 0) {
      setSelectedPhotoIndex(null);
    } else if (selectedPhotoIndex >= newPhotos.length) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
    setShowDeleteSuccess(true);
    setTimeout(() => setShowDeleteSuccess(false), 3000);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const previewPromises = fileArray.map(
      (file) =>
        new Promise<LocalPhoto>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) =>
            resolve({
              id: `local_${Date.now()}_${Math.random()}`,
              name: file.name,
              src: ev.target?.result as string,
            });
          reader.readAsDataURL(file);
        })
    );

    const newPhotos = await Promise.all(previewPromises);
    setPhotos((prev) => [...prev, ...newPhotos]);
    setShowUploadSuccess(true);
    setTimeout(() => setShowUploadSuccess(false), 3000);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Mouse drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (selectedPhotoIndex === null) return;
    setIsDragging(true);
    setDragStart(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || selectedPhotoIndex === null) return;
    setIsDragging(false);
    const diff = dragStart - e.clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? handleNextPhoto() : handlePrevPhoto();
    }
  };

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (selectedPhotoIndex === null) return;
    setIsDragging(true);
    setDragStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging || selectedPhotoIndex === null) return;
    setIsDragging(false);
    const diff = dragStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? handleNextPhoto() : handlePrevPhoto();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;
      if (e.key === 'ArrowRight') handleNextPhoto();
      if (e.key === 'ArrowLeft') handlePrevPhoto();
      if (e.key === 'Escape') handleCloseModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPhotoIndex]);

  // Scroll to top
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
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-gray-200 shadow-sm p-3 bg-white">
        <div className="flex justify-between items-center">
          {/* Left: Hamburger (dekoratif) */}
          <button className="w-8 h-8 flex items-center justify-center shrink-0 hover:opacity-60 transition-opacity">
            <Image src="/icons/hamburger.svg" alt="Menu" width={32} height={32} />
          </button>

          {/* Center: Title */}
          <svg width="180" height="35" viewBox="0 0 180 35" className="flex-1 mx-auto">
            <text x="90" y="24" textAnchor="middle" fill="#000000" fontSize="18" fontWeight="900" letterSpacing="0.5">
              Gezi Hatırası
            </text>
          </svg>

          {/* Right: toggle gallery / note */}
          <button
            onClick={() => setActiveTab(activeTab === 'gallery' ? 'note' : 'gallery')}
            className="cursor-pointer hover:opacity-60 transition-opacity flex items-center justify-center shrink-0"
            title={activeTab === 'note' ? 'Galeriye dön' : 'Notlara git'}
          >
            {activeTab === 'note' ? (
              <Image src="/icons/gallery-icon.svg" alt="Gallery" width={32} height={32} />
            ) : (
              <Image src="/icons/notes-icon.svg" alt="Notes" width={32} height={32} />
            )}
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto flex flex-col">

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div className="flex-1 overflow-y-auto">
        {/* Slideshow */}
        <div className="px-2 pt-2 w-full h-3/4 relative rounded-lg overflow-hidden bg-white">
          <AnimatePresence mode="wait">
            <motion.img
              key={displayPhotoKey}
              src={displayPhoto}
              alt="Slideshow photo"
              className="w-full h-full object-cover rounded-lg"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </AnimatePresence>
        </div>

        {/* Gallery + Upload */}
        <div className="pb-2">
          <div className="grid grid-cols-3 gap-2 px-2 py-2">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition relative"
                onClick={() => handlePhotoClick(index)}
              >
                <img
                  src={photo.src}
                  alt={photo.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}

            {/* Upload Box */}
            <div
              onClick={handleUploadClick}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition"
            >
              <Image src="/icons/upload.svg" alt="Upload" width={24} height={24} className="mb-2" />
              <span className="text-xs text-gray-500 font-semibold">Fotoğraf Ekle</span>
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

        <div className="px-2 mt-16">
          <Footer />
        </div>
      </div>
        )}

        {/* Note Tab */}
        {activeTab === 'note' && <NoteTestPanel />}
      </div>

      {/* Photo Modal */}
      {selectedPhotoIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col overflow-hidden"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
          onClick={handleCloseModal}
        >
          {/* Top Bar */}
          <div
            className="flex justify-between items-center p-3 relative shrink-0"
            style={{ backgroundColor: 'transparent' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={handleCloseModal} className="text-white text-2xl hover:opacity-75 transition">
              <FontAwesomeIcon icon={faXmark} size="sm" />
            </button>
            <span className="text-white text-sm">
              {selectedPhotoIndex + 1} of {photos.length}
            </span>
            <div className="relative">
              <FontAwesomeIcon icon={faEllipsis} size="xl" className="text-white" />
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
            <AnimatePresence mode="wait" custom={modalDirection}>
              <motion.img
                key={selectedPhotoIndex}
                src={photos[selectedPhotoIndex].src}
                alt={photos[selectedPhotoIndex].name}
                className="max-w-full max-h-full object-contain"
                draggable="false"
                custom={modalDirection}
                variants={{
                  enter: (dir: number) => ({ opacity: 0, x: dir * 80 }),
                  center: { opacity: 1, x: 0 },
                  exit: (dir: number) => ({ opacity: 0, x: dir * -80 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                onClick={(e) => e.stopPropagation()}
              />
            </AnimatePresence>
          </div>

          {/* Bottom Bar */}
          <div
            className="flex justify-between items-center px-6 pb-6 shrink-0"
            style={{ backgroundColor: 'transparent' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center hover:opacity-75 transition p-3 rounded"
              title="Sil"
            >
              <Image src="/icons/trash.svg" alt="Delete" width={28} height={28} />
            </button>
            <button className="flex items-center justify-center hover:opacity-75 transition p-3 rounded">
              <Image src="/icons/download-2.svg" alt="Download" width={28} height={28} />
            </button>
          </div>

          {/* Delete Confirm Popup */}
          {showDeleteConfirm && (
            <div
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/60"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-xl shadow-2xl px-6 py-5 mx-6 flex flex-col items-center gap-4">
                <Image src="/icons/trash.svg" alt="Delete" width={36} height={36} />
                <p className="text-gray-800 font-semibold text-base text-center">
                  Bu fotoğrafı silmek istediğinize emin misiniz?
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      handleDeletePhoto();
                    }}
                    className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          )}

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
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">Fotoğraf silindi!</span>
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
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">Fotoğraf eklendi!</span>
        </motion.div>
      )}
    </motion.div>
  );
}
