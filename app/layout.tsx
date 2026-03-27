import type { Metadata } from 'next';
import { Lateef, Inter } from 'next/font/google';
import './globals.css'; // Global styles

const lateef = Lateef({
  weight: ['400', '500', '600', '700'],
  subsets: ['arabic'],
  variable: '--font-lateef',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Sindhi First Lesson',
  description: 'A Sindhi language educational app for school students.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sd" dir="rtl" style={{ height: '100%' }}>
      <body className={`${lateef.variable} ${inter.variable} font-lateef`}
        style={{ background: '#000000', color: '#ffffff', height: '100%', margin: 0, padding: 0 }}
        suppressHydrationWarning>{children}</body>
    </html>
  );
}
