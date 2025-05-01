// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';
import { Header, Footer } from '@/components/shared';
import { Sidebar } from '@/components/home';
import ClientProvider from '@/providers/ClientProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tiki - Mua hàng giá tốt, hàng chuẩn, ship nhanh',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/favicon.png" />
      <body className={inter.className}>
      <ClientProvider><Header /></ClientProvider>
        <div className="flex flex-row w-full">
          <div className="mr-3 mt-3">
            <Sidebar />
          </div>
          <main className="flex justify-center flex-col mt-5 w-full">
            <div className="w-full flex justify-center flex-col items-center ml-0">
            <ClientProvider>{children}</ClientProvider>
            </div>
          </main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
