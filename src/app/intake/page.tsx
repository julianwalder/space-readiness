'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { getStages, Stage } from '@/lib/stages-service';

type IntakeData = {
  venture_name: string;
  stage: 'preseed' | 'seed' | 'series_a';
  description: string;
};

export default function Intake() {
  const [formData, setFormData] = useState<IntakeData>({
    venture_name: '',
    stage: 'preseed',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [stages, setStages] = useState<Stage[]>([]);

  // Load stages on component mount
  useEffect(() => {
    async function loadStages() {
      try {
        const stagesData = await getStages();
        setStages(stagesData);
      } catch (error) {
        console.error('Error loading stages:', error);
      }
    }
    loadStages();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.venture_name.trim()) {
      setMessage('Venture name is required');
      setIsSuccess(false);
      return;
    }

    if (formData.venture_name.length < 2) {
      setMessage('Venture name must be at least 2 characters');
      setIsSuccess(false);
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage('Please sign in to save your venture information');
        setIsSuccess(false);
        return;
      }

      const { error } = await supabase.from('ventures').insert({
        id: crypto.randomUUID(),
        org_id: null, // set later if you add orgs
        name: formData.venture_name.trim(),
        stage: formData.stage,
        profile_type: 'default',
      });

      if (error) {
        console.error('Database error:', error);
        setMessage(`Failed to save: ${error.message}`);
        setIsSuccess(false);
      } else {
        setMessage('Venture information saved successfully!');
        setIsSuccess(true);
        // Reset form
        setFormData({
          venture_name: '',
          stage: 'preseed',
          description: ''
        });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setMessage('An unexpected error occurred. Please try again.');
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Venture Intake</h1>
            <p className="mt-2 text-gray-600">
              Tell us about your space venture to get started with the readiness assessment
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Venture Name */}
            <div>
              <label htmlFor="venture_name" className="block text-sm font-medium text-gray-700">
                Venture Name *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="venture_name"
                  id="venture_name"
                  required
                  value={formData.venture_name}
                  onChange={handleInputChange}
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter your venture name"
                />
              </div>
            </div>

            {/* Funding Stage */}
            <div>
              <label htmlFor="stage" className="block text-sm font-medium text-gray-700">
                Funding Stage *
              </label>
              <div className="mt-1">
                <select
                  name="stage"
                  id="stage"
                  required
                  value={formData.stage}
                  onChange={handleInputChange}
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                >
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Select the current funding stage of your venture
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Venture Description
              </label>
              <div className="mt-1">
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Describe your space venture, mission, and key objectives..."
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Optional: Provide additional context about your venture
              </p>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : (
                  'Save Venture Information'
                )}
              </button>
            </div>
          </form>

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

          {/* Next Steps */}
          {isSuccess && (
            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Next Steps</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Great! Now you can:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Upload supporting documents (pitch deck, technical reports)</li>
                      <li>Run an assessment to get your readiness scores</li>
                      <li>View your progress in the dashboard</li>
                    </ul>
                  </div>
                  <div className="mt-3 flex space-x-3">
                    <Link
                      href="/upload"
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      Upload Files →
                    </Link>
                    <Link
                      href="/dashboard"
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      Go to Dashboard →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
