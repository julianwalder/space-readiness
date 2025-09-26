'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const DIMENSIONS = [
  {
    title: 'Technology',
    href: '/dimensions/technology',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    description: 'TRL-aligned maturity'
  },
  {
    title: 'Customer/Market',
    href: '/dimensions/customer-market',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    description: 'Market validation & sales'
  },
  {
    title: 'Business Model',
    href: '/dimensions/business-model',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    description: 'Unit economics & scalability'
  },
  {
    title: 'Team',
    href: '/dimensions/team',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    description: 'Role coverage & governance'
  },
  {
    title: 'IP',
    href: '/dimensions/ip',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    description: 'Intellectual property & grants'
  },
  {
    title: 'Funding',
    href: '/dimensions/funding',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    description: 'Investment & financial roadmap'
  },
  {
    title: 'Sustainability',
    href: '/dimensions/sustainability',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
      </svg>
    ),
    description: 'ESG & responsible innovation'
  },
  {
    title: 'System Integration',
    href: '/dimensions/system-integration',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    description: 'Integration & compatibility'
  }
];

interface NavigationMenuProps {
  className?: string;
}

export default function NavigationMenu({ className }: NavigationMenuProps) {
  const pathname = usePathname();

  return (
    <div className="w-full max-w-screen overflow-hidden">
      <nav className={cn("flex space-x-1", className)}>
        {/* Dashboard Link - Fixed on the left */}
        <div className="flex-shrink-0">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
              pathname === '/dashboard'
                ? "bg-gray-900 text-white border border-gray-900"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            )}
            title="Main dashboard overview"
          >
            <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
            </svg>
            <span className="sm:hidden">Dashboard</span>
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </div>
        
        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 mx-2 my-auto flex-shrink-0"></div>
        
        {/* Dimensions - Scrollable container with fixed gradient hint */}
        <div className="flex-1 relative overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide h-full">
            <div className="flex space-x-1 min-w-max">
              {DIMENSIONS.map((dimension) => {
                const isActive = pathname === dimension.href;
                return (
                  <Link
                    key={dimension.href}
                    href={dimension.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0",
                      isActive
                        ? "bg-gray-900 text-white border border-gray-900"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    )}
                    title={dimension.description}
                  >
                    <span className="sm:hidden">{dimension.title}</span>
                    <div className="hidden sm:flex items-center space-x-2">
                      {dimension.icon}
                      <span>{dimension.title}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Fixed gradient hint for scroll functionality */}
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>
        </div>
      </nav>
    </div>
  );
}
