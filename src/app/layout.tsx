import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ToastProvider from "@/context/ToastContext";
import Header from "@/components/layout/Header";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TranslationFlow | Manage Your Translation Projects",
  description: "An application to manage and streamline translation workflows",
  keywords: ["translation", "localization", "project management", "i18n"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        {/* Pre-connect to domains */}
        <link rel="preconnect" href="https://translation-flow-app.web.app" />
        <link rel="preconnect" href="https://translation-flow-app.firebaseapp.com" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        {/* DNS prefetch */}
        <link rel="dns-prefetch" href="https://translation-flow-app.web.app" />
        <link rel="dns-prefetch" href="https://translation-flow-app.firebaseapp.com" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
        {/* Prevent MIME type errors */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ErrorBoundary>
          <AuthProvider>
            <ToastProvider>
              <Header />
              <main className="flex-grow">{children}</main>
              <footer className="bg-gray-50 border-t py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <p className="text-sm text-gray-500 text-center">
                    &copy; {new Date().getFullYear()} TranslationFlow. All rights reserved.
                  </p>
                </div>
              </footer>
            </ToastProvider>
          </AuthProvider>
        </ErrorBoundary>
        
        {/* Script to handle chunk loading errors */}
        <Script id="handle-chunk-error" strategy="beforeInteractive">
          {`
            window.addEventListener('error', function(event) {
              if (event && event.error && event.error.name === 'ChunkLoadError') {
                console.warn('Chunk loading error detected, refreshing page...');
                window.location.reload();
              }
            });
          `}
        </Script>
      </body>
    </html>
  );
}
