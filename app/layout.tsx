import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '배민 가이드 에디터',
  description: '배달의민족 가이드 콘텐츠 에디터',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
