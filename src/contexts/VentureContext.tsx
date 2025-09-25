'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Venture {
  id: string;
  name: string;
  stage?: string;
  profile_type?: string;
  description?: string;
  user_id?: string;
  org_id?: string;
  created_at: string;
  updated_at?: string;
}

interface VentureContextType {
  currentVenture: Venture | null;
  setCurrentVenture: (venture: Venture | null) => void;
  ventures: Venture[];
  refreshVentures: (selectNewVentureId?: string) => Promise<void>;
  isLoading: boolean;
}

const VentureContext = createContext<VentureContextType | undefined>(undefined);

export function VentureProvider({ children }: { children: ReactNode }) {
  const [currentVenture, setCurrentVenture] = useState<Venture | null>(null);
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshVentures = useCallback(async (selectNewVentureId?: string) => {
    try {
      const { data, error } = await supabase
        .from('ventures')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      const ventures = data || [];
      
      setVentures(ventures || []);
      
      // If a specific venture ID is provided, select that venture
      if (selectNewVentureId) {
        const newVenture = ventures.find(v => v.id === selectNewVentureId);
        if (newVenture) {
          setCurrentVenture(newVenture);
        }
      } else if (!currentVenture && ventures && ventures.length > 0) {
        // Auto-select first venture if none selected
        setCurrentVenture(ventures[0]);
      }
    } catch (error) {
      console.error('Error loading ventures:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentVenture]);

  useEffect(() => {
    refreshVentures();
  }, [refreshVentures]);

  const value = {
    currentVenture,
    setCurrentVenture,
    ventures,
    refreshVentures,
    isLoading,
  };

  return (
    <VentureContext.Provider value={value}>
      {children}
    </VentureContext.Provider>
  );
}

export function useVenture() {
  const context = useContext(VentureContext);
  if (context === undefined) {
    throw new Error('useVenture must be used within a VentureProvider');
  }
  return context;
}
