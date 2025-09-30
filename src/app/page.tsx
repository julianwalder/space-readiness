import Link from 'next/link';
import RadarChartDemo from '@/components/RadarChartDemo';
import DimensionsGrid from '@/components/DimensionsGrid';
import LandingFAQ from '@/components/LandingFAQ';
import PublicHeader from '@/components/PublicHeader';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <PublicHeader />

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
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/signup" className="rounded-xl bg-blue-600 px-6 py-3 text-white font-medium text-center">Get Started</Link>
                <Link href="#dimensions" className="rounded-xl border px-6 py-3 font-medium text-center">See dimensions</Link>
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

        {/* FAQ Section */}
        <LandingFAQ />
      </main>

      {/* Footer */}
      <footer className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left">
              <span className="text-xl font-bold text-gray-900">Space Readiness</span>
              <p className="mt-2 text-sm text-gray-600">
                Built on KTH Innovation Readiness Level + System Integration Readiness
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link href="/faq" className="text-sm text-gray-600 hover:text-gray-900">
                FAQ
              </Link>
              <Link href="/media" className="text-sm text-gray-600 hover:text-gray-900">
                Media
              </Link>
              <Link href="/privacy-policy" className="text-sm text-gray-600 hover:text-gray-900">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-sm text-gray-600 hover:text-gray-900">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}