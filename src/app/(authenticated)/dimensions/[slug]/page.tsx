'use client';
import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useVenture } from '@/contexts/VentureContext';
import EnhancedDimensionCard from '@/components/EnhancedDimensionCard';

type Score = { dimension: string; level: number; confidence: number };
type Rec = { id: number; dimension: string; action: string; impact: string; eta_weeks: number|null };

// Dimension configuration mapping
const DIMENSION_CONFIG = {
  'technology': {
    dimension: 'Technology',
    title: 'Technology Readiness Levels',
    description: 'This dimension tracks the evolution of your venture&apos;s technical capabilities from initial concept to proven, scalable technology ready for commercial deployment.',
    slug: 'technology'
  },
  'customer-market': {
    dimension: 'Customer/Market',
    title: 'Customer/Market Readiness Levels', 
    description: 'This dimension tracks the evolution of your venture&apos;s market understanding and customer validation from initial assumptions to proven product-market fit.',
    slug: 'customer-market'
  },
  'business-model': {
    dimension: 'Business Model',
    title: 'Business Model Readiness Levels',
    description: 'This dimension tracks the evolution of your venture&apos;s business strategy from initial concept to proven, profitable operations with sustainable growth.',
    slug: 'business-model'
  },
  'team': {
    dimension: 'Team',
    title: 'Team Readiness Levels',
    description: 'This dimension tracks the evolution of your venture&apos;s team composition and capabilities from initial founding team to fully-equipped organization ready for scaling.',
    slug: 'team'
  },
  'ip': {
    dimension: 'IP',
    title: 'IP Readiness Levels',
    description: 'This dimension tracks the evolution of your venture&apos;s intellectual property strategy from initial concepts to comprehensive IP portfolio with clear competitive advantages.',
    slug: 'ip'
  },
  'funding': {
    dimension: 'Funding',
    title: 'Funding Readiness Levels',
    description: 'This dimension tracks the evolution of your venture&apos;s funding strategy from initial capital needs to comprehensive financial roadmap with clear investor appeal.',
    slug: 'funding'
  },
  'sustainability': {
    dimension: 'Sustainability',
    title: 'Sustainability Readiness Levels',
    description: 'This dimension tracks the evolution of your venture&apos;s environmental and social impact considerations from initial awareness to integrated sustainability strategy.',
    slug: 'sustainability'
  },
  'system-integration': {
    dimension: 'System Integration',
    title: 'System Integration Readiness Levels',
    description: 'This dimension tracks the evolution of your venture&apos;s system integration capabilities from standalone solutions to seamlessly integrated ecosystem components.',
    slug: 'system-integration'
  }
} as const;

type DimensionSlug = keyof typeof DIMENSION_CONFIG;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function DimensionPage({ params }: PageProps) {
  const { currentVenture } = useVenture();
  const [scores, setScores] = useState<Score[]>([]);
  const [recs, setRecs] = useState<Rec[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedParams, setResolvedParams] = useState<{ slug: string } | null>(null);

  // Resolve params asynchronously
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const config = resolvedParams ? DIMENSION_CONFIG[resolvedParams.slug as DimensionSlug] : null;

  // Return 404 if slug is not valid
  if (resolvedParams && !config) {
    notFound();
  }

  useEffect(() => {
    if (!currentVenture || !config) {
      setScores([]);
      setRecs([]);
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        const vid = currentVenture.id;

        const { data: s } = await supabase
          .from('scores')
          .select('*')
          .eq('venture_id', vid)
          .eq('dimension', config.dimension);
        
        setScores((s ?? []).map((r: { dimension: string; level: number; confidence?: number }) => ({ 
          dimension: r.dimension, 
          level: r.level, 
          confidence: Number(r.confidence ?? 0.5) 
        })));
        
        const { data: rr } = await supabase
          .from('recommendations')
          .select('*')
          .eq('venture_id', vid)
          .eq('dimension', config.dimension)
          .order('created_at', { ascending: false })
          .limit(20);
        
        setRecs((rr ?? []).map((r: { id: number; dimension: string; action: string; impact: string; eta_weeks: number | null }) => ({ 
          id: r.id, 
          dimension: r.dimension, 
          action: r.action, 
          impact: r.impact, 
          eta_weeks: r.eta_weeks 
        })));
        
        setError(null);
      } catch (err) {
        console.error('Error loading venture data:', err);
        setError('Failed to load venture data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    const ch = supabase
      .channel(config.slug)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'scores', 
        filter: `venture_id=eq.${currentVenture.id}` 
      }, loadData)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'recommendations', 
        filter: `venture_id=eq.${currentVenture.id}` 
      }, loadData)
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [currentVenture, config]);

  if (!resolvedParams || !config) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {!currentVenture && (
        <div className="mb-6 rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">No Ventures Found</h3>
              <div className="mt-2 text-sm text-blue-700">
                Create your first venture using the selector in the header to get started with assessments.
              </div>
            </div>
          </div>
        </div>
      )}

      <EnhancedDimensionCard
        dimension={config.dimension}
        scores={scores}
        title={config.title}
        description={config.description}
      />

      {recs.length > 0 && (
        <div className="mt-8">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{config.dimension} Recommendations</h2>
              <p className="mt-1 text-sm text-gray-600">
                Actionable items to improve your {config.dimension.toLowerCase()} readiness
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recs.map((rec) => (
                  <div key={rec.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-gray-700 font-medium">{rec.action}</span>
                      <span className={`text-xs uppercase px-2 py-1 rounded ${
                        rec.impact === 'high' ? 'bg-red-100 text-red-800' :
                        rec.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rec.impact}
                      </span>
                    </div>
                    {rec.eta_weeks && (
                      <div className="text-xs text-gray-500">
                        ETA: {rec.eta_weeks} weeks
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
