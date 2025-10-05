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
  
  // Business & Market Fields
  business_model?: 'saas' | 'hardware' | 'services' | 'marketplace' | 'other';
  target_market?: string;
  revenue_model?: 'subscription' | 'one_time' | 'usage_based' | 'licensing' | 'other';
  current_revenue?: number;
  customer_count?: number;
  has_paying_customers?: boolean;
  funding_raised?: number;
  funding_rounds?: number;
  months_to_runway?: number;
  
  // Team & Organization Fields
  team_size?: number;
  founders_count?: number;
  has_technical_cofounder?: boolean;
  has_business_cofounder?: boolean;
  team_experience_years?: number;
  previous_startups?: number;
  industry_experience?: 'space' | 'aerospace' | 'defense' | 'tech' | 'other';
  key_team_members?: string;
  
  // Technology & Product Fields
  product_type?: 'satellite' | 'ground_system' | 'software' | 'hardware' | 'service';
  technology_readiness_level?: number;
  has_prototype?: boolean;
  has_patents?: boolean;
  patent_count?: number;
  regulatory_requirements?: string[];
  certification_status?: 'none' | 'in_progress' | 'completed';
  
  // Market & Customer Fields
  target_customers?: string;
  customer_segments?: string[];
  market_size_estimate?: number;
  competitive_advantage?: string;
  has_competitors?: boolean;
  competitor_names?: string;
  customer_validation_method?: 'interviews' | 'surveys' | 'pilots' | 'none';
  letters_of_intent?: number;
  pilot_customers?: number;
  
  // Operational Fields
  company_age_months?: number;
  location?: string;
  timezone?: string;
  has_office?: boolean;
  remote_team?: boolean;
  key_partnerships?: string;
  supply_chain_status?: 'local' | 'international' | 'mixed';
  manufacturing_approach?: 'in_house' | 'outsourced' | 'hybrid';
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
  const [userRole, setUserRole] = useState<string | null>(null);

  const refreshVentures = useCallback(async (selectNewVentureId?: string) => {
    try {
      // Check user role first
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.app_metadata?.role || 'founder';
      setUserRole(role);

      // Skip venture loading for investors - they have their own dashboard
      if (role === 'investor') {
        setIsLoading(false);
        return;
      }

      console.log('Attempting to load ventures for user:', user?.id, 'role:', role);

      const { data, error } = await supabase
        .from('ventures')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Query result:', { data: data?.length, error });

      if (error) {
        console.error('Error loading ventures:', error);
        console.error('Error JSON:', JSON.stringify(error, null, 2));
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          status: (error as { status?: number }).status,
          statusCode: (error as { statusCode?: number }).statusCode
        });
        setIsLoading(false);
        return;
      }

      const ventures = data || [];
      setVentures(ventures);

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
      // Only log actual errors, not RLS permission denials for investors
      if (userRole !== 'investor') {
        console.error('Error loading ventures:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentVenture, userRole]);

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
