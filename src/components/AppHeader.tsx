'use client';

import Link from 'next/link';
import { useVenture } from '@/contexts/VentureContext';
import VentureSelector from '@/components/VentureSelector';
import UserMenu from '@/components/UserMenu';
import NavigationMenu from '@/components/NavigationMenu';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface AppHeaderProps {
  showNavigation?: boolean;
  showBackButton?: boolean;
  title?: string;
}

export default function AppHeader({ showNavigation = true, showBackButton = false, title }: AppHeaderProps) {
  const { currentVenture, setCurrentVenture, ventures } = useVenture();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { 
          window.location.href = '/signup'; 
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
            <div className="flex-shrink-0 hidden sm:block">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                Space Readiness
              </Link>
            </div>
            <VentureSelector 
              currentVentureId={currentVenture?.id || null}
              onVentureChange={(ventureId) => {
                if (ventureId) {
                  const venture = ventures.find(v => v.id === ventureId);
                  if (venture) {
                    setCurrentVenture(venture);
                  }
                } else {
                  setCurrentVenture(null);
                }
              }}
            />
            {title && (
              <>
                <div className="h-6 w-px bg-gray-300"></div>
                <h1 className="text-lg font-medium text-gray-900">{title}</h1>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </Link>
            )}
            <UserMenu userEmail={userEmail} />
          </div>
        </div>
        
        {showNavigation && (
          <div className="border-t border-gray-200 py-4">
            <NavigationMenu />
          </div>
        )}
      </div>
    </nav>
  );
}
