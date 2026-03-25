import { Comfortaa } from "next/font/google";
import "./globals.css";
import Head from "next/head";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AuthGuard from "@/components/auth/AuthGuard";

const comfortaa = Comfortaa({ 
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: '--font-comfortaa' 
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${comfortaa.variable} font-sans bg-white text-gray-900 min-h-screen flex flex-col`}>
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