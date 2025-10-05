import { createClient } from './supabase/client';

export type UserRole = 'founder' | 'investor' | 'admin';

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get the current user's profile including their role
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return profile;
}

/**
 * Get the current user's role
 */
export async function getUserRole(): Promise<UserRole | null> {
  const profile = await getUserProfile();
  return profile?.role || null;
}

/**
 * Check if the current user has a specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const userRole = await getUserRole();
  return userRole === role;
}

/**
 * Check if the current user is an investor
 */
export async function isInvestor(): Promise<boolean> {
  return hasRole('investor');
}

/**
 * Check if the current user is a founder
 */
export async function isFounder(): Promise<boolean> {
  return hasRole('founder');
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole('admin');
}

/**
 * Get the appropriate dashboard URL based on user role
 */
export async function getDashboardUrl(): Promise<string> {
  const role = await getUserRole();
  
  switch (role) {
    case 'investor':
      return '/investors/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'founder':
    default:
      return '/dashboard';
  }
}

/**
 * Handle role assignment after user signup
 * This should be called after a user successfully signs up
 */
export async function assignUserRole(userId: string, role: UserRole, fullName?: string): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/sync-role', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        role,
        fullName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error assigning user role:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error assigning user role:', error);
    return false;
  }
}

/**
 * Handle user signup with role assignment
 */
export async function handleUserSignup(userId: string, userMetadata: Record<string, unknown>): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/handle-signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        userMetadata,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error handling user signup:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error handling user signup:', error);
    return false;
  }
}

/**
 * Sign up with OTP and role assignment
 */
export async function signUpWithRole(
  email: string,
  role: UserRole,
  fullName?: string,
  redirectTo?: string
): Promise<{ error: Error | null }> {
  const supabase = createClient();
  const defaultRedirect = role === 'investor'
    ? '/investors/dashboard'
    : '/dashboard';

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback?next=${redirectTo || defaultRedirect}`,
      data: {
        intended_role: role,
        full_name: fullName || '',
      },
    },
  });

  return { error };
}

/**
 * Sign up with OAuth and role assignment
 */
export async function signUpWithOAuth(
  provider: 'google' | 'github',
  role: UserRole,
  redirectTo?: string
): Promise<{ error: Error | null }> {
  const supabase = createClient();
  const defaultRedirect = role === 'investor'
    ? '/investors/dashboard'
    : '/dashboard';

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback?next=${redirectTo || defaultRedirect}`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  return { error };
}

