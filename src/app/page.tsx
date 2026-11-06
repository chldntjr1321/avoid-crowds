import SeoulMap from '@/components/map/seoul-map';
import FloatingPanel from '@/components/panel/floating-panel';

export default function Home() {
  return (
    <main className="relative h-screen bg-background">
      <SeoulMap />
      <FloatingPanel />
    </main>
  );
}
