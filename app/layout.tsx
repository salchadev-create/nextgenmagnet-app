import { Comfortaa } from "next/font/google";
import { Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AuthGuard from "@/components/auth/AuthGuard";
import PWAInstaller from "./PWAInstaller";

const comfortaa = Comfortaa({ 
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: '--font-comfortaa' 
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#000000",
};

export const metadata = {
  title: "Souvenir App",
  description: "Seyahatinizden geri döndüğünüzde anılarınızı organize edebileceğiniz, not tutabileceğiniz ve Google Drive'a kaydedebileceğiniz bir uygulama.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Souvenir App",
  },
  icons: {
    icon: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Souvenir" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${comfortaa.variable} font-sans bg-white text-gray-900 min-h-screen flex flex-col`}>
        <PWAInstaller />
        <AuthProvider>
          <ThemeProvider>
            <AuthGuard>
              <main className="flex-1">
                {children}
              </main>
            </AuthGuard>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}