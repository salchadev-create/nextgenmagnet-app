'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Footer from '@/components/common/Footer';

export default function NotePage() {
  const [content, setContent] = useState('Bugün harika bir gezi yaptık. İlk durak antik kentti. Güneş tepedeyken sütunların arasından süzülen ışık büyüleyiciydi. Fotoğraf çekmek için mükemmel bir andı.');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleEdit = () => {
    setEditContent(content);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editContent.trim()) {
      // Here you can save the note to a database or local storage
      console.log({ content: editContent, date: new Date().toISOString() });
      setContent(editContent);
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  // ...existing code...

  return (
    <>
      {/* Dashboard Header */}
      <DashboardHeader />
      
      <motion.div
        className="w-full bg-white flex flex-col flex-1 h-screen"
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200, duration: 0.5 }}
      >
        {/* Content Area - Full Scroll */}
        <div className="flex-1 flex flex-col pt-16 overflow-hidden">
        {/* Note Header */}
        <div className="fixed top-14 left-0 right-0 z-40 px-8 py-3 bg-white flex justify-between items-center border-b border-gray-200">
          <div >
            <h1 className="text-xl font-semibold font-sans text-gray-900 mb-1">Seyir Defteri</h1>
            <p className="text-xs text-gray-500">{new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="p-2 hover:bg-orange-50 transition rounded"
                title="Düzenle"
              >
                <img src="/icons/edit.svg" alt="Düzenle" className="w-8 h-8" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={!editContent.trim()}
                className="p-2 transition rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-50"
                title="Kaydet"
              >
                <img src="/icons/save.svg" alt="Kaydet" className="w-7 h-7" />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-8 flex flex-col overflow-hidden">
            {isEditing ? (
              <textarea
                autoFocus
                placeholder="Notunuzu yazın..."
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-full text-gray-900 bg-transparent border-none outline-none placeholder-gray-400 resize-none text-base leading-relaxed box-border overflow-y-auto"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              />
            ) : (
              <div className="text-gray-900 text-base leading-relaxed whitespace-pre-wrap overflow-y-auto h-full" style={{ wordBreak: 'break-word', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {content || <span className="text-gray-400">Yeni bir not başlayın...</span>}
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Success Toast */}
        {showSuccess && (
          <motion.div
            className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm"
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
      </motion.div>

      <div className='px-6'>
          <Footer />
        </div>
    </>
  );
}
