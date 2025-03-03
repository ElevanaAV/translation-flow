import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ToastProvider from "@/context/ToastContext";
import Header from "@/components/layout/Header";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

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
      </body>
    </html>
  );
}
