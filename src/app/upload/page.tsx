'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useVenture } from '@/contexts/VentureContext';
import BackHeader from '@/components/BackHeader';

interface UploadedFile {
  id: number;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  submissionId: string;
  submissionStatus: string;
  ventureName: string;
}

export default function Upload() {
  const { currentVenture } = useVenture();
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [referrer, setReferrer] = useState<string | null>(null);

  const loadUploadedFiles = useCallback(async () => {
    if (!currentVenture) return;

    setIsLoadingFiles(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setMessage('Please sign in to view files');
        setIsSuccess(false);
        return;
      }

      const response = await fetch(`/api/upload?ventureId=${currentVenture.id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUploadedFiles(data.files || []);
      } else {
        console.error('Failed to load files');
      }
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setIsLoadingFiles(false);
    }
  }, [currentVenture]);

  useEffect(() => {
    // Get the referrer from the URL search params
    const urlParams = new URLSearchParams(window.location.search);
    const fromParam = urlParams.get('from');
    
    if (fromParam) {
      setReferrer(fromParam);
    } else if (document.referrer) {
      try {
        const referrerUrl = new URL(document.referrer);
        setReferrer(referrerUrl.pathname);
      } catch {
        setReferrer('/dashboard');
      }
    } else {
      setReferrer('/dashboard');
    }

    // Load existing files if a venture is selected
    if (currentVenture) {
      loadUploadedFiles();
    }
  }, [currentVenture, loadUploadedFiles]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset the file input immediately to prevent double uploads
    e.target.value = '';

    if (!currentVenture) {
      setMessage('Please select a venture first');
      setIsSuccess(false);
      return;
    }

    // Basic validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setMessage('File size must be less than 10MB');
      setIsSuccess(false);
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage('Please upload PDF, Word, PowerPoint, Excel, or text files only');
      setIsSuccess(false);
      return;
    }

    setIsUploading(true);
    setMessage(null);
    setIsSuccess(false);

    // Set a timeout to prevent infinite uploading state
    const uploadTimeout = setTimeout(() => {
      setIsUploading(false);
      setMessage('Upload timeout - please try again');
      setIsSuccess(false);
    }, 30000); // 30 second timeout

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        clearTimeout(uploadTimeout);
        setIsUploading(false);
        setMessage('Please sign in to upload files');
        setIsSuccess(false);
        return;
      }

      // Convert file to base64
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Upload file via API
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          ventureId: currentVenture.id,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          fileContent: fileContent
        })
      });

      const data = await response.json();
      console.log('Upload response:', { status: response.status, data });

      if (response.ok && data.success) {
        setMessage(data.message);
        setIsSuccess(true);
        
        // Reload files list
        await loadUploadedFiles();
      } else {
        setMessage(data.error || 'Upload failed');
        setIsSuccess(false);
      }
    } catch (err) {
      console.error('Upload error:', err);
      clearTimeout(uploadTimeout);
      setIsUploading(false);
      setMessage('An unexpected error occurred during upload');
      setIsSuccess(false);
    } finally {
      // Ensure timeout is cleared and uploading state is reset
      clearTimeout(uploadTimeout);
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: number, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setMessage('Please sign in to delete files');
        setIsSuccess(false);
        return;
      }

      const response = await fetch(`/api/upload/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(`File "${fileName}" deleted successfully`);
        setIsSuccess(true);
        await loadUploadedFiles();
      } else {
        setMessage(data.error || 'Failed to delete file');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage('An unexpected error occurred while deleting the file');
      setIsSuccess(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <BackHeader backLabel={`Back to ${referrer === '/dashboard' ? 'Dashboard' : 'Previous Page'}`} />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Upload Documents</h1>
            <p className="mt-2 text-gray-600">
              Upload your pitch deck, technical reports, letters of intent, and other supporting documents
            </p>
            {currentVenture && (
              <p className="mt-1 text-sm text-blue-600">
                Uploading for: <strong>{currentVenture.name}</strong>
              </p>
            )}
          </div>

          {!currentVenture && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">No Venture Selected</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Please select a venture from the dropdown above to upload documents.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload Area */}
          <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            currentVenture 
              ? 'border-gray-300 hover:border-gray-400' 
              : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="space-y-4">
              <div className="text-4xl">📄</div>
              <div>
                <label htmlFor="file-upload" className={`cursor-pointer ${!currentVenture ? 'pointer-events-none' : ''}`}>
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Choose files to upload
                  </span>
                  <span className="mt-1 block text-sm text-gray-500">
                    PDF, Word, PowerPoint, Excel, or text files (max 10MB)
                  </span>
                </label>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileUpload}
                  disabled={isUploading || !currentVenture}
                  accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={isUploading || !currentVenture}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Select Files
                    </>
                  )}
                </button>
              </div>
            </div>
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

          {/* Uploaded Files List */}
          {currentVenture && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Uploaded Files</h3>
                {isLoadingFiles && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                )}
              </div>
              
              {uploadedFiles.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            File Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Size
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Uploaded
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {uploadedFiles.map((file) => (
                          <tr key={file.id}>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8">
                                  <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                                    <span className="text-xs font-medium text-blue-600">
                                      {file.fileName.split('.').pop()?.toUpperCase().slice(0, 3)}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4 min-w-0 flex-1">
                                  <div className="text-sm font-medium text-gray-900 truncate">
                                    {file.fileName}
                                  </div>
                                  <div className="text-sm text-gray-500 truncate">
                                    {file.mimeType}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatFileSize(file.size)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                file.submissionStatus === 'completed' 
                                  ? 'bg-green-100 text-green-800'
                                  : file.submissionStatus === 'processing'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {file.submissionStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(file.uploadedAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleDeleteFile(file.id, file.fileName)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">📁</div>
                  <p>No files uploaded yet</p>
                  <p className="text-sm">Upload your first document to get started</p>
                </div>
              )}
            </div>
          )}

          {/* Help Text */}
          <div className="mt-8 p-4 bg-blue-50 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Upload Tips</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Supported formats: PDF, Word, PowerPoint, Excel, and text files</li>
                    <li>Maximum file size: 10MB per file</li>
                    <li>Files are stored securely and privately</li>
                    <li>Upload your pitch deck, technical reports, and letters of intent</li>
                    <li>Run assessment manually from dimension pages when ready</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}