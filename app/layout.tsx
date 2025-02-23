import React from 'react';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'YouTube字幕ダウンローダー',
  description: 'YouTube動画の字幕をダウンロードできるWebアプリケーション',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-100">{children}</body>
    </html>
  );
} 