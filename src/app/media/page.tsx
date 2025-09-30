import Link from 'next/link';
import { Metadata } from 'next';
import PublicHeader from '@/components/PublicHeader';

export const metadata: Metadata = {
  title: 'Media & Press — Derisk Space',
  description: 'News, press releases, and media resources from Space for Business, including our multidimensional de-risking framework for space ventures.',
  openGraph: {
    title: 'Media & Press — Derisk Space',
    description: 'News, press releases, and media resources from Space for Business, including our multidimensional de-risking framework for space ventures.',
    type: 'website',
    url: 'https://space-readiness.vercel.app/media',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Media & Press — Derisk Space',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Media & Press — Derisk Space',
    description: 'News, press releases, and media resources from Space for Business, including our multidimensional de-risking framework for space ventures.',
    images: ['/api/og'],
  },
  alternates: {
    canonical: 'https://space-readiness.vercel.app/media',
  },
};

// Press release data - simplified for listing page
const pressReleases = [
  {
    id: 'multidimensional-framework-launch',
    slug: 'multidimensional-framework-launch',
    title: 'Space for Business Launches Multidimensional De-Risking Framework to Bridge Space Founders with the Right Funding Solutions',
    dateline: 'Zurich, October 3rd 2025',
    excerpt: 'Julian Walder, student at Space for Business, today announced the launch of the Multidimensional De-Risking Framework for Space Ventures, a breakthrough tool designed to systematically reduce the high risks faced by early-stage space startups and connect founders with the right funding solutions.'
  }
];

export default function MediaPage() {
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
            <li className="text-gray-900">Media</li>
          </ol>
        </nav>

        {/* Header */}
        <section className="mx-auto max-w-4xl py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Media & Press
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Welcome to our media hub. Find official news, press releases, and resources about our multidimensional de-risking framework for space ventures. For inquiries, see contact details in each release.
          </p>
        </section>

        {/* Latest Press Releases */}
        <section className="mx-auto max-w-4xl py-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-8">Latest Press Releases</h2>
          
          <div className="space-y-8">
            {pressReleases.map((release) => (
              <div key={release.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{release.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{release.dateline}</p>
                <p className="text-gray-700 mb-4 leading-relaxed">{release.excerpt}</p>
                <Link 
                  href={`/media/${release.slug}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  Read release
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </section>


        {/* Media Contact */}
        <section className="mx-auto max-w-4xl py-8 border-t">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">Media Contact</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700 mb-4">
              For interviews, quotes, and background, please reach out.
            </p>
            <div className="space-y-2">
              <p><strong>Contact:</strong> Swiss Aerospace Ventures</p>
              <p><strong>Email:</strong> <span className="select-none">hello</span><span className="select-none">@</span><span className="select-none">swissaerospace</span><span className="select-none">.</span><span className="select-none">ventures</span></p>
            </div>
          </div>
        </section>

        {/* Resources */}
        <section className="mx-auto max-w-4xl py-8 border-t">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">Resources</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Company Overview</h3>
              <p className="text-gray-600 text-sm mb-3">Download our company overview PDF</p>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Download PDF
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Logo Pack</h3>
              <p className="text-gray-600 text-sm mb-3">Official logos and brand assets</p>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Download Pack
              </button>
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
              }
            ]
          })
        }}
      />

    </div>
  );
}
