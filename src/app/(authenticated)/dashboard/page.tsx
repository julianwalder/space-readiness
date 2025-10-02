'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { useVenture } from '@/contexts/VentureContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { DIMENSIONS } from '@/lib/constants';
import { Button } from '@/components/ui/button';

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
  const { currentVenture, ventures, isLoading: venturesLoading } = useVenture();
  const [scores, setScores] = useState<Score[]>([]);
  const [recs, setRecs] = useState<Rec[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastIntakeUpdate, setLastIntakeUpdate] = useState<string | null>(null);
  const [lastFileUpload, setLastFileUpload] = useState<string | null>(null);
  const [lastAssessment, setLastAssessment] = useState<string | null>(null);
  const [selectedInvestors, setSelectedInvestors] = useState<number[]>([]);
  const [selectedStartups, setSelectedStartups] = useState<number[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [investorImageErrors, setInvestorImageErrors] = useState<Set<number>>(new Set());

  // Function to handle image loading errors
  const handleImageError = (startupId: number) => {
    setImageErrors(prev => new Set(prev).add(startupId));
  };

  const handleInvestorImageError = (investorId: number) => {
    setInvestorImageErrors(prev => new Set(prev).add(investorId));
  };

  // Function to show coming soon modal
  const showComingSoonModal = (title: string, message: string) => {
    const comingSoonDiv = document.createElement('div');
    comingSoonDiv.className = 'fixed inset-0 z-50 flex items-center justify-center';
    comingSoonDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // Darker background
    comingSoonDiv.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
        <div class="flex items-center mb-4">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
          </div>
        </div>
        <div class="mb-4">
          <p class="text-sm text-gray-600">${message}</p>
        </div>
        <div class="flex justify-end">
          <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Got it
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(comingSoonDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (comingSoonDiv.parentNode) {
        comingSoonDiv.remove();
      }
    }, 5000);
  };

  // Function to fetch file with authentication
  const fetchFileWithAuth = async (fileId: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('No authentication token available');
        throw new Error('No authentication token');
      }

      console.log('Fetching file with ID:', fileId, 'Type:', typeof fileId);
      const response = await fetch(`/api/upload/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      console.log('Blob size:', blob.size);
      const url = URL.createObjectURL(blob);
      setFileUrl(url);
    } catch (error) {
      console.error('Error fetching file:', error);
      setFileUrl(null);
    }
  };

  // Cleanup file URL when component unmounts
  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  // Load data when current venture changes
  useEffect(() => {
    console.log('Dashboard - currentVenture changed:', currentVenture);
    console.log('Dashboard - ventures:', ventures);
    
    // Don't load data if we're still loading ventures or if no current venture
    if (!currentVenture) {
      console.log('Dashboard - No current venture, setting loading to false');
      setScores([]);
      setRecs([]);
      setUploadedFiles([]);
      setLastIntakeUpdate(null);
      setLastFileUpload(null);
      setLastAssessment(null);
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        const vid = currentVenture.id;
        console.log('Dashboard - loading data for venture ID:', vid);

        const { data: s } = await supabase.from('scores').select('*').eq('venture_id', vid);
        setScores((s ?? []).map((r: { dimension: string; level: number; confidence?: number }) => ({ dimension: r.dimension, level: r.level, confidence: Number(r.confidence ?? 0.5) })));
        
        // Get latest agent runs directly for this venture
        const { data: agentRuns } = await supabase
          .from('agent_runs')
          .select('*')
          .eq('venture_id', vid)
          .order('created_at', { ascending: false });
        
        console.log('Dashboard - agentRuns:', agentRuns);
        console.log('Dashboard - agentRuns count:', agentRuns?.length || 0);
        
        // Extract recommendations from agent runs
        const allRecs: Rec[] = [];
        if (agentRuns) {
          agentRuns.forEach(run => {
            console.log('Dashboard - run.output_json:', run.output_json);
            if (run.output_json?.recommendations) {
              console.log('Dashboard - recommendations found:', run.output_json.recommendations);
              run.output_json.recommendations.forEach((rec: { action: string; impact: string; eta_weeks: number }) => {
                allRecs.push({
                  id: run.id,
                  dimension: run.dimension,
                  action: rec.action,
                  impact: rec.impact,
                  eta_weeks: rec.eta_weeks
                });
              });
            }
          });
        }
        console.log('Dashboard - allRecs:', allRecs);
        setRecs(allRecs);
        
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
        
        // Load last action dates
        // 1. Last intake update (venture updated_at)
        if (currentVenture.updated_at) {
          setLastIntakeUpdate(currentVenture.updated_at);
        }
        
        // 2. Last file upload - need to join through submissions
        const { data: lastFile } = await supabase
          .from('files')
          .select('created_at, submissions!inner(venture_id)')
          .eq('submissions.venture_id', vid)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (lastFile) {
          setLastFileUpload(lastFile.created_at);
        }
        
        // 3. Last assessment (submission)
        const { data: lastSubmission } = await supabase
          .from('submissions')
          .select('created_at')
          .eq('venture_id', vid)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (lastSubmission) {
          setLastAssessment(lastSubmission.created_at);
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
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_runs', filter: `venture_id=eq.${currentVenture.id}` }, loadData)
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [currentVenture, ventures]);

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
  
  console.log('Dashboard - recs count:', recs.length);
  console.log('Dashboard - grouped keys:', Object.keys(grouped));

  if (venturesLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {venturesLoading ? 'Loading ventures...' : 'Loading dashboard...'}
          </p>
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
                  <div className="text-center bg-white/80 rounded-lg p-4 border border-gray-200" style={{WebkitBackdropFilter: 'blur(4px)', backdropFilter: 'blur(4px)'}}>
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

        {/* Get Started and Following Investors - Side by Side */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Get Started - 50% */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Get Started</h2>
            <div className="mb-4 text-sm text-gray-600">
              {currentVenture ? (
                <>Current Venture: <span className="font-medium text-gray-900">{currentVenture.name}</span></>
              ) : (
                'Select or create a venture to get started'
              )}
            </div>
            <div className="space-y-3">
              <Link 
                href="/intake" 
                className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border-2 border-blue-200"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900">Complete Intake</div>
                  <div className="text-xs text-gray-600 mt-0.5">Provide venture information</div>
                  {lastIntakeUpdate && (
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Last updated {new Date(lastIntakeUpdate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </Link>
              
              <Link 
                href="/upload?from=/dashboard" 
                className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900">Upload Files</div>
                  <div className="text-xs text-gray-600 mt-0.5">Share documents for analysis</div>
                  {lastFileUpload && (
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Last uploaded {new Date(lastFileUpload).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </Link>
              
              <Link 
                href="/assessment" 
                className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900">Start Assessment</div>
                  <div className="text-xs text-gray-600 mt-0.5">Complete your readiness evaluation</div>
                  {lastAssessment && (
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Last completed {new Date(lastAssessment).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </Link>
            </div>
          </div>

          {/* Following Investors - 50% */}
          {currentVenture && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Following Investors</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Investors tracking your venture&apos;s progress
                  </p>
                </div>
                <Button
                  variant="black"
                  size="sm"
                  onClick={() => {
                    // TODO: Implement share progress functionality
                    showComingSoonModal(
                      'Share Progress Feature',
                      'The share progress feature is coming soon! You\'ll be able to share your venture\'s progress with investors and stakeholders.'
                    );
                  }}
                  className="w-32"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share Progress
              </Button>
              </div>
              
              {/* Mock Investor Data - Replace with real data when available */}
              <div className="space-y-3">
                {[
                  { id: 1, name: 'Sarah Chen', role: 'Partner at Orbital Ventures', initials: 'SC', color: 'bg-purple-500', following_since: '2024-08-15', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces' },
                  { id: 2, name: 'Michael Rodriguez', role: 'Angel Investor', initials: 'MR', color: 'bg-blue-500', following_since: '2024-09-02', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces' },
                  { id: 3, name: 'Jennifer Park', role: 'Principal at Space Capital', initials: 'JP', color: 'bg-green-500', following_since: '2024-09-20', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces' },
                ].map((investor) => (
                  <div 
                    key={investor.id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => {
                      if (selectedInvestors.includes(investor.id)) {
                        setSelectedInvestors(selectedInvestors.filter(id => id !== investor.id));
                      } else {
                        // Show coming soon message when trying to share progress with an investor
                        showComingSoonModal(
                          `Share Progress with ${investor.name}`,
                          `The share progress feature is coming soon! You'll be able to share your venture's progress with ${investor.name} and other investors.`
                        );
                      }
                    }}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-sm">
                        {investorImageErrors.has(investor.id) ? (
                          <div className="w-full h-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                            {investor.initials}
                          </div>
                        ) : (
                          <Image 
                            src={investor.image} 
                            alt={investor.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                            onError={() => handleInvestorImageError(investor.id)}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {investor.name}
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          {investor.role}
                        </div>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Following since {new Date(investor.following_since).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={selectedInvestors.includes(investor.id)}
                        onChange={(e) => {
                          e.stopPropagation(); // Prevent triggering the div click
                          if (e.target.checked) {
                            // Show coming soon message when trying to share progress with an investor
                            showComingSoonModal(
                              `Share Progress with ${investor.name}`,
                              `The share progress feature is coming soon! You'll be able to share your venture's progress with ${investor.name} and other investors.`
                            );
                          } else {
                            setSelectedInvestors(selectedInvestors.filter(id => id !== investor.id));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recommendations */}
        {Object.keys(grouped).length > 0 && (
          <div className="mb-8">
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

        {/* Uploaded Files and Startups to Follow - Stacked on mobile, side by side on desktop */}
        <div className="mb-8 flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-6 w-full">
          {/* Uploaded Files - 50% */}
          {uploadedFiles.length > 0 && (
            <div className="w-full max-w-full rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
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
                  <div 
                    key={file.id} 
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedFile(file);
                      fetchFileWithAuth(file.id);
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">
                          {file.fileName.split('.').pop()?.toUpperCase().slice(0, 3)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {file.fileName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(file.uploadedAt).toLocaleDateString()} • {formatFileSize(file.size)}
                        </div>
                        <div className="mt-1">
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
          )}

          {/* Startups Worth Following - 50% */}
          <div className="w-full max-w-full rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Startups Worth Following</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Learn from successful space ventures
                </p>
              </div>
              <Button
                variant="black"
                size="sm"
                onClick={() => {
                  // TODO: Implement follow startup functionality
                  showComingSoonModal(
                    'Follow Startup Feature',
                    'The follow startup feature is coming soon! You\'ll be able to track and learn from successful space ventures.'
                  );
                }}
                className="w-32"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Follow
              </Button>
            </div>
            
            {/* Mock Startup Data - Replace with real data when available */}
            <div className="space-y-3">
              {[
                { id: 1, name: 'Astra Space', sector: 'Launch Services', stage: 'Pre Seed', following_since: '2024-08-15', image: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=150&h=150&fit=crop&crop=faces', readiness_score: 8 },
                { id: 2, name: 'Relativity Space', sector: '3D Printed Rockets', stage: 'Seed', following_since: '2024-09-02', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces', readiness_score: 7 },
                { id: 3, name: 'Planet Labs', sector: 'Earth Observation', stage: 'Series A', following_since: '2024-09-20', image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=150&h=150&fit=crop&crop=faces', readiness_score: 9 },
              ].map((startup) => (
                <div 
                  key={startup.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => {
                    if (selectedStartups.includes(startup.id)) {
                      setSelectedStartups(selectedStartups.filter(id => id !== startup.id));
                    } else {
                      // Show coming soon message when trying to follow a startup
                      showComingSoonModal(
                        `Follow ${startup.name}`,
                        `The follow startup feature is coming soon! You'll be able to track and learn from ${startup.name} and other successful space ventures.`
                      );
                    }
                  }}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-sm">
                      {imageErrors.has(startup.id) ? (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                          {startup.name.charAt(0)}
                        </div>
                      ) : (
                        <Image 
                          src={startup.image} 
                          alt={startup.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(startup.id)}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {startup.name}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {startup.sector} • {startup.stage}
                      </div>
                      <div className="mt-2">
                        <div className="text-xs font-medium text-green-600">
                          Score: {startup.readiness_score}/9
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={selectedStartups.includes(startup.id)}
                      onChange={(e) => {
                        e.stopPropagation(); // Prevent triggering the div click
                        if (e.target.checked) {
                          // Show coming soon message when trying to follow a startup
                          showComingSoonModal(
                            `Follow ${startup.name}`,
                            `The follow startup feature is coming soon! You'll be able to track and learn from ${startup.name} and other successful space ventures.`
                          );
                        } else {
                          setSelectedStartups(selectedStartups.filter(id => id !== startup.id));
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full-screen file viewer modal */}
        {selectedFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="relative w-full h-full flex flex-col bg-white">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">
                      {selectedFile.fileName.split('.').pop()?.toUpperCase().slice(0, 3)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedFile.fileName}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedFile.uploadedAt).toLocaleDateString()} • {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileUrl) {
                      URL.revokeObjectURL(fileUrl);
                      setFileUrl(null);
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* File content area */}
              <div className="flex-1 p-4 overflow-auto">
                <div className="max-w-4xl mx-auto">
                  {!fileUrl ? (
                    <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-lg font-medium">Loading file...</p>
                    </div>
                  ) : selectedFile.mimeType === 'application/pdf' ? (
                    <iframe
                      src={fileUrl}
                      className="w-full h-full min-h-[600px] border border-gray-200 rounded-lg"
                      title={selectedFile.fileName}
                    />
                  ) : selectedFile.mimeType.startsWith('image/') ? (
                    <Image
                      src={fileUrl}
                      alt={selectedFile.fileName}
                      width={400}
                      height={400}
                      className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                      <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg font-medium">Preview not available</p>
                      <p className="text-sm">This file type cannot be previewed in the browser</p>
                      <a
                        href={fileUrl}
                        download={selectedFile.fileName}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Download File
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
