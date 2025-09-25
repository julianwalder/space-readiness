import Link from 'next/link';
import RadarChartDemo from '@/components/RadarChartDemo';
import DimensionsGrid from '@/components/DimensionsGrid';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-xl font-bold text-gray-900">Space Readiness</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/signup" 
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="px-6 md:px-10">
        {/* Hero */}
        <section className="mx-auto max-w-6xl py-20">
          <div className="grid gap-10 md:grid-cols-2 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Multidimensional <span className="text-blue-600">De-Risking</span> for Space Ventures
              </h1>
              <p className="mt-6 text-lg text-gray-600">
                Upload your deck and evidence. Our agentic AI scores <strong>8 readiness dimensions</strong> (1–9),
                flags bottlenecks, and generates a clear roadmap to your next funding milestone.
              </p>
              <div className="mt-8 flex gap-4">
                <Link href="/signup" className="rounded-xl bg-blue-600 px-6 py-3 text-white font-medium">Get Started</Link>
                <Link href="#dimensions" className="rounded-xl border px-6 py-3 font-medium">See dimensions</Link>
              </div>
              <p className="mt-3 text-sm text-gray-500">Built on KTH Innovation Readiness Level + System Integration Readiness.</p>
            </div>
            <div className="border rounded-2xl p-6 shadow-sm">
              <RadarChartDemo />
            </div>
          </div>
        </section>

        {/* Dimensions */}
        <section id="dimensions" className="mx-auto max-w-6xl py-16 border-t">
          <h2 className="text-2xl md:text-3xl font-semibold">The 8 Readiness Dimensions</h2>
          <p className="mt-3 text-gray-600">Each is scored on a 1–9 scale (TRL-like) with evidence-backed justification.</p>
          <div className="mt-8">
            <DimensionsGrid />
          </div>
          <div className="mt-10">
            <Link href="/signup" className="rounded-xl bg-blue-600 px-6 py-3 text-white font-medium">
              Create your account
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-6xl py-16 border-t">
          <h2 className="text-2xl md:text-3xl font-semibold">How it works</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border p-6"><h3 className="font-semibold">1) Intake</h3><p className="mt-2 text-gray-600">Guided questions + file uploads (deck, tech report, LoIs).</p></div>
            <div className="rounded-2xl border p-6"><h3 className="font-semibold">2) AI Scoring</h3><p className="mt-2 text-gray-600">Agents assess evidence and assign 1–9 levels with confidence & justification.</p></div>
            <div className="rounded-2xl border p-6"><h3 className="font-semibold">3) Roadmap</h3><p className="mt-2 text-gray-600">Prioritized next steps and &ldquo;what-if&rdquo; simulations to hit milestones.</p></div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xl font-bold text-gray-900">Space Readiness</span>
            <p className="mt-2 text-sm text-gray-600">
              Built on KTH Innovation Readiness Level + System Integration Readiness
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}