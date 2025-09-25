'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

type Score = { dimension: string; level: number; confidence: number };
type Rec = { id: number; dimension: string; action: string; impact: string; eta_weeks: number|null };
type Milestone = { id: number; label: string; target_levels_json: Record<string, unknown>; due_date: string };

export default function Demo() {
  const [scores, setScores] = useState<Score[]>([]);
  const [recs, setRecs] = useState<Rec[]>([]);
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDemoData() {
      try {
        // Get the OrbitalPulse Analytics venture
        const { data: venture } = await supabase
          .from('ventures')
          .select('id, name, stage, profile_type')
          .eq('name', 'OrbitalPulse Analytics')
          .single();

        if (!venture) {
          console.log('Demo venture not found');
          setIsLoading(false);
          return;
        }

        // Load scores
        const { data: scoresData } = await supabase
          .from('scores')
          .select('*')
          .eq('venture_id', venture.id);

        if (scoresData) {
          setScores(scoresData.map((r: { dimension: string; level: number; confidence?: number }) => ({
            dimension: r.dimension,
            level: r.level,
            confidence: Number(r.confidence ?? 0.5)
          })));
        }

        // Load recommendations
        const { data: recsData } = await supabase
          .from('recommendations')
          .select('*')
          .eq('venture_id', venture.id)
          .order('created_at', { ascending: false });

        if (recsData) {
          setRecs(recsData.map((r: { id: number; dimension: string; action: string; impact: string; eta_weeks: number | null }) => ({
            id: r.id,
            dimension: r.dimension,
            action: r.action,
            impact: r.impact,
            eta_weeks: r.eta_weeks
          })));
        }

        // Load milestone
        const { data: milestoneData } = await supabase
          .from('milestones')
          .select('*')
          .eq('venture_id', venture.id)
          .single();

        if (milestoneData) {
          setMilestone(milestoneData);
        }

      } catch (error) {
        console.error('Error loading demo data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDemoData();
  }, []);

  const radarData = scores.map(s => ({ subject: s.dimension, A: s.level }));

  // group recommendations by dimension
  const grouped: Record<string, Rec[]> = {};
  recs.forEach(r => { (grouped[r.dimension] ??= []).push(r); });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading demo data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/" className="text-xl font-bold text-gray-900">
                  Space Readiness
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Demo Data</span>
              <Link
                href="/dashboard"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Demo: OrbitalPulse Analytics</h1>
          <p className="mt-2 text-gray-600">
            Downstream EO Analytics • Seed Stage • 8-Dimension Readiness Assessment
          </p>
        </div>

        {/* Radar Chart and Scores - Side by Side */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Radar Chart - 50% */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
            <div className="h-96">
              {radarData.length > 0 ? (
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
              ) : (
                <div className="h-full rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <div className="text-lg font-medium text-gray-700">No scores available</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Current Scores - 50% */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
            {scores.length > 0 ? (
              <div>
                {/* Table Header */}
                <div className="grid grid-cols-3 items-center py-2 px-3 bg-gray-100 rounded mb-2">
                  <div className="text-sm font-semibold text-gray-700">Dimension</div>
                  <div className="text-center text-sm font-semibold text-gray-700">Score</div>
                  <div className="text-right text-sm font-semibold text-gray-700">Confidence</div>
                </div>
                {/* Scores Rows */}
                <div className="space-y-1">
                  {scores.map((score) => (
                    <div key={score.dimension} className="grid grid-cols-3 items-center py-2 px-3 bg-gray-50 rounded">
                      <div className="text-sm font-medium text-gray-900">{score.dimension}</div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{score.level}<span className="text-xs text-gray-500">/9</span></div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600">{Math.round(score.confidence * 100)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">📊</div>
                  <div>No scores available</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Milestone Panel - Below Radar */}
        <div className="mb-8">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Milestone</h2>
            {milestone ? (
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">{milestone.label}</h3>
                  <p className="text-sm text-gray-600">Due: {new Date(milestone.due_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Target Levels:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(milestone.target_levels_json).map(([dim, level]) => (
                      <div key={dim} className="flex justify-between">
                        <span>{dim}:</span>
                        <span className="font-medium">{level}/9</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No milestone set</p>
            )}
          </div>
        </div>


        {/* Recommendations */}
        {Object.keys(grouped).length > 0 && (
          <div className="mt-8">
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recommendations</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Actionable items to improve readiness scores
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
      </main>
    </div>
  );
}
