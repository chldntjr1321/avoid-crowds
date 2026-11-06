import SeoulMap from '@/components/map/seoul-map';
import FloatingPanel from '@/components/panel/floating-panel';
import { Suspense } from 'react';

export default function Home() {
  return (
    <main className="relative h-screen bg-background">
      <Suspense fallback={null}>
        <SeoulMap />
        <FloatingPanel />
      </Suspense>
    </main>
  );
}
