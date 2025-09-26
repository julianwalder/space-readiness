'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useVenture } from '@/contexts/VentureContext';
import NavigationMenu from '@/components/NavigationMenu';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';
import VentureSelector from '@/components/VentureSelector';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
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
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                <Link href="/dashboard" className="text-xl font-bold text-gray-900 hidden sm:block">
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
            </div>
            <div className="flex items-center">
              <UserMenu userEmail={userEmail} />
            </div>
          </div>
          
          <div className="border-t border-gray-200 py-4">
            <NavigationMenu />
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
