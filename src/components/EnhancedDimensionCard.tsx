'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useVenture } from '@/contexts/VentureContext';
import DimensionScoreCard from './DimensionScoreCard';
import FirstTimeAnalysisCard from './FirstTimeAnalysisCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Dimension } from '@/lib/rubric-service';

type Score = { dimension: string; level: number; confidence: number };
type AgentRun = {
  id: number;
  dimension: string;
  output_json: {
    level: number;
    confidence: number;
    justification: string;
    evidence: string[];
    nextSteps: string[];
    recommendations: Array<{
      action: string;
      impact: 'low' | 'medium' | 'high';
      eta_weeks?: number;
      dependency?: string;
    }>;
  };
  confidence: number;
  duration_ms: number;
  evidence_refs: string[];
  flags: string[];
  created_at: string;
};

interface EnhancedDimensionCardProps {
  dimension: string;
  scores: Score[];
  title: string;
  description: string;
}

export default function EnhancedDimensionCard({ dimension, scores, title, description }: EnhancedDimensionCardProps) {
  const { currentVenture } = useVenture();
  const [agentRun, setAgentRun] = useState<AgentRun | null>(null);
  const [isLoadingRun, setIsLoadingRun] = useState(false);
  const [isRerunning, setIsRerunning] = useState(false);
  const [message, setMessage] = useState('');
  const [hasFiles, setHasFiles] = useState(false);

  // Load the latest agent run for this dimension and venture
  const loadAgentRun = async () => {
    if (!currentVenture) return;
    
    setIsLoadingRun(true);
    try {
      console.log('Loading agent run for venture:', currentVenture.id, 'dimension:', dimension);
      
      // Use API endpoint to fetch agent run data
      const response = await fetch(`/api/agent-runs/${currentVenture.id}/${encodeURIComponent(dimension)}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded agent run:', data);
        setAgentRun(data);
      } else if (response.status === 404) {
        console.log('No agent run found for dimension:', dimension, 'venture:', currentVenture.id);
        setAgentRun(null);
      } else {
        console.error('Error loading agent run:', response.status, await response.text());
      }
    } catch (err) {
      console.error('Error loading agent run:', err);
    } finally {
      setIsLoadingRun(false);
    }
  };

  // Check if venture has uploaded files
  const checkForFiles = async () => {
    if (!currentVenture) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const response = await fetch(`/api/upload?ventureId=${currentVenture.id}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setHasFiles(data.files && data.files.length > 0);
        }
      }
    } catch (error) {
      console.error('Error checking files:', error);
    }
  };

  // Load agent run and check files on mount and when venture or dimension changes
  useEffect(() => {
    loadAgentRun();
    checkForFiles();
  }, [currentVenture?.id, dimension, checkForFiles, loadAgentRun]);

  const handleRerun = async () => {
    if (!currentVenture) return;

    setIsRerunning(true);
    try {
      // Trigger a real assessment instead of dummy data
      const response = await fetch('/api/assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ventureId: currentVenture.id
        }),
      });

      const result = await response.json();

      if (result.ok) {
        setMessage('Assessment job submitted successfully! Your readiness scores will be updated shortly.');
        // Reload the agent run after a longer delay to allow processing
        setTimeout(() => {
          loadAgentRun();
          setMessage('');
        }, 5000);
      } else {
        console.error('Failed to trigger assessment:', result.error);
        setMessage(`Failed to trigger assessment: ${result.error}`);
      }
    } catch (error) {
      console.error('Assessment failed:', error);
      setMessage('Failed to trigger assessment. Please try again.');
    } finally {
      setIsRerunning(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Score Card - Always show, even with no data */}
      <DimensionScoreCard
        dimension={dimension as Dimension}
        scores={scores}
        title={title}
        description={description}
      />

      {/* Show unified new venture card if no data exists */}
      {!agentRun && !isLoadingRun && scores.length === 0 && (
        <>
          {/* Message */}
          {message && (
            <div className={`p-3 rounded-md ${message.includes('successfully') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message}
            </div>
          )}
          
          {/* First Time Analysis Card */}
          <FirstTimeAnalysisCard
            dimension={dimension}
            title={title}
            description={description}
            onStartAnalysis={handleRerun}
            isRunning={isRerunning}
            hasFiles={hasFiles}
          />
        </>
      )}

      {/* Message - only show when there's agent data */}
      {message && (agentRun || scores.length > 0) && (
        <div className={`p-3 rounded-md ${message.includes('successfully') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message}
        </div>
      )}

      {/* Agent Analysis */}
      {agentRun && (
        <Card className="overflow-hidden">
          {/* Header with Analysis Summary */}
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">AI Analysis</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Completed on {new Date(agentRun.created_at).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    agentRun.confidence >= 0.8 ? 'bg-green-500' : 
                    agentRun.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className={`text-sm font-semibold ${getConfidenceColor(agentRun.confidence)}`}>
                    {Math.round(agentRun.confidence * 100)}% Confidence
                  </span>
                </div>
                <Badge 
                  variant={agentRun.flags.includes('low_confidence') ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {agentRun.flags.includes('low_confidence') ? 'Low Confidence' : 'High Confidence'}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Assessment Rationale */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-2 mb-3">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-base font-semibold text-gray-900">Assessment Rationale</h3>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-800 leading-relaxed">
                  {agentRun.output_json.justification}
                </p>
              </div>
            </div>

            {/* Evidence & Next Steps Grid */}
            <div className="grid md:grid-cols-2 gap-0">
              {/* Evidence Found */}
              <div className="p-6 border-r border-gray-100">
                <div className="flex items-center space-x-2 mb-3">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-base font-semibold text-gray-900">Evidence Found</h3>
                </div>
                <div className="space-y-3">
                  {(agentRun.output_json.evidence || []).map((evidence, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span className="text-sm text-gray-700 leading-relaxed">{evidence}</span>
                    </div>
                  ))}
                  {(!agentRun.output_json.evidence || agentRun.output_json.evidence.length === 0) && (
                    <div className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg">
                      No specific evidence found for this analysis.
                    </div>
                  )}
                </div>
              </div>

              {/* Immediate Next Steps */}
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h3 className="text-base font-semibold text-gray-900">Immediate Next Steps</h3>
                </div>
                <div className="space-y-3">
                  {(agentRun.output_json.nextSteps || []).map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <span className="text-sm text-gray-700 leading-relaxed">{step}</span>
                    </div>
                  ))}
                  {(!agentRun.output_json.nextSteps || agentRun.output_json.nextSteps.length === 0) && (
                    <div className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg">
                      No specific next steps identified for this analysis.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-base font-semibold text-gray-900">Strategic Recommendations</h3>
              </div>
              <div className="grid gap-4">
                {(agentRun.output_json.recommendations || []).map((rec, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-900 leading-tight flex-1 pr-2">
                        {rec.action}
                      </h4>
                      <Badge variant={getImpactColor(rec.impact)} className="ml-2 flex-shrink-0">
                        {rec.impact} impact
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                      {rec.eta_weeks && (
                        <div className="flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{rec.eta_weeks} weeks</span>
                        </div>
                      )}
                      {rec.dependency && (
                        <div className="flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          <span>{rec.dependency}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {(!agentRun.output_json.recommendations || agentRun.output_json.recommendations.length === 0) && (
                  <div className="text-sm text-gray-500 italic bg-white p-4 rounded-lg border border-gray-200">
                    No specific recommendations available for this analysis.
                  </div>
                )}
              </div>
            </div>

            {/* Re-run Button */}
            <div className="p-6 border-t border-gray-200 bg-white">
              <Button
                onClick={handleRerun}
                disabled={isRerunning}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                {isRerunning ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Running Assessment...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Run New Assessment
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoadingRun && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2 text-sm text-gray-600">Loading analysis for {dimension}...</span>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
