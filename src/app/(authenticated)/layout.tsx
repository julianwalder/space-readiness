import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Space Venture Readiness',
  description: 'Track your space venture\'s readiness across 8 key dimensions',
  openGraph: {
    title: 'Dashboard - Space Venture Readiness',
    description: 'Track your space venture\'s readiness across 8 key dimensions',
    type: 'website',
    url: 'https://space-readiness.vercel.app/dashboard',
    images: [
      {
        url: '/api/og?title=Dashboard&description=Track your space venture\'s readiness across 8 key dimensions',
        width: 1200,
        height: 630,
        alt: 'Space Venture Readiness Dashboard',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard - Space Venture Readiness',
    description: 'Track your space venture\'s readiness across 8 key dimensions',
    images: ['/api/og?title=Dashboard&description=Track your space venture\'s readiness across 8 key dimensions'],
  },
};

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}