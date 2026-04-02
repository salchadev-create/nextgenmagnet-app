'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Footer from '@/components/common/Footer';
import seyehatImg from '@/app/assets/images/seyehat.png';
import editIcon from '@/app/assets/icons/edit.svg';
import Image from 'next/image';

const DEFAULT_ENTRY = {
  heroImage: seyehatImg,
  tags: ['İtalya', 'May 2026'],
  title: 'Geziye Dair Notlar',
  dateRange: '14 May 2026',
  location: 'Positano, İtalya',
  pullquote: '"Dünya bir kitaptır ve gezmeyenler sadece bir sayfasını okurlar."',
  body: 'Sorrentine Yarımadası\'nın engebeli kıyılarından geçen yolculuğumuz bir rüya gibiydi. Akdeniz\'in pastel tonlardaki cephelerini yumuşatça aydınlatan sabah ışığına uyandık; kelimelerin anlatmaya yetişemeyeceği anlardı bunlar.\n\nÖğleden sonralarımızı labirent gibi çıkmaçlarda kaybolarak geçirdik; gizli trattoria\'lardan taze makarna kokuları süzülürken antik taş duvarları sardıran bougainvillea\'ların canlı renkleri bizi büyüledi.\n\nDeniz havası tuzlu ve ferahlatıcıydı; dalgalar limon bahçeleriyle öpüşen kayalıklara nazikçe vuruyordu. Dar geçitlerde usulca süzülen tekneler, zamanın farklı aktığı bu köyde hayatın kendine özgü bir ritmi olduğunu hatırlatıyordu.\n\nAmalfi\'nin tarihî katedralinden Ravello\'nun uçsuz bucaksız bahçelerine uzanan her durak, bu kıyının ruhunu daha derin bir şekilde kavramama yardım etti. Burası; mimarinin, doğanın ve insan mirasının birbirine harmandığı, eşsiz bir açık hava müzesi.',
};

export default function NotePage() {
  const [entry, setEntry] = useState(DEFAULT_ENTRY);
  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState({ ...DEFAULT_ENTRY });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleEdit = () => {
    setEditFields({ ...entry });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editFields.body.trim() || editFields.title.trim()) {
      setEntry({ ...editFields });
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <>
      <DashboardHeader />

      <motion.div
        className="w-full min-h-screen flex flex-col bg-white"
        initial={{ y: '-100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '-100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200, duration: 0.5 }}
      >
        {/* ─── READ MODE ─── */}
          <div className="flex-1 overflow-y-auto">
            {/* Hero Image */}
            <div className="px-2 pt-2">
            <div className="relative w-full overflow-hidden rounded-2xl" style={{ height: '260px' }}>
              <Image
                src={entry.heroImage}
                alt="Kapak görseli"
                className="w-full h-full object-cover"
                fill
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.35) 100%)' }} />

            </div>
            </div>

            {/* Article Card */}
            <div className="px-4 pt-4 pb-10 bg-white">
              {/* Title */}
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
                  <Image src={editIcon} alt="Düzenle" className="w-7 h-7" />
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
                className="border-l-0 italic text-gray-600 text-sm leading-relaxed mb-6 text-center px-2"
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

              {/* Body Text */}
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
          </div>

        {/* ─── EDIT BOTTOM SHEET ─── */}
        <AnimatePresence>
          {isEditing && (
            <>
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 z-40 bg-black/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCancel}
              />

              {/* Bottom Sheet */}
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
                  if (info.offset.y > 80 || info.velocity.y > 400) {
                    handleCancel();
                  }
                }}
              >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing">
                  <div className="w-10 h-1 rounded-full bg-gray-300" />
                </div>

                {/* Sheet Header */}
                <div className="px-5 h-11 flex justify-between items-center border-b border-gray-100 shrink-0">
                  <button
                    onClick={handleCancel}
                    className="text-sm text-gray-500 hover:text-gray-800 transition font-medium"
                  >
                    İptal
                  </button>
                  <span className="text-sm font-semibold text-gray-700"></span>
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
                    style={{ fontFamily: 'var(--font-comfortaa), sans-serif', lineHeight: '1.85', scrollbarWidth: 'none', msOverflowStyle: 'none', border: '1.5px solid #E65100', boxShadow: 'none' }}
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
              <span className="font-medium">Not başarıyla kaydedildi!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
