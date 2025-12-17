import type { Metadata } from "next";
import Footer from "@/components/Footer";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Toaster } from "@/components/ui/sonner";
import PrivacyModal from "@/components/PrivacyModal";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "YSN Legal Platform | Contract Intelligence",
  description: "Advanced AI-powered contract analysis and management system for enterprise legal teams. Powered by YSN Solutions.",
  keywords: ["contract management", "AI", "document analysis", "contract intelligence", "YSN Solutions", "Legal Tech"],
  authors: [{ name: "YSN Solutions" }],
  creator: "YSN Solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen bg-[#09090b]`}
      >
        <AuthProvider>
          <LanguageProvider>
            <div className="flex flex-col min-h-screen">
              {children}
              <Footer />
            </div>
            <PrivacyModal />
            <Toaster />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
