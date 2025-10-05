import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';

// Press release data
const pressReleases = [
  {
    id: 'multidimensional-framework-launch',
    slug: 'multidimensional-framework-launch',
    title: 'Multidimensional De-Risking Framework to Bridge Space Founders with the Right Funding Solutions',
    dateline: 'Zurich, October 3rd 2025',
    excerpt: 'Julian Walder, student at Space for Business, today announced the launch of the Multidimensional De-Risking Framework for Space Ventures, a breakthrough tool designed to systematically reduce the high risks faced by early-stage space startups and connect founders with the right funding solutions.',
    fullContent: {
      title: 'Multidimensional De-Risking Framework to Bridge Space Founders with the Right Funding Solutions',
      dateline: 'Zurich, October 3rd 2025',
      body: `Julian Walder, student at Space for Business, today announced the launch of the Multidimensional De-Risking Framework for Space Ventures, a breakthrough tool designed to systematically reduce the high risks faced by early-stage space startups and connect founders with the right funding solutions.

**Tackling Space Venture Risk Head-On**

More than half of space startups fail within five years due to long development cycles, market immaturity, and fragmented funding landscapes. Traditional evaluation tools, such as Technology Readiness Levels (TRL), focus too narrowly on engineering milestones and fail to capture the full spectrum of risks.

The new framework expands the scope to eight readiness dimensions — Technology, Market, Business Model, Team, IP, Funding, Sustainability, and System Integration. Each dimension is measured using KTH Innovation Readiness Levels (IRL 1–9), providing founders and investors with clear, evidence-based signals of progress.

**Matching Startups with Capital**

Beyond diagnostics, the framework acts as a navigation system that highlights which funding instruments are most suitable at each stage. For example:

• Pre-Seed founders with promising technology but low market validation are guided toward grants and early-stage angels.
• Seed ventures with signed pilots and integration partners are connected with VCs specializing in early commercialization.
• Series A startups with balanced readiness across dimensions are matched with institutional investors seeking scalable opportunities.

"Space ventures often get stuck between grant funding and institutional capital. Our framework bridges that gap by showing both sides where readiness really stands and pointing to the right financing solution at the right time," said Julian Walder, student at Space for Business.

**Empowering the Ecosystem**

• Founders gain a transparent roadmap and clear next steps.
• Investors see risks quantified across all critical dimensions, lowering due diligence costs.
• Accelerators and agencies get a standardized benchmark to guide cohorts and allocate funding.

**Pilot Phase Underway**

The framework is now being piloted with select upstream and downstream startups, with early results showing stronger investor confidence and faster alignment on funding pathways. A full rollout and certification standard are planned for 2026.

**About Space for Business**

The programme has been developed by three of Europe's renowned business schools in collaboration with the European Space Agency. Through their expertise and experience, an effective learning programme has been formed with a wide variety of learning activities.`,
      contact: {
        name: 'Swiss Aerospace Ventures',
        email: 'hello@swissaerospace.ventures'
      }
    }
  }
];

// Generate static params for all press releases
export async function generateStaticParams() {
  return pressReleases.map((release) => ({
    slug: release.slug,
  }));
}

// Find press release by slug
function getPressRelease(slug: string) {
  return pressReleases.find((release) => release.slug === slug);
}

// Generate metadata for each press release
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const release = getPressRelease(slug);
  
  if (!release) {
    return {
      title: 'Press Release Not Found',
    };
  }

  return {
    title: `${release.title} — Derisk Space`,
    description: release.excerpt,
    openGraph: {
      title: release.title,
      description: release.excerpt,
      type: 'article',
      url: `https://space-readiness.vercel.app/media/${release.slug}`,
      images: [
        {
          url: '/api/og',
          width: 1200,
          height: 630,
          alt: release.title,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: release.title,
      description: release.excerpt,
      images: ['/api/og'],
    },
    alternates: {
      canonical: `https://space-readiness.vercel.app/media/${release.slug}`,
    },
  };
}

export default async function PressReleasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const release = getPressRelease(slug);

  if (!release) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <PublicHeader />

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
            <li>
              <Link href="/media" className="hover:text-gray-700">Media</Link>
            </li>
            <li>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li className="text-gray-900">Press Release</li>
          </ol>
        </nav>

        {/* Press Release Content */}
        <article className="mx-auto max-w-4xl py-12">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{release.fullContent.title}</h1>
            <p className="text-lg text-gray-600 font-semibold">{release.fullContent.dateline}</p>
          </header>

          <div className="prose prose-lg max-w-none">
            <div className="text-gray-700 leading-relaxed">
              {release.fullContent.body.split('\n').map((line, index) => {
                if (line.startsWith('**') && line.endsWith('**')) {
                  const title = line.slice(2, -2);
                  return (
                    <h3 key={index} className="text-xl font-semibold text-gray-900 mt-8 mb-4 first:mt-0">
                      {title}
                    </h3>
                  );
                }
                return (
                  <p key={index} className="mb-4">
                    {line}
                  </p>
                );
              })}
            </div>
          </div>

          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Press Contact:</h2>
            <div className="space-y-2">
              <p><strong>Contact:</strong> {release.fullContent.contact.name}</p>
              <p><strong>Email:</strong> <span className="select-none">hello</span><span className="select-none">@</span><span className="select-none">swissaerospace</span><span className="select-none">.</span><span className="select-none">ventures</span></p>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link 
              href="/media" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Media
            </Link>
            <Link 
              href="/" 
              className="inline-flex items-center text-gray-600 hover:text-gray-700 font-medium"
            >
              Home
            </Link>
          </div>
        </article>
      </main>

      {/* Footer */}
      <Footer />

      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://space-readiness.vercel.app/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Media",
                "item": "https://space-readiness.vercel.app/media"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Press Release",
                "item": `https://space-readiness.vercel.app/media/${release.slug}`
              }
            ]
          })
        }}
      />

      {/* NewsArticle Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": release.title,
            "datePublished": "2024-12-01",
            "author": {
              "@type": "Organization",
              "name": "Space for Business"
            },
            "description": release.excerpt,
            "articleBody": release.fullContent.body,
            "publisher": {
              "@type": "Organization",
              "name": "Space for Business"
            }
          })
        }}
      />
    </div>
  );
}
