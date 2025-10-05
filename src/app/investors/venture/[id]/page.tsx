'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import InvestorHeader from '@/components/InvestorHeader';
import { getStageById } from '@/lib/stages-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReadinessRadarChart from '@/components/ReadinessRadarChart';
import ReadinessScoresTable from '@/components/ReadinessScoresTable';

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
  dimension: string;
  level: number;
  confidence?: number;
  justification?: string;
  updated_at: string;
}

export default function InvestorVentureDetail() {
  const params = useParams();
  const router = useRouter();
  const [venture, setVenture] = useState<Venture | null>(null);
  const [scores, setScores] = useState<VentureScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ventureId = params.id as string;

  useEffect(() => {
    const loadVenture = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const supabase = createClient();

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push('/investors/join');
          return;
        }

        // Fetch venture details
        const { data: ventureData, error: ventureError } = await supabase
          .from('ventures')
          .select('*')
          .eq('id', ventureId)
          .single();

        if (ventureError) {
          if (ventureError.code === 'PGRST116') {
            setError('Venture not found or you do not have permission to view it');
            return;
          }
          throw ventureError;
        }

        setVenture(ventureData);

        // Fetch scores for this venture
        const { data: scoresData, error: scoresError } = await supabase
          .from('scores')
          .select('*')
          .eq('venture_id', ventureId)
          .order('dimension');

        if (scoresError) {
          console.error('Error fetching scores:', scoresError);
        } else {
          setScores(scoresData || []);
        }
      } catch (err) {
        console.error('Error loading venture:', err);
        setError('Failed to load venture details');
      } finally {
        setIsLoading(false);
      }
    };

    if (ventureId) {
      loadVenture();
    }
  }, [ventureId, router]);

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'bg-green-100 text-green-800';
    if (score >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getAverageScore = () => {
    if (scores.length === 0) return null;
    const total = scores.reduce((sum, score) => sum + score.level, 0);
    return (total / scores.length).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <InvestorHeader />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading venture details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !venture) {
    return (
      <div className="min-h-screen bg-gray-50">
        <InvestorHeader />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Venture Not Found</h1>
            <p className="mt-2 text-gray-600">{error || 'The requested venture could not be found.'}</p>
            <Link
              href="/investors/dashboard"
              className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const averageScore = getAverageScore();

  return (
    <div className="min-h-screen bg-gray-50">
      <InvestorHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/investors/dashboard"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{venture.name}</h1>
                {venture.is_demo && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Demo
                  </span>
                )}
              </div>
              {venture.stage && (
                <p className="text-gray-600">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {getStageById(venture.stage)?.name || venture.stage}
                  </span>
                </p>
              )}
            </div>
            {averageScore && (
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{averageScore}</div>
                <div className="text-sm text-gray-500">Average Score</div>
              </div>
            )}
          </div>
        </div>

        {/* Primary Assessment Visualization - Chart and Scores */}
        {scores.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Readiness Assessment</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <ReadinessRadarChart 
                scores={scores} 
              />
              <ReadinessScoresTable 
                scores={scores}
                title="Detailed Scores"
              />
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No Assessments Yet</h3>
              <p className="mt-2 text-sm text-gray-500">
                This venture hasn&apos;t completed any readiness assessments.
              </p>
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {venture.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{venture.description}</p>
                </CardContent>
              </Card>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Venture Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Venture Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(venture.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </dd>
                </div>
                {venture.updated_at && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(venture.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Assessment Progress</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {scores.length}/8 dimensions assessed
                  </dd>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
