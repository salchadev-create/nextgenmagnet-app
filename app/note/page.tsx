'use client';

import { useState } from 'react';
import DashboardHeader from '../../components/dashboard/DashboardHeader';

export default function NotePage() {
  const [content, setContent] = useState('Bugün harika bir gezi yaptık. İlk durak antik kentti. Güneş tepedeyken sütunların arasından süzülen ışık büyüleyiciydi. Fotoğraf çekmek için mükemmel bir andı.');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

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
    }
  };

  // ...existing code...

  return (
    <div className="w-full h-screen bg-white flex flex-col">
      {/* Dashboard Header */}
      <DashboardHeader />

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Note Header */}
        <div className="px-8 pt-8 pb-4 border-b border-gray-200 bg-white">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notlarım</h1>
          <p className="text-sm text-gray-500">{new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div className="p-8 h-full">
          {isEditing ? (
            <textarea
              autoFocus
              placeholder="Notunuzu yazın..."
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-full text-gray-900 bg-transparent border-none outline-none placeholder-gray-400 resize-none text-base leading-relaxed box-border"
            />
          ) : (
            <div className="text-gray-900 text-base leading-relaxed whitespace-pre-wrap" style={{ wordBreak: 'break-word' }}>
              {content || <span className="text-gray-400">Yeni bir not başlayın...</span>}
            </div>
          )}
        </div>
      </div>

      {/* Action Header - Fixed at Bottom */}
      <div className="flex justify-end items-center px-6 py-4 border-t border-gray-200 bg-white gap-3 shrink-0">
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="px-6 py-2 border-2 border-orange-500 text-orange-500 font-semibold rounded hover:bg-orange-50 transition w-24 flex items-center justify-center"
          >
            Edit
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={!editContent.trim()}
            className={`px-6 py-2 border-2 font-semibold rounded transition w-24 flex items-center justify-center ${
              !editContent.trim()
                ? 'border-gray-300 text-gray-300 cursor-not-allowed'
                : 'border-green-500 text-green-500 hover:bg-green-50'
            }`}
          >
            Kaydet
          </button>
        )}
      </div>
    </div>
  );
}
