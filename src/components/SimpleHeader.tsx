import Link from 'next/link';

interface SimpleHeaderProps {
  showGetStarted?: boolean;
}

export default function SimpleHeader({ showGetStarted = true }: SimpleHeaderProps) {
  return (
    <nav className="border-b border-gray-200 bg-white/80 sticky top-0 z-50" style={{WebkitBackdropFilter: 'blur(8px)', backdropFilter: 'blur(8px)'}}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="text-xl font-bold text-gray-900">Space Readiness</span>
            </Link>
          </div>
          {showGetStarted && (
            <div className="flex items-center">
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
