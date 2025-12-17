import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from "@/contexts/LanguageContext";
import Footer from '@/components/Footer';
import PrivacyModal from '@/components/PrivacyModal';

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: "Helios | Contract Intelligence",
  description: "AI-powered contract analysis platform.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-[#09090b] text-zinc-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-300`}>
        <AuthProvider>
          <LanguageProvider>
            <div className="flex flex-col min-h-screen">
              {children}
            </div>
            <PrivacyModal />
            <Footer />
            <Toaster
              position="top-center"
              theme="dark"
              toastOptions={{
                style: {
                  background: '#18181b',
                  border: '1px solid #27272a',
                  color: '#fff',
                }
              }}
            />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
