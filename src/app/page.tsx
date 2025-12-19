import { AqiDashboard } from "@/components/aqi-dashboard";

export default function Home() {
  return (
    <main className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-muted/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-muted/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-3xl mx-auto relative z-10">
        <AqiDashboard />
      </div>
    </main>
  );
}
