'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import InvestorHeader from '@/components/InvestorHeader';
import { getStageById } from '@/lib/stages-service';

interface Venture {
  id: string;
  name: string;
  stage?: string;
  description?: string;
  is_demo?: boolean;
  visible_to_investors?: boolean;
  created_at: string;
  updated_at?: string;
}

interface VentureScore {
  venture_id: string;
  dimension: string;
  level: number;
  confidence?: number;
  updated_at: string;
}

export default function InvestorDashboard() {
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [scores, setScores] = useState<Record<string, VentureScore[]>>({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchVenturesAndScores = async () => {
      if (!user) return;

      try {
        // Fetch all ventures visible to investors
        const { data: venturesData, error: venturesError } = await supabase
          .from('ventures')
          .select('*')
          .order('created_at', { ascending: false });

        if (venturesError) {
          // Silently handle - likely RLS policy restriction or missing DB columns
          // This is expected if the database migration hasn't been run yet
          console.log('Unable to load ventures. Database migration may be required.', venturesError);
          setLoading(false);
          return;
        }

        console.log('Loaded ventures:', venturesData?.length || 0, 'ventures');
        setVentures(venturesData || []);

        // Fetch scores for all ventures
        if (venturesData && venturesData.length > 0) {
          const { data: scoresData, error: scoresError } = await supabase
            .from('scores')
            .select('*')
            .in('venture_id', venturesData.map(v => v.id));

          if (scoresError) {
            console.error('Error fetching scores:', scoresError);
            return;
          }

          // Group scores by venture_id
          const scoresByVenture = (scoresData || []).reduce((acc, score) => {
            if (!acc[score.venture_id]) {
              acc[score.venture_id] = [];
            }
            acc[score.venture_id].push(score);
            return acc;
          }, {} as Record<string, VentureScore[]>);

          setScores(scoresByVenture);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenturesAndScores();
  }, [user]);

  const getAverageScore = (ventureId: string) => {
    const ventureScores = scores[ventureId] || [];
    if (ventureScores.length === 0) return null;
    
    const total = ventureScores.reduce((sum, score) => sum + score.level, 0);
    return (total / ventureScores.length).toFixed(1);
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600 bg-green-50';
    if (score >= 5) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getStageBadgeColors = (stage: string) => {
    const stageLower = stage.toLowerCase();
    
    if (stageLower === 'pre_seed') {
      return 'bg-purple-100 text-purple-700';
    } else if (stageLower === 'seed') {
      return 'bg-blue-100 text-blue-700';
    } else if (stageLower === 'series_a') {
      return 'bg-green-100 text-green-700';
    } else {
      // Default color for unknown stages
      return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <InvestorHeader />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <InvestorHeader />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h2>
            <Link href="/investors/join" className="text-blue-600 hover:text-blue-500">
              Sign in as an investor
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <InvestorHeader />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Investor Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Track portfolio ventures and monitor their readiness progress
          </p>
        </div>

        {ventures.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No ventures available</h3>
            <p className="mt-1 text-sm text-gray-500">
              No ventures are currently visible. Ventures will appear here once founders make them visible to investors.
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Note: If you're setting up for the first time, you may need to run the database migration (see docs/INVESTOR_AUTH_SETUP.md).
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ventures.map((venture) => {
              const averageScore = getAverageScore(venture.id);
              const ventureScores = scores[venture.id] || [];
              
              return (
                <div key={venture.id} className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
                  {/* Header - Fixed Container */}
                  <div className="p-6 border-b border-gray-100 h-40 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {venture.name}
                          </h3>
                          {venture.is_demo && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              Demo
                            </span>
                          )}
                        </div>
                        {venture.stage && (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStageBadgeColors(venture.stage)}`}>
                            {getStageById(venture.stage)?.name || venture.stage}
                          </span>
                        )}
                      </div>
                      {averageScore && (
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(parseFloat(averageScore))}`}>
                          {averageScore}/9
                        </div>
                      )}
                    </div>
                    {venture.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 flex-1">
                        {venture.description}
                      </p>
                    )}
                  </div>

                  {/* Content - Flexible Container */}
                  <div className="p-6 flex-1 flex flex-col">
                    
                    {/* Readiness Score - Separate Container */}
                    <div className="bg-gray-50 rounded-lg p-4 flex-1">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <span className="font-medium">Readiness Score</span>
                        <span className="text-xs bg-white px-2 py-1 rounded">{ventureScores.length}/8 dimensions</span>
                      </div>
                      
                      {ventureScores.length > 0 ? (
                        <div className="space-y-2">
                          {ventureScores.slice(0, 3).map((score) => (
                            <div key={score.dimension} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600 capitalize">
                                {score.dimension.replace(/_/g, ' ')}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                score.level >= 7 ? 'bg-green-100 text-green-800' :
                                score.level >= 5 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {score.level}/9
                              </span>
                            </div>
                          ))}
                          {ventureScores.length > 3 && (
                            <div className="text-xs text-gray-500 text-center pt-1">
                              +{ventureScores.length - 3} more dimensions
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 text-center py-4">
                          No assessments completed yet
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 border-t border-gray-100">
                    <Link
                      href={`/investors/venture/${venture.id}`}
                      className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

