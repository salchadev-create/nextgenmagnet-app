import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HappioTag',
  description: 'Seyahatinizden geri döndüğünüzde anılarınızı organize edebileceğiniz, not tutabileceğiniz ve Google Drive\'a kaydedebileceğiniz bir uygulama.',
  icons: {
    icon: '/logo.svg',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '240x240' },
    ],
  },
};

export default function TravelTestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
