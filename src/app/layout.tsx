import type { Metadata } from 'next';
import './globals.css';
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'avoid-crowds',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
