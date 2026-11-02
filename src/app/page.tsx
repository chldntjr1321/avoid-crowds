import districts from '@/data/generated/districts.json';
import background from '@/data/generated/background.json';

export default function Home() {
  return (
    <main>
      <svg viewBox="0 0 1000 1000" className="h-screen w-full">
        {districts.map((district) => (
          <path
            key={district.name}
            d={district.d}
            fill="none"
            stroke="currentColor"
          />
        ))}
        <path
          d={background.river}
          fill="none"
          className="stroke-blue-400"
          strokeWidth={6}
        />
      </svg>
    </main>
  );
}
