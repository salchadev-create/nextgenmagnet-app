import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Head from "next/head";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: '--font-jakarta' 
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${jakarta.variable} font-sans bg-white text-gray-900 min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}