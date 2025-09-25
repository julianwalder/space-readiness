'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useVenture } from '@/contexts/VentureContext';
import VentureSelector from '@/components/VentureSelector';

export default function Assessment() {
  const { currentVenture } = useVenture();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasFiles, setHasFiles] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkRequirements() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = '/signup';
          return;
        }

        // Check if user has uploaded files for the current venture
        if (currentVenture) {
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
        }
      } catch (error) {
        console.error('Error checking requirements:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkRequirements();
  }, [currentVenture]);

  const runAssessment = async () => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Check if user is signed in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage('Please sign in to run assessment');
        setIsSuccess(false);
        return;
      }

      // Check if we have a current venture
      if (!currentVenture) {
        setMessage('Please select a venture first.');
        setIsSuccess(false);
        return;
      }

      const ventureId = currentVenture.id;

      // Submit assessment job to API
      const response = await fetch('/api/assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ventureId }),
      });

      const result = await response.json();

      if (result.ok) {
        const messageText = hasFiles 
          ? `Assessment job submitted successfully! Job ID: ${result.jobId}. Your readiness scores will be updated shortly.`
          : `Basic assessment job submitted successfully! Job ID: ${result.jobId}. Analysis will be based on venture information only. Your readiness scores will be updated shortly.`;
        setMessage(messageText);
        setIsSuccess(true);
      } else {
        setMessage(`Failed to submit assessment: ${result.error}`);
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Assessment error:', error);
      setMessage('Failed to submit assessment. Please try again.');
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  const canRunAssessment = currentVenture !== null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                Space Readiness
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Run Assessment</h1>
            <p className="mt-2 text-gray-600">
              Analyze your venture data and generate readiness scores across 8 dimensions
            </p>
          </div>

          {/* Venture Selector */}
          <div className="mb-8">
            <VentureSelector />
          </div>

          {/* Requirements Check */}
          <div className="mb-8 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Prerequisites</h2>
            
            <div className="space-y-3">
              <div className={`flex items-center p-3 rounded-lg border ${
                currentVenture 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex-shrink-0">
                  {currentVenture ? (
                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentVenture ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    Venture Selection
                  </p>
                  <p className={`text-sm ${
                    currentVenture ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {currentVenture 
                      ? `Selected: ${currentVenture.name}` 
                      : 'Please select a venture from the dropdown above'
                    }
                  </p>
                </div>
                {!currentVenture && (
                  <div className="ml-auto">
                    <Link
                      href="/intake"
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      Create Venture →
                    </Link>
                  </div>
                )}
              </div>

              <div className={`flex items-center p-3 rounded-lg border ${
                hasFiles 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex-shrink-0">
                  {hasFiles ? (
                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    hasFiles ? 'text-green-800' : 'text-blue-800'
                  }`}>
                    Supporting Documents (Optional)
                  </p>
                  <p className={`text-sm ${
                    hasFiles ? 'text-green-700' : 'text-blue-700'
                  }`}>
                    {hasFiles 
                      ? 'Documents uploaded - will enhance analysis quality' 
                      : 'No documents uploaded - analysis will use basic venture information'
                    }
                  </p>
                </div>
                {!hasFiles && (
                  <div className="ml-auto">
                    <Link
                      href="/upload"
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      Upload →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Warning for no files */}
          {currentVenture && !hasFiles && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Analysis Without Documents</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>You can run the assessment without uploading documents, but the analysis will be based only on the basic venture information from your intake form. For more comprehensive and accurate results, consider uploading supporting documents like:</p>
                    <ul className="mt-2 list-disc list-inside space-y-1">
                      <li>Business plans or pitch decks</li>
                      <li>Financial projections</li>
                      <li>Market research reports</li>
                      <li>Technical specifications</li>
                      <li>Team resumes or profiles</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Assessment Button */}
          <div className="text-center">
            <button
              onClick={runAssessment}
              disabled={!canRunAssessment || isSubmitting}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Running Assessment...
                </>
              ) : (
                <>
                  <svg className="-ml-1 mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {hasFiles ? 'Start Assessment' : 'Start Basic Assessment'}
                </>
              )}
            </button>
          </div>

          {/* Status Message */}
          {message && (
            <div className={`mt-6 p-4 rounded-md ${
              isSuccess 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {isSuccess ? (
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    isSuccess ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* What Happens Next */}
          <div className="mt-8 p-4 bg-blue-50 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">What happens during assessment?</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>AI agents analyze your venture information and uploaded documents</li>
                    <li>Each dimension is evaluated with evidence-backed scoring (1-9 scale)</li>
                    <li>Confidence levels are calculated based on available data quality</li>
                    <li>Results are saved to your dashboard for review</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          {isSuccess && (
            <div className="mt-6 text-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
              >
                View Results in Dashboard →
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
