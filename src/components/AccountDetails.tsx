'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getUserProfile, UserProfile } from '@/lib/auth-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trash2, User, Link, AlertTriangle, Upload, X } from 'lucide-react';
import Image from 'next/image';

interface AccountDetailsProps {
  userEmail: string | null;
}

export default function AccountDetails({ userEmail }: AccountDetailsProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [connections, setConnections] = useState<Array<{provider: string; email: string; connected: boolean; avatar_url?: string}>>([]);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const userProfile = await getUserProfile();
      if (userProfile) {
        setProfile(userProfile);
        // Split full_name into first and last name
        const nameParts = (userProfile.full_name || '').split(' ');
        setFormData({
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || '',
          email: userEmail || '',
        });
        setAvatarUrl(userProfile.avatar_url || null);
      }
      
      // Load user connections
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        
        const providers = [];
        
        // Check for Google connection - look for Google-specific metadata
        const isGoogleUser = user.user_metadata?.iss?.includes('google.com') ||
                           user.user_metadata?.avatar_url?.includes('googleusercontent.com') ||
                           user.identities?.some((identity: { provider: string }) => identity.provider === 'google');
        
        if (isGoogleUser) {
          // Try multiple possible avatar URL fields
          const googleAvatar = user.user_metadata?.avatar_url || 
                             user.user_metadata?.picture || 
                             user.user_metadata?.photo_url;
          
          // If no avatar URL is found, try to construct one from Google's API
          if (!googleAvatar && user.user_metadata?.provider_id) {
            // Google profile pictures can be accessed via: https://lh3.googleusercontent.com/a/{provider_id}
            // But this is not reliable as it depends on the user's privacy settings
            console.log('No Google avatar found in user metadata. Provider ID:', user.user_metadata.provider_id);
          }
          
          providers.push({
            provider: 'Google',
            email: user.email || '',
            connected: true,
            avatar_url: googleAvatar
          });
          
        }
        
        // Check for email/password connection
        if (user.app_metadata?.provider === 'email' || 
            user.identities?.some((identity: { provider: string }) => identity.provider === 'email')) {
          providers.push({
            provider: 'Email',
            email: user.email || '',
            connected: true
          });
        }
        
        setConnections(providers);
        
        // Set Google profile picture as default avatar if available
        const googleConnection = providers.find(p => p.provider === 'Google' && p.avatar_url);
        if (googleConnection?.avatar_url) {
          // Always use Google profile picture as the avatar
          setAvatarUrl(googleConnection.avatar_url);
          
          // Also save it to the database if not already saved
          if (!userProfile?.avatar_url || userProfile.avatar_url !== googleConnection.avatar_url) {
            try {
              await supabase
                .from('profiles')
                .update({
                  avatar_url: googleConnection.avatar_url,
                  updated_at: new Date().toISOString()
                })
                .eq('id', userProfile?.id);
            } catch (error) {
              console.error('Error saving Google avatar to database:', error);
            }
          }
        }
      }
    } catch (err: unknown) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: `${formData.first_name} ${formData.last_name}`.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', profile?.id);

      if (updateError) {
        throw updateError;
      }

      setSuccess('Profile updated successfully');
      await loadProfile();
    } catch (err: unknown) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setAvatarUploading(true);
      setError(null);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile?.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile?.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(publicUrl);
      setSuccess('Avatar updated successfully');
    } catch (err: unknown) {
      console.error('Error uploading avatar:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleteConfirming(false);
      setError(null);

      // Call API to delete account
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      // Sign out and redirect
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (err: unknown) {
      console.error('Error deleting account:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <User className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Account Details</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information and profile picture
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <Avatar className="h-20 w-20 cursor-pointer transition-opacity hover:opacity-80">
                {avatarUrl && <AvatarImage src={avatarUrl} alt="Profile" />}
                <AvatarFallback className="text-lg">
                  {formData.first_name?.charAt(0)?.toUpperCase() || userEmail?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={avatarUploading}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Profile Picture</p>
              <p className="text-sm text-gray-500">
                Click to change • JPG, PNG or GIF • Max 2MB
              </p>
              {avatarUploading && (
                <p className="text-sm text-blue-600">Uploading...</p>
              )}
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="Enter your first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Enter your last name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={formData.email}
                disabled
                className="bg-gray-50"
              />
              <p className="text-sm text-gray-500">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>
            Manage your account connections and sign-in methods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connections.map((connection, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {connection.avatar_url ? (
                    <Image 
                      src={connection.avatar_url} 
                      alt={`${connection.provider} profile`}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Link className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{connection.provider}</p>
                    <p className="text-sm text-gray-500">{connection.email}</p>
                  </div>
                </div>
                <Badge variant="secondary">Connected</Badge>
              </div>
            ))}
            
            {connections.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No connected accounts found
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Danger Zone</span>
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <h3 className="font-medium text-red-800 mb-2">Delete Account</h3>
              <p className="text-sm text-red-700 mb-4">
                Deleting your account is permanent and cannot be undone. Your data will be deleted within 30 days, 
                except we may retain some metadata and logs for longer where required or permitted by law.
              </p>
              
              {!deleteConfirming ? (
                <Button
                  variant="destructive"
                  onClick={() => setDeleteConfirming(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Request to Delete Account
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-red-800">
                    Are you absolutely sure? This action cannot be undone.
                  </p>
                  <div className="flex space-x-3">
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Yes, Delete My Account
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteConfirming(false)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
