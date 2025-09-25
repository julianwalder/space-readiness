'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useVenture } from '@/contexts/VentureContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { DIMENSIONS } from '@/lib/constants';

type Score = { dimension: string; level: number; confidence: number };
type Rec = { id: number; dimension: string; action: string; impact: string; eta_weeks: number|null };
type UploadedFile = {
  id: number;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  submissionId: string;
  submissionStatus: string;
  ventureName: string;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function Dashboard() {
  const { currentVenture, ventures } = useVenture();
  const [scores, setScores] = useState<Score[]>([]);
  const [recs, setRecs] = useState<Rec[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data when current venture changes
  useEffect(() => {
    if (!currentVenture) {
      setScores([]);
      setRecs([]);
      setUploadedFiles([]);
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        const vid = currentVenture.id;

        const { data: s } = await supabase.from('scores').select('*').eq('venture_id', vid);
        setScores((s ?? []).map((r: { dimension: string; level: number; confidence?: number }) => ({ dimension: r.dimension, level: r.level, confidence: Number(r.confidence ?? 0.5) })));
        
        const { data: rr } = await supabase.from('recommendations').select('*').eq('venture_id', vid).order('created_at', { ascending: false }).limit(50);
        setRecs((rr ?? []).map((r: { id: number; dimension: string; action: string; impact: string; eta_weeks: number | null }) => ({ id: r.id, dimension: r.dimension, action: r.action, impact: r.impact, eta_weeks: r.eta_weeks })));
        
        // Load uploaded files
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const response = await fetch(`/api/upload?ventureId=${vid}`, {
              headers: {
                'Authorization': `Bearer ${session.access_token}`
              }
            });
            if (response.ok) {
              const data = await response.json();
              setUploadedFiles(data.files || []);
            }
          }
        } catch (fileError) {
          console.error('Error loading files:', fileError);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading venture data:', err);
        setError('Failed to load venture data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Set up real-time subscriptions
    const ch = supabase
      .channel('dash')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scores', filter: `venture_id=eq.${currentVenture.id}` }, loadData)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'recommendations', filter: `venture_id=eq.${currentVenture.id}` }, loadData)
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [currentVenture]);

  // Create radar data showing all dimensions, with real scores where available
  const radarData = DIMENSIONS.map(dimension => {
    const score = scores.find(s => s.dimension === dimension);
    return {
      subject: dimension,
      A: score ? score.level : 1 // Use real score or placeholder value of 1
    };
  });

  // group recommendations by dimension
  const grouped: Record<string, Rec[]> = {};
  recs.forEach(r => { (grouped[r.dimension] ??= []).push(r); });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Readiness Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Track your space venture&apos;s readiness across 8 key dimensions
          </p>
        </div>

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

        {!currentVenture && ventures.length === 0 && (
          <div className="mb-6 rounded-md bg-gray-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-800">No Ventures Found</h3>
                <div className="mt-2 text-sm text-gray-700">
                  Create your first venture using the selector in the header to get started with assessments.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Radar Chart and Scores - Side by Side */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Radar Chart - 50% */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
            <div className="h-96 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fontSize: 12, fill: '#374151' }}
                    tickLine={{ stroke: '#6b7280' }}
                  />
                  <PolarRadiusAxis 
                    domain={[1, 9]} 
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickLine={{ stroke: '#9ca3af' }}
                    axisLine={{ stroke: '#d1d5db' }}
                  />
                  <Radar 
                    name="Level" 
                    dataKey="A" 
                    stroke="#2563eb" 
                    fill="#3b82f6" 
                    fillOpacity={0.4}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
              {scores.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
                    <div className="text-sm font-medium text-gray-600">No Assessments Yet</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Complete assessments to see your actual readiness scores
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Current Scores - 50% */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
            <div>
              {/* Table Header */}
              <div className="grid grid-cols-3 items-center py-2 px-3 bg-gray-100 rounded mb-2">
                <div className="text-sm font-semibold text-gray-700">Dimension</div>
                <div className="text-center text-sm font-semibold text-gray-700">Score</div>
                <div className="text-right text-sm font-semibold text-gray-700">Confidence</div>
              </div>
              {/* All Dimensions - with real scores where available */}
              <div className="space-y-1">
                {DIMENSIONS.map((dimension) => {
                  const score = scores.find(s => s.dimension === dimension);
                  return (
                    <div key={dimension} className="grid grid-cols-3 items-center py-2 px-3 bg-gray-50 rounded">
                      <div className="text-sm font-medium text-gray-900">{dimension}</div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {score ? `${score.level}` : '--'}<span className="text-xs text-gray-500">/9</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600">
                          {score ? `${Math.round(score.confidence * 100)}%` : '--%'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Get Started</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Link 
                href="/assessment" 
                className="flex flex-col items-center rounded-lg border-2 border-blue-200 bg-blue-50 px-6 py-6 text-center hover:bg-blue-100 transition-colors group"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-700 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Start Assessment</h3>
                <p className="text-sm text-gray-600">Complete your readiness evaluation</p>
              </Link>
              
              <Link 
                href="/upload?from=/dashboard" 
                className="flex flex-col items-center rounded-lg border border-gray-200 px-6 py-6 text-center hover:bg-gray-50 transition-colors group"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-gray-200 transition-colors">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Upload Files</h3>
                <p className="text-sm text-gray-600">Share documents for analysis</p>
              </Link>
              
              <Link 
                href="/intake" 
                className="flex flex-col items-center rounded-lg border border-gray-200 px-6 py-6 text-center hover:bg-gray-50 transition-colors group"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-gray-200 transition-colors">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Complete Intake</h3>
                <p className="text-sm text-gray-600">Provide venture information</p>
              </Link>
            </div>
            
            {/* Help Text */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-800">Getting Started</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Start with the assessment to get your baseline readiness scores. You can upload files and complete the intake form at any time to enhance your analysis.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {currentVenture ? (
                <>Current Venture: <span className="font-medium text-gray-900">{currentVenture.name}</span></>
              ) : (
                'Select or create a venture to get started'
              )}
            </div>
          </div>
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="mb-8">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Uploaded Files</h2>
                <Link 
                  href="/upload?from=/dashboard"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All →
                </Link>
              </div>
              <div className="space-y-3">
                {uploadedFiles.slice(0, 3).map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">
                          {file.fileName.split('.').pop()?.toUpperCase().slice(0, 3)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {file.fileName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(file.uploadedAt).toLocaleDateString()} • {formatFileSize(file.size)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        file.submissionStatus === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : file.submissionStatus === 'processing'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {file.submissionStatus}
                      </span>
                    </div>
                  </div>
                ))}
                {uploadedFiles.length > 3 && (
                  <div className="text-center pt-2">
                    <span className="text-sm text-gray-500">
                      +{uploadedFiles.length - 3} more files
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {Object.keys(grouped).length > 0 && (
          <div className="mt-8">
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recommendations</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Actionable items to improve your readiness scores
                </p>
              </div>
              <div className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(grouped).map(([dim, items]) => (
                    <div key={dim} className="rounded-xl border border-gray-200 p-4">
                      <div className="font-semibold text-gray-900 mb-3">{dim}</div>
                      <ul className="space-y-2 text-sm">
                        {items.map(i => (
                          <li key={i.id} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <span className="text-gray-700">{i.action}</span>
                              <span className={`text-xs uppercase px-2 py-1 rounded ${
                                i.impact === 'high' ? 'bg-red-100 text-red-800' :
                                i.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {i.impact}
                              </span>
                            </div>
                            {i.eta_weeks && (
                              <div className="text-xs text-gray-500 mt-2">
                                ETA: {i.eta_weeks} weeks
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
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
