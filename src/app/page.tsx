import { AqiDashboard } from '@/components/aqi-dashboard';

export default function Home() {
  return (
    <main className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl mx-auto">
        <AqiDashboard />
      </div>
    </main>
  );
}
