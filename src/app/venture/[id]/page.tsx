'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useVenture } from '@/contexts/VentureContext';
import { getStages, Stage, getStageById } from '@/lib/stages-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppHeader from '@/components/AppHeader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Venture {
  id: string;
  name: string;
  stage?: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export default function VentureManagement() {
  const params = useParams();
  const router = useRouter();
  const { ventures, refreshVentures } = useVenture();
  const [venture, setVenture] = useState<Venture | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    stage: '',
    description: '',
  });

  const ventureId = params.id as string;

  useEffect(() => {
    const loadVenture = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load stages first
        const stagesData = await getStages();
        setStages(stagesData);

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          setError('Please log in to view venture details');
          return;
        }

        // First try to find in context
        const contextVenture = ventures.find(v => v.id === ventureId);
        if (contextVenture) {
          setVenture(contextVenture);
          setFormData({
            name: contextVenture.name,
            stage: contextVenture.stage || '',
            description: contextVenture.description || '',
          });
          setIsLoading(false);
          return;
        }

        // If not in context, fetch from database
        const { data, error } = await supabase
          .from('ventures')
          .select('*')
          .eq('id', ventureId)
          .single();

        if (error) {
          // If venture not found, redirect to dashboard
          if (error.code === 'PGRST116') {
            router.push('/dashboard');
            return;
          }
          
          throw error;
        }

        setVenture(data);
        setFormData({
          name: data.name,
          stage: data.stage || '',
          description: data.description || '',
        });
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
  }, [ventureId, ventures, router]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const updateData = {
        name: formData.name.trim(),
        stage: formData.stage.trim() || null,
        description: formData.description.trim() || null,
      };


      const { error } = await supabase
        .from('ventures')
        .update(updateData)
        .eq('id', ventureId)
        .select();


      if (error) {
        console.error('Database error details:', error);
        throw error;
      }

      // Refresh ventures in context to get updated data
      await refreshVentures();
      
      // Fetch the updated venture directly from database to ensure we have the latest data
      const { data: updatedVenture, error: fetchError } = await supabase
        .from('ventures')
        .select('*')
        .eq('id', ventureId)
        .single();

      if (fetchError) {
        console.error('Error fetching updated venture:', fetchError);
      } else if (updatedVenture) {
        setVenture(updatedVenture);
      }

      setIsEditing(false);
    } catch (err) {
      console.error('Error saving venture:', err);
      setError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);

      // Delete related data first (scores, recommendations)
      await supabase.from('scores').delete().eq('venture_id', ventureId);
      await supabase.from('recommendations').delete().eq('venture_id', ventureId);
      
      // Delete the venture
      const { error } = await supabase
        .from('ventures')
        .delete()
        .eq('id', ventureId);

      if (error) throw error;

      // Refresh ventures in context
      await refreshVentures();
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Error deleting venture:', err);
      setError('Failed to delete venture');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleCancel = () => {
    if (venture) {
      setFormData({
        name: venture.name,
        stage: venture.stage || '',
        description: venture.description || '',
      });
    }
    setIsEditing(false);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading venture details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!venture) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Venture Not Found</h1>
            <p className="mt-2 text-gray-600">The requested venture could not be found.</p>
            <Link
              href="/dashboard"
              className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader showNavigation={false} showBackButton={true} title="Venture Management" />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
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

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Venture Details</CardTitle>
                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venture Name
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter venture name..."
                      className="w-full"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-900">{venture.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stage
                  </label>
                  {isEditing ? (
                    <Select value={formData.stage} onValueChange={(value) => setFormData(prev => ({ ...prev, stage: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage..." />
                      </SelectTrigger>
                      <SelectContent>
                        {stages.map((stage) => (
                          <SelectItem key={stage.id} value={stage.id}>
                            {stage.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-gray-900">
                      {venture.stage ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {getStageById(venture.stage)?.name || venture.stage}
                        </span>
                      ) : (
                        <span className="text-gray-500">No stage specified</span>
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter venture description..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {venture.description || (
                        <span className="text-gray-500 italic">No description provided</span>
                      )}
                    </p>
                  )}
                </div>

                {isEditing && (
                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving || !formData.name.trim()}
                      className="bg-gray-900 hover:bg-gray-800"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
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
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {venture.updated_at && !isNaN(new Date(venture.updated_at).getTime()) ? (
                      new Date(venture.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    ) : (
                      new Date(venture.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Venture ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">{venture.id}</dd>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Venture
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Venture</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{venture.name}&rdquo;? This action cannot be undone and will permanently delete:
            </AlertDialogDescription>
            <div className="mt-2">
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                <li>All assessment scores</li>
                <li>All recommendations</li>
                <li>All uploaded documents</li>
                <li>The venture itself</li>
              </ul>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Venture'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
