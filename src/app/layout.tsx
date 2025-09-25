import './globals.css';
import type { Metadata } from 'next';
import { VentureProvider } from '@/contexts/VentureContext';
import RubricPreloader from '@/components/RubricPreloader';

export const metadata: Metadata = {
  title: 'Space Venture Readiness',
  description: 'Multidimensional de-risking for space ventures.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <VentureProvider>
          <RubricPreloader />
          {children}
        </VentureProvider>
      </body>
    </html>
  );
}
