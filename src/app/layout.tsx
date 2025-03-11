// src/app/layout.tsx
import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import ThemeProvider from '@/components/ui/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'TaskFlow - Modern To-Do List Application',
  description: 'A modern, user-friendly to-do list application with advanced features',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-gray-50 dark:bg-gray-900`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
