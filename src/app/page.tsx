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
              <div className="mt-4 flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-600">Are you an investor?</span>
                <Link href="/investors/join" className="text-blue-600 hover:text-blue-500 font-medium">
                  Join as Investor →
                </Link>
              </div>
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

        {/* Investor Section */}
        <section className="mx-auto max-w-6xl py-16 border-t">
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-8 md:p-12">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  For Investors
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Track Portfolio Ventures in Real-Time
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  Follow the ventures you&apos;re interested in and receive updates on their readiness scores, 
                  progress milestones, and risk profiles across all 8 dimensions.
                </p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700"><strong>Monitor progress:</strong> Track how ventures improve their readiness scores over time</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700"><strong>Identify bottlenecks:</strong> See which dimensions need attention before the next funding round</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700"><strong>Evidence-based insights:</strong> Review AI-generated assessments backed by actual documentation</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-4">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Follow Ventures</h3>
                  <p className="text-sm text-gray-600">Get notified when your portfolio companies complete assessments and upload new evidence.</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Compare Progress</h3>
                  <p className="text-sm text-gray-600">View readiness trends across multiple ventures and identify the strongest candidates.</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Due Diligence Support</h3>
                  <p className="text-sm text-gray-600">Use our comprehensive 8-dimension framework to streamline your investment process.</p>
                </div>
              </div>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Link href="/investors/join" className="rounded-xl bg-blue-600 px-8 py-3 text-white font-medium text-center hover:bg-blue-700 transition-colors">
                Join as Investor
              </Link>
              <span className="text-sm text-gray-600">Free account • No credit card required</span>
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