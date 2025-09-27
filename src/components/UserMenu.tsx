'use client';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

// Get build information
const getBuildInfo = () => {
  const version = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0';
  const buildNumber = process.env.NEXT_PUBLIC_BUILD_NUMBER || process.env.NEXT_PUBLIC_GIT_COMMIT_SHA || 'dev';
  const buildDate = process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString().split('T')[0];
  
  return { version, buildNumber, buildDate };
};

interface UserMenuProps {
  userEmail: string | null;
}

export default function UserMenu({ userEmail }: UserMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buildInfo = getBuildInfo();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-3 py-2 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
          </span>
        </div>
        <span className="hidden">{userEmail}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
              <div className="font-medium">{userEmail}</div>
              <div className="text-xs text-gray-500">Signed in</div>
            </div>
            
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing out...
                </>
              ) : (
                <>
                  <svg className="-ml-1 mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </>
              )}
            </button>
            
            {/* Version Information Footer */}
            <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Version:</span>
                  <span className="font-mono">{buildInfo.version}</span>
                </div>
                <div className="flex justify-between">
                  <span>Build:</span>
                  <span className="font-mono">{buildInfo.buildNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Built:</span>
                  <span className="font-mono">{buildInfo.buildDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
