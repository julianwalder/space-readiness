'use client';

import Link from 'next/link';
import UserMenu from '@/components/UserMenu';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface InvestorHeaderProps {
  title?: string;
}

export default function InvestorHeader({ title }: InvestorHeaderProps) {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = '/investors/join';
          return;
        }
        setUserEmail(user.email ?? null);
      } catch (err) {
        console.error('Error loading user:', err);
      }
    })();
  }, []);

  return (
    <nav className="border-b border-gray-200 bg-white/80 sticky top-0 z-50" style={{WebkitBackdropFilter: 'blur(8px)', backdropFilter: 'blur(8px)'}}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <Link href="/investors/dashboard" className="text-xl font-bold text-gray-900">
                Space Readiness
              </Link>
            </div>
            <div className="hidden sm:flex items-center">
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="ml-6 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Investor Portal</span>
              </div>
            </div>
            {title && (
              <>
                <div className="h-6 w-px bg-gray-300"></div>
                <h1 className="text-lg font-medium text-gray-900">{title}</h1>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <UserMenu userEmail={userEmail} />
          </div>
        </div>
      </div>
    </nav>
  );
}
