'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') ?? 'invalid';

  const messages: Record<string, { title: string; desc: string }> = {
    invalid: {
      title: 'Geçersiz Bağlantı',
      desc: 'Bu bağlantı geçersiz veya süresi dolmuş. Lütfen size gönderilen bağlantıyı kullanın.',
    },
    not_found: {
      title: 'Ürün Bulunamadı',
      desc: 'Bu ID\'ye ait bir ürün bulunamadı. Bağlantı geçersiz ya da silinmiş olabilir.',
    },
    connection: {
      title: 'Bağlantı Hatası',
      desc: 'Sunucuya bağlanırken bir sorun oluştu. İnternet bağlantınızı kontrol edip tekrar deneyin.',
    },
    no_id: {
      title: 'Erişim Reddedildi',
      desc: 'Bu sayfaya doğrudan erişemezsiniz. Lütfen size özel gönderilen bağlantıyı kullanın.',
    },
    unauthorized: {
      title: 'Yetkisiz Kullanıcı',
      desc: 'Bu ürüne erişim izniniz yok. Farklı bir e-posta adresiyle giriş yapmayı deneyebilirsiniz.',
    },
  };

  const { title, desc } = messages[reason] ?? messages.invalid;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white px-6 text-center gap-6">
      {/* İkon */}
      <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
        <svg
          className="w-12 h-12 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
        </svg>
      </div>

      {/* Metin */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{desc}</p>
      </div>

      {/* Hata kodu badge */}
      <div className="bg-gray-100 rounded-lg px-4 py-2 font-mono text-xs text-gray-400">
        hata: {reason}
      </div>

      {/* Sadece bağlantı hatasında "Tekrar Dene" */}
      {reason === 'connection' && (
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition"
        >
          Geri Dön
        </button>
      )}
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  );
}
