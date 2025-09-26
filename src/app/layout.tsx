import './globals.css';
import type { Metadata } from 'next';
import { VentureProvider } from '@/contexts/VentureContext';
import RubricPreloader from '@/components/RubricPreloader';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: 'Space Venture Readiness',
  description: 'Multidimensional de-risking for space ventures.',
  openGraph: {
    title: 'Space Venture Readiness',
    description: 'Multidimensional de-risking for space ventures.',
    type: 'website',
    url: 'https://space-readiness.vercel.app',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Space Venture Readiness',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Space Venture Readiness',
    description: 'Multidimensional de-risking for space ventures.',
    images: ['/api/og'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <VentureProvider>
          <RubricPreloader />
          {children}
        </VentureProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
