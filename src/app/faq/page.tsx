import Link from 'next/link';
import { Metadata } from 'next';
import FAQAccordion from '@/components/FAQAccordion';

export const metadata: Metadata = {
  title: 'FAQ — Multidimensional De-Risking for Space Ventures (KTH IRL + System Integration)',
  description: 'Answers to how our KTH IRL-based, 8-dimension framework de-risks space startups and speeds funding, incl. System Integration readiness.',
  openGraph: {
    title: 'FAQ — Multidimensional De-Risking for Space Ventures',
    description: 'Answers to how our KTH IRL-based, 8-dimension framework de-risks space startups and speeds funding, incl. System Integration readiness.',
    type: 'article',
    url: 'https://space-readiness.vercel.app/faq',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'FAQ — Multidimensional De-Risking for Space Ventures',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ — Multidimensional De-Risking for Space Ventures',
    description: 'Answers to how our KTH IRL-based, 8-dimension framework de-risks space startups and speeds funding, incl. System Integration readiness.',
    images: ['/api/og'],
  },
  alternates: {
    canonical: 'https://space-readiness.vercel.app/faq',
  },
};

// FAQ data structure
const faqData = [
  {
    id: 'what-is-framework',
    question: 'What is the Multidimensional De-Risking Framework?',
    answer: `It's a practical roadmap to progress from IRL 1→9 across eight dimensions—Technology, Customer/Market, Business Model, Team, IP, Funding, Sustainability, and System Integration—with explicit evidence gates.

Micro-examples:
• A payload startup advances when it pairs lab performance reports with ICDs signed by a bus integrator.
• An EO analytics startup moves up when LoIs convert into paid pilots with data-sharing terms.`
  },
  {
    id: 'different-from-tech',
    question: 'How is this different from tech-only assessments?',
    answer: `We capture the risks that actually stall space ventures: customer proof, integration into value chains, capital roadmap, team gaps, IP/Reg, and sustainability—not just prototypes.

Micro-examples:
• Tech strong but no procurement pathway → Market IRL stalls.
• Impressive demo but no ground-segment integration → Integration IRL stalls.`
  },
  {
    id: 'eight-dimensions',
    question: 'What are the eight dimensions you assess?',
    answer: `Technology, Customer/Market, Business Model, Team, IP, Funding, Sustainability, System Integration.

Micro-examples:
• Funding: a 12-month capital plan mapped to milestones (grants + equity) raises Funding IRL.
• Sustainability: a debris-mitigation plan and EOL strategy raise Sustainability IRL.`
  },
  {
    id: 'system-integration',
    question: 'What is "System Integration Readiness" in space?',
    answer: `It measures how well you plug into the space value chain—technical interfaces and commercial partnerships.

Micro-examples:
• Upstream: propulsion → satellite bus via interface spec + vibration/thermal test evidence with a named partner.
• Downstream: EO platform → customer GIS via a documented data pipeline and pilot acceptance report.`
  },
  {
    id: 'kth-irl-levels',
    question: 'How do the KTH IRL levels work here?',
    answer: `Each dimension progresses 1–9 with evidence. You move up when you check the next gate—no hand-waving.

Micro-ladder (Market):
• IRL 3: 15+ structured interviews; problem statements logged.
• IRL 5: 2–3 signed LoIs or pilots with acceptance criteria.
• IRL 7: Repeatable sales (pipeline coverage ≥3× target) and reference customers.`
  },
  {
    id: 'founders-receive',
    question: 'What do founders receive after an assessment?',
    answer: `• Readiness radar (8 axes, IRL 1–9)
• Bottleneck report (weakest dimensions gating funding)
• Action roadmap (tasks to level-up each lagging dimension)

Micro-examples:
• "Before Seed: raise Market from 4→5 with two paid pilots in ag/insurance."
• "Hire a commercial lead to lift Team 4→5."`
  },
  {
    id: 'investors-use',
    question: 'How do investors use this?',
    answer: `They see where risk concentrates, the quality of evidence, and the time-bound actions that unlock the next round.

Micro-examples:
• Tech 7, Market 3 → "stranded technology" risk.
• Integration <4 → require at least one named integration partner pre-term sheet.`
  },
  {
    id: 'fit-models',
    question: 'Does this fit upstream, downstream, and hybrid models?',
    answer: `Yes—evidence gates are calibrated by archetype.

Micro-examples:
• Upstream: qualification plan aligned to ECSS/NASA references + AIT partner letter.
• Downstream: data usage rights + enterprise security review pass.`
  },
  {
    id: 'valid-evidence',
    question: 'What counts as valid "evidence" to level up?',
    answer: `Signed documents, test/qualification reports, paid pilots, revenue artifacts, IP filings—verifiable artifacts.

Micro-examples by dimension:
• Business: pricing sheet + unit economics workbook (COGS assumptions, sensitivity).
• IP: provisional patent + FTO memo; for software: license and data rights.
• Integration: ICD, ground segment test logs, letter from prime confirming fit.`
  },
  {
    id: 'mature-tech',
    question: 'Do I need mature tech to benefit?',
    answer: `No. Teams at IRL 2–4 gain the most by advancing Market, Funding, and Integration in parallel with engineering.

Micro-example:
With only a benchtop demo, you can still hit Market IRL 4–5 via LoIs + pilots.`
  },
  {
    id: 'regulation-export',
    question: 'How do regulation and export controls appear in the model?',
    answer: `Regulatory steps show up across IP, Funding, Sustainability, and Integration gates.

Micro-examples:
• Frequency filing started; debris policy documented.
• Export-control screening complete for target customers.`
  },
  {
    id: 'funding-milestones',
    question: 'What do typical funding milestones look like?',
    answer: `(Indicative; we calibrate per startup.)

Pre-Seed: Market ≥4, Business ≥3, Team ≥4, Tech ≥3
Seed: Market & Business ≥5, Team ≥5, Tech ≥5, Integration ≥4
Series A: Most ≥6; Sustainability & Integration trending ≥5

Micro-example action:
"Hit Seed by converting 2 pilots to paid and securing one integration partner."`
  },
  {
    id: 'eo-analytics-blockers',
    question: 'EO analytics startup—common blockers?',
    answer: `• Willingness-to-pay proof too thin (Market <5)
• Enterprise integration gaps (APIs, SLAs) (Integration <4)

Micro-examples:
• Convert POCs to paid pilots with acceptance criteria.
• Deliver a data-security pack + customer SOC2 check.`
  },
  {
    id: 'propulsion-component-blockers',
    question: 'Propulsion/component startup—typical blockers?',
    answer: `• Missing ICDs/qualification path with named partners
• Supply-chain scalability unclear

Micro-examples:
• Publish a QM/QC plan and show a second-source vendor.`
  },
  {
    id: 'sustainability-influence',
    question: 'How does Sustainability influence readiness?',
    answer: `It's a first-class dimension tied to capital and partnerships.

Micro-examples:
• Debris-mitigation approach and EOL plan documented.
• ESG policy + cadence (quarterly or semiannual).`
  },
  {
    id: 'agent-approach',
    question: 'What\'s the "agent" approach?',
    answer: `Each dimension is assessed by a specialized AI agent that outputs: IRL score, confidence, evidence-based justification, and a next step.

Micro-example:
MarketAgent: "IRL 5, Medium confidence — 3 LoIs + 1 paid pilot; next: 2 paid renewals."`
  },
  {
    id: 'replace-human-judgment',
    question: 'Will this replace human judgment?',
    answer: `No—think standardized co-pilot for diligence and road-mapping.

Micro-example:
Advisors review the agent's recommendations before board prep.`
  },
  {
    id: 'reassess-frequency',
    question: 'How often should we reassess?',
    answer: `At each milestone (new LoIs, test results, filings, partner letters) or monthly.

Micro-example:
"Post-thermal-vac test and first paid pilot → re-score Integration & Market."`
  },
  {
    id: 'inputs-needed',
    question: 'What inputs do you need?',
    answer: `Pitch, tech brief, test/qualification plan, customer pipeline & LoIs, pricing/UE, IP/FTO status, regulatory steps, partner letters, ICDs/APIs, sustainability policies.

Micro-example checklist:
1–2 page tech brief, 3 LoIs, pilot SOW, pricing sheet, unit economics, ICD v0.9.`
  },
  {
    id: 'end-goal',
    question: 'What\'s the end goal?',
    answer: `Balanced progress across all 8 dimensions so you become investable earlier—with the evidence investors and partners require.

Micro-example outcome:
"All core dimensions ≥5; Integration & Sustainability ≥4 → ready for Seed outreach."`
  }
];


