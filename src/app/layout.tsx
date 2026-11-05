import type { Metadata } from 'next';
import './globals.css';
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';

export const metadata: Metadata = {
  title: 'avoid-crowds',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
