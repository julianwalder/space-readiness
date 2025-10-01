import Link from 'next/link';

interface PublicHeaderProps {
  showGetStarted?: boolean;
}

export default function PublicHeader({ showGetStarted = true }: PublicHeaderProps) {
  return (
    <nav className="border-b border-gray-200 bg-white/90 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="text-xl font-bold text-gray-900">Space Readiness</span>
            </Link>
          </div>
          {showGetStarted && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-400 hidden sm:block">
                For Investors - Available Soon
              </span>
              <Link 
                href="/signup" 
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
