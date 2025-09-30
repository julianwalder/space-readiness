import Link from 'next/link';
import RadarChartDemo from '@/components/RadarChartDemo';
import DimensionsGrid from '@/components/DimensionsGrid';
import LandingFAQ from '@/components/LandingFAQ';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';

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
          <p className="mt-3 text-gray-600">
            Our comprehensive assessment framework evaluates your space venture across critical readiness areas. 
            Each dimension is scored on a 1–9 scale with evidence-backed justification, helping you identify 
            strengths, gaps, and actionable next steps toward your funding milestone.
          </p>
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
            <div className="rounded-2xl border p-6 hover:shadow-sm transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg">1</div>
                <h3 className="font-semibold text-lg">Intake</h3>
              </div>
              <p className="text-gray-600 mb-3">Upload your pitch deck, technical documentation, and evidence files.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Pitch deck and business plan</li>
                <li>• Technical specifications and test results</li>
                <li>• Letters of Intent (LoIs) and customer agreements</li>
                <li>• Financial projections and funding history</li>
              </ul>
            </div>
            <div className="rounded-2xl border p-6 hover:shadow-sm transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg">2</div>
                <h3 className="font-semibold text-lg">AI Scoring</h3>
              </div>
              <p className="text-gray-600 mb-3">Specialized AI agents analyze your materials across 8 readiness dimensions.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Technology readiness and innovation level</li>
                <li>• Market validation and customer traction</li>
                <li>• Business model and revenue potential</li>
                <li>• Team expertise and execution capability</li>
              </ul>
            </div>
            <div className="rounded-2xl border p-6 hover:shadow-sm transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg">3</div>
                <h3 className="font-semibold text-lg">Roadmap</h3>
              </div>
              <p className="text-gray-600 mb-3">Receive actionable recommendations and milestone planning.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Priority actions to advance readiness levels</li>
                <li>• Timeline recommendations for next funding round</li>
                <li>• &ldquo;What-if&rdquo; scenarios for different strategies</li>
                <li>• Evidence requirements for each milestone</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <LandingFAQ />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}