export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0">
                <span className="text-xl font-bold text-gray-900">Space Readiness</span>
              </Link>
            </div>
            <div className="flex items-center">
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
        {/* Breadcrumbs */}
        <nav className="mx-auto max-w-4xl py-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-gray-700">Home</Link>
            </li>
            <li>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li className="text-gray-900">FAQ</li>
          </ol>
        </nav>

        {/* Header */}
        <section className="mx-auto max-w-4xl py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            FAQ — Multidimensional De-Risking for Space Ventures
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            This FAQ explains how our KTH Innovation Readiness Level (IRL)–based model de-risks space ventures across 8 dimensions, including System Integration Readiness. It&apos;s designed for upstream, downstream, and hybrid space startups.
          </p>
        </section>

        {/* FAQ Accordion */}
        <section className="mx-auto max-w-4xl py-8">
          <FAQAccordion items={faqData} />
        </section>

        {/* CTA Section */}
        <section className="mx-auto max-w-4xl py-16 border-t">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Still have questions?</h2>
            <p className="text-gray-600 mb-8">
              Check the docs or Get Started to upload your materials and receive your first readiness radar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/signup" 
                className="rounded-xl bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
              <Link 
                href="/" 
                className="rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </section>
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

      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqData.map(item => ({
              "@type": "Question",
              "name": item.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
              }
            }))
          })
        }}
      />
    </div>
  );
}
