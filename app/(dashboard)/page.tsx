'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEllipsisV ,faEllipsis,faXmark } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import Footer from '@/components/common/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { getOrCreateAppFolder, uploadFileToDrive, listPhotosFromFolder, deleteFileFromDrive, DrivePhoto } from '@/lib/googleDrive';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import seyehatImg from '@/app/assets/images/seyehat.png';
import uploadIcon from '@/app/assets/icons/upload.svg';
import trashIcon from '@/app/assets/icons/trash.svg';
import downloadIcon from '@/app/assets/icons/download-2.svg';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, accessToken, setProductLocation: setContextProductLocation } = useAuth();

  // Drive'dan gelen fotoğraflar (id + src URL içerir)
  const [photos, setPhotos] = useState<DrivePhoto[]>([]);
  // Yükleme sırasında local preview'lar (base64); Drive upload bitince photos'a eklenir
  const [localPreviews, setLocalPreviews] = useState<DrivePhoto[]>([]);

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingPhotos, setIsFetchingPhotos] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragStart, setDragStart] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [modalDirection, setModalDirection] = useState(0); // 1: ileri, -1: geri

  // Ekranda gösterilecek fotoğraflar: Drive'dakiler + devam eden yükleme preview'ları
  const allPhotos: DrivePhoto[] = [...photos, ...localPreviews];

  useEffect(() => {
    // Loading seçili değilse ve user yok ise, login sayfasına yönlendir
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Sayfa açılınca / yenilenince Drive'dan fotoğrafları çek
  useEffect(() => {
    const fetchDrivePhotos = async () => {
      const token = accessToken ?? (typeof window !== 'undefined' ? localStorage.getItem('google_access_token') : null);
      if (!token || loading || !user) return;

      try {
        setIsFetchingPhotos(true);

        // 1. Firestore'dan folderId oku
        const productId = typeof window !== 'undefined' ? localStorage.getItem('product_id') : null;
        let folderId: string | null = null;
        let productLocation: string | null = null;

        if (productId) {
          const firestore = getDb();
          const collectionName = process.env.NEXT_PUBLIC_COLLECTION_NAME || 'activeTravelProduct';
          const docSnap = await getDoc(doc(firestore, collectionName, productId));
          if (docSnap.exists()) {
            folderId = docSnap.data()?.folderId ?? null;
            productLocation = docSnap.data()?.location ?? null;
          }
        }

        // 2. folderId yoksa Drive'da oluştur ve DB'ye kaydet
        if (!folderId) {
          folderId = await getOrCreateAppFolder(token, productLocation, productId);
          if (productId) {
            const firestore = getDb();
            const collectionName = process.env.NEXT_PUBLIC_COLLECTION_NAME || 'activeTravelProduct';
            await updateDoc(doc(firestore, collectionName, productId), { folderId: folderId });
          }
        }

        const drivePhotos = await listPhotosFromFolder(token, folderId);
        setPhotos(drivePhotos);
        // Location'ı Context'e set et
        if (productLocation) {
          setContextProductLocation(productLocation);
        }
      } catch (err) {
        console.error('Drive fotoğrafları yüklenemedi:', err);
        // Hata durumunda fallback location
        setContextProductLocation(null);
      } finally {
        setIsFetchingPhotos(false);
      }
    };

    fetchDrivePhotos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const handleUploadClick = () => {
    // Input'u önce temizle, sonra click et (tekrar seçim yapmayı sağlar)
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      console.log('❌ Dosya seçilmedi');
      return;
    }

    console.log('📂 Dosya seçildi:', files.length, 'adet');
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
    // Ekranda hemen local preview olarak göster
    const previewDrivePhotos: DrivePhoto[] = previews.map((p, i) => ({
      id: `local_preview_${Date.now()}_${i}`,
      name: p.file.name,
      src: p.dataUrl,
    }));
    setLocalPreviews((prev) => [...prev, ...previewDrivePhotos]);

    // Google Drive'a yükle
    try {
      const token = accessToken ?? localStorage.getItem('google_access_token');
      if (!token) {
        setUploadError('Google Drive erişim izni bulunamadı. Lütfen tekrar giriş yapın.');
        setIsUploading(false);
        return;
      }

      // Firestore'dan folderId oku, yoksa oluştur ve kaydet
      const productId = localStorage.getItem('product_id');
      let folderId: string | null = null;
      let productLocation: string | null = null;

      if (productId) {
        const firestore = getDb();
        const collectionName = process.env.NEXT_PUBLIC_COLLECTION_NAME || 'activeTravelProduct';
        const docSnap = await getDoc(doc(firestore, collectionName, productId));
        if (docSnap.exists()) {
          folderId = docSnap.data()?.folderId ?? null;
          productLocation = docSnap.data()?.location ?? null;
        }
      }

      if (!folderId) {
        folderId = await getOrCreateAppFolder(token, productLocation, productId);
        if (productId) {
          const firestore = getDb();
          const collectionName = process.env.NEXT_PUBLIC_COLLECTION_NAME || 'activeTravelProduct';
          await updateDoc(doc(firestore, collectionName, productId), { folderId: folderId });
        }
      }

      // Yüklenen dosyaları takip et - Upload sonuçlarını direkt kullanacağız
      const uploadedPhotos: DrivePhoto[] = [];
      console.log('🚀 Upload başladı, preview sayısı:', previews.length);
      
      for (const { file } of previews) {
        console.log('📤 Dosya yükleniyor:', file.name);
        const result = await uploadFileToDrive(token, file, folderId);
        console.log('✅ Dosya yüklendi:', result.id, result.name);
        
        // Yüklenen dosyayı hemen proxy URL'le ekle
        const photoUrl = `/api/drive-photo?fileId=${result.id}&token=${encodeURIComponent(token)}`;
        console.log('🔗 Proxy URL oluşturuldu:', photoUrl);
        
        uploadedPhotos.push({
          id: result.id,
          name: result.name,
          src: photoUrl,
        });
      }

      console.log('📦 Upload tamamlandı, toplam:', uploadedPhotos.length, uploadedPhotos);

      // Google Drive'ın dosyaları indexlemesi için 2 saniye bekle (opsiyonel)
      console.log('⏳ Drive indexleme için bekleniyor...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Yüklenen fotoları state'e ekle (Drive'dan yeniden sorgulamak yerine)
      console.log('✅ Yüklenen fotoğraflar state\'e ekleniyor:', uploadedPhotos.length);
      setPhotos(prev => {
        console.log('State güncellemesi: eski=', prev.length, 'yeni eklenecek=', uploadedPhotos.length);
        return [...prev, ...uploadedPhotos];  // Yeni fotoğraflar sonda eklenecek
      });
      
      // Local preview'ları temizle
      setLocalPreviews([]);
      console.log('🧹 Local preview\'lar temizlendi');

      setShowUploadSuccess(true);
      setTimeout(() => setShowUploadSuccess(false), 3000);
    } catch (err: unknown) {
      console.error('Drive yükleme hatası:', err);
      const message = err instanceof Error ? err.message : String(err);
      setUploadError(`Drive yükleme başarısız: ${message}`);
      setTimeout(() => setUploadError(null), 5000);
    } finally {
      setIsUploading(false);
      // Input'u temizle kodunu kaldırdık - artık handleUploadClick'te yapılıyor
    }
  };

  // Slideshow effect
  useEffect(() => {
    if (allPhotos.length === 0) return;

    const interval = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % allPhotos.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [allPhotos.length]);

  const displayPhoto: string | any = allPhotos.length > 0 ? allPhotos[currentPhotoIndex].src : seyehatImg.src;
  const displayPhotoKey = allPhotos.length > 0 ? allPhotos[currentPhotoIndex].id : 'default';

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
      setSelectedPhotoIndex((selectedPhotoIndex + 1) % allPhotos.length);
    }
  };

  const handleDeletePhoto = async () => {
    if (selectedPhotoIndex === null) return;

    const photoToDelete = allPhotos[selectedPhotoIndex];
    console.log('🗑️ Silme işlemi başladı:', photoToDelete.id);

    try {
      // Drive'dan sil (local preview ise atla)
      if (!photoToDelete.id.startsWith('local_preview_')) {
        const token = accessToken ?? localStorage.getItem('google_access_token');
        if (token) {
          await deleteFileFromDrive(token, photoToDelete.id);
          console.log('✅ Drive\'dan silindi');
        }
      }

      // Local state'den kaldır - allPhotos'un indeksini kullanarak doğru şekilde sil
      if (photoToDelete.id.startsWith('local_preview_')) {
        // Local preview ise localPreviews'den sil
        setLocalPreviews(prev => prev.filter(p => p.id !== photoToDelete.id));
        console.log('🗑️ Local preview silindi');
      } else {
        // Drive fotoğrafı ise photos'tan sil
        setPhotos(prev => prev.filter(p => p.id !== photoToDelete.id));
        console.log('🗑️ Drive fotoğrafı state\'ten silindi');
      }

      // Modal'ı kapat
      if (allPhotos.length <= 1) {
        setSelectedPhotoIndex(null);
      } else {
        // Sonraki fotoğrafa git
        setSelectedPhotoIndex(prev => 
          prev !== null && prev >= allPhotos.length - 1 ? prev - 1 : prev
        );
      }

      setShowDeleteSuccess(true);
      setTimeout(() => setShowDeleteSuccess(false), 3000);
    } catch (err) {
      console.error('🔴 Silme hatası:', err);
      const message = err instanceof Error ? err.message : String(err);
      setUploadError(`Silme başarısız: ${message}`);
    }
  };

  const handlePrevPhoto = () => {
    if (selectedPhotoIndex !== null) {
      setModalDirection(-1);
      setSelectedPhotoIndex((selectedPhotoIndex - 1 + allPhotos.length) % allPhotos.length);
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
      <DashboardHeader />
      
      {/* Scrollable Content Section - Photo + Gallery */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-2 pt-2 w-full h-3/4 relative rounded-lg overflow-hidden bg-white">
          {isFetchingPhotos && allPhotos.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
              <svg className="animate-spin w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          ) : (
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
          )}
        </div>
        
        {/* Upload & Gallery Section */}
        <div className="pb-2">
          <div className="grid grid-cols-3 gap-2 px-2 py-2">
            {/* Drive ve local preview fotoğraflar */}
            {isFetchingPhotos ? (
              // Yüklenirken iskelet kartlar göster
              Array.from({ length: 3 }).map((_, i) => (
                <div key={`skeleton_${i}`} className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
              ))
            ) : (
              allPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className={`aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition relative ${photo.id.startsWith('local_preview_') ? 'opacity-60' : ''}`}
                  onClick={() => handlePhotoClick(index)}
                >
                  <img
                    src={photo.src}
                    alt={photo.name || `Fotoğraf ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Local preview üzerinde yükleniyor ikonu */}
                  {photo.id.startsWith('local_preview_') && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    </div>
                  )}
                </div>
              ))
            )}
            
            {/* Upload Box - Inside Grid */}
            <div
              onClick={handleUploadClick}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition"
            >
              <Image src={uploadIcon} alt="Upload" width={24} height={24} className="mb-2" loading="eager" />
              <span className="text-xs text-gray-500 font-semibold">Fotoğraf Yükle</span>
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
        <div className='px-2 mt-16'>
          <Footer />
        </div>
      
      </div>

      {/* Photo Modal */}
      <AnimatePresence>
      {selectedPhotoIndex !== null && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col overflow-hidden"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
          onClick={handleCloseModal}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.88 }}
          transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
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
              {selectedPhotoIndex + 1} of {allPhotos.length}
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
                src={allPhotos[selectedPhotoIndex].src}
                alt={allPhotos[selectedPhotoIndex].name || `Photo ${selectedPhotoIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                draggable="false"
                custom={modalDirection}
                variants={{
                  enter: (dir: number) => ({ opacity: 0, x: dir * 40, scale: 0.96 }),
                  center: { opacity: 1, x: 0, scale: 1 },
                  exit: (dir: number) => ({ opacity: 0, x: dir * -40, scale: 0.96 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.8 }}
                onClick={(e) => e.stopPropagation()}
              />
            </AnimatePresence>
          </div>

          {/* Bottom Bar with Actions */}
          <div className="flex justify-between items-center px-6 pb-6 shrink-0" style={{ backgroundColor: 'transparent' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center hover:opacity-75 transition p-3 rounded"
              title="Sil"
            >
              <Image src={trashIcon} alt="Delete" width={28} height={28} />
            </button>
            <button className="flex items-center justify-center hover:opacity-75 transition p-3 rounded">
              <Image src={downloadIcon} alt="Download" width={28} height={28} />
            </button>
          </div>

          {/* Delete Confirm Popup */}
          {showDeleteConfirm && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60" onClick={(e) => e.stopPropagation()}>
              <div className="bg-white rounded-xl shadow-2xl px-6 py-5 mx-6 flex flex-col items-center gap-4">
                <Image src={trashIcon} width={36} height={36} alt="Delete" />
                <p className="text-gray-800 font-semibold text-base text-center">Bu fotoğrafı silmek istediğinize emin misiniz?</p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={() => { setShowDeleteConfirm(false); handleDeletePhoto(); }}
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
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Fotoğraf başarıyla silindi!</span>
            </motion.div>
          )}
        </motion.div>
      )}
      </AnimatePresence>

      {/* Upload Loading Toast */}
      {isUploading && (
        <motion.div
          className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <svg className="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span className="font-medium">Fotoğraf yükleniyor...</span>
        </motion.div>
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
          <span className="font-medium">Fotoğraf yüklendi!</span>
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
