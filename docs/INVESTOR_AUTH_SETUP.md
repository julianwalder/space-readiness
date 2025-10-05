# Investor Authentication Setup

This document describes the implementation of role-aware authentication for both founders and investors using Supabase.

## Overview

The system implements a single authentication flow for both audiences with role-aware signup and RLS-backed authorization. Investors can self-serve at any time, and the system maintains one user table and one session per person.

## Architecture

### Database Schema

1. **User Roles Enum**: `public.user_role` with values `('founder', 'investor', 'admin')`
2. **Profiles Table**: Links to `auth.users` and stores role information
3. **Enhanced Ventures Table**: Now supports both `user_id` (direct ownership) and `org_id` (organization membership)
4. **RLS Policies**: Role-aware policies that allow investors to view all ventures while maintaining data security

### Authentication Flow

1. **Signup**: Users sign up with `intended_role` in user metadata
2. **Role Assignment**: Server-side hooks assign roles to JWT metadata and create profiles
3. **Session Management**: Single session per user with role-based redirects
4. **Data Access**: RLS policies enforce role-based data access

## Setup Instructions

### 1. Database Setup

Run the complete setup script:

```bash
psql -f sql/setup-investor-auth.sql
```

This script will:
- Create the `user_role` enum
- Create the `profiles` table with RLS policies
- Add `user_id` column to ventures table
- Update all RLS policies for role-based access
- Create utility functions for role checking
- Set up triggers for automatic role assignment

### 2. Environment Variables

Ensure these environment variables are set:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Supabase Dashboard Configuration

1. **Authentication Settings**:
   - Enable email/password authentication
   - Enable Google OAuth (if using)
   - Add redirect URLs for both founder and investor flows

2. **Redirect URLs**:
   ```
   https://yourdomain.com/auth/callback
   http://localhost:3000/auth/callback
   ```

3. **JWT Settings**:
   - Ensure JWT tokens include `app_metadata.role`
   - Set appropriate token expiration times

## User Flows

### Founder Signup

1. User visits `/signup`
2. Enters email and signs up with `intended_role: 'founder'`
3. Receives magic link or completes OAuth
4. Redirected to `/dashboard` after authentication
5. Can create and manage their own ventures

### Investor Signup

1. User visits `/investors/join`
2. Enters email and full name with `intended_role: 'investor'`
3. Receives magic link or completes OAuth
4. Redirected to `/investors/dashboard` after authentication
5. Can view all ventures and their readiness scores

### Admin Access

Admins can be created by manually updating the database:

```sql
UPDATE auth.users 
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE id = 'user-uuid';

UPDATE public.profiles 
SET role = 'admin' 
WHERE id = 'user-uuid';
```

## API Endpoints

### Authentication

- `POST /api/auth/handle-signup` - Handle user signup and role assignment
- `POST /api/auth/sync-role` - Sync role between JWT metadata and profiles table

### Role Management

- `getUserProfile()` - Get current user's profile and role
- `getUserRole()` - Get current user's role
- `hasRole(role)` - Check if user has specific role
- `isInvestor()` - Check if user is an investor
- `isFounder()` - Check if user is a founder
- `getDashboardUrl()` - Get appropriate dashboard URL based on role

## RLS Policies

### Key Policies

1. **Ventures Access**:
   - Founders: Can access their own ventures (via `user_id`)
   - Organizations: Members can access org ventures (via `memberships`)
   - Investors: Can view all ventures (read-only)

2. **Data Modification**:
   - Only venture owners and org members can create/update ventures
   - Investors have read-only access to all venture data

3. **Scores and Assessments**:
   - Venture owners can create and update scores
   - Investors can view all scores for portfolio tracking

### Utility Functions

- `public.get_user_role()` - Get role from JWT metadata
- `public.is_investor()` - Check if current user is investor
- `public.can_access_venture(uuid)` - Check if user can access specific venture

## Frontend Components

### New Pages

- `/investors/join` - Investor signup page
- `/investors/dashboard` - Investor dashboard showing all ventures

### Updated Components

- Landing page: Replaced "Available Soon" with investor signup links
- Auth callback: Role-based redirects
- Public header: Added investor signup link

### Utility Functions

- `src/lib/auth-utils.ts` - Comprehensive auth utilities
- Role checking, dashboard URL generation, signup helpers

## Security Considerations

1. **JWT Metadata**: Roles are stored in JWT `app_metadata` for fast RLS evaluation
2. **Profile Sync**: Profiles table serves as source of truth for roles
3. **RLS Enforcement**: All data access is controlled by RLS policies
4. **Role Validation**: Server-side validation of roles during signup

## Testing

### Test User Creation

1. **Founder Test**:
   ```bash
   # Sign up at /signup with email
   # Check profile role is 'founder'
   # Verify redirect to /dashboard
   ```

2. **Investor Test**:
   ```bash
   # Sign up at /investors/join with email
   # Check profile role is 'investor'
   # Verify redirect to /investors/dashboard
   # Verify can see all ventures
   ```

### Database Verification

```sql
-- Check user profiles
SELECT id, role, full_name, created_at 
FROM public.profiles 
ORDER BY created_at DESC;

-- Check JWT metadata
SELECT id, raw_app_meta_data 
FROM auth.users 
WHERE raw_app_meta_data ? 'role';

-- Test RLS policies
SET ROLE authenticated;
SELECT * FROM public.ventures; -- Should return different results based on user role
```

## Troubleshooting

### Common Issues

1. **Role Not Set**: Check if `handle_new_user` trigger is working
2. **RLS Denied**: Verify JWT metadata includes role
3. **Redirect Issues**: Check auth callback logic and role detection
4. **Profile Missing**: Ensure profile creation in signup flow

### Debug Queries

```sql
-- Check if user has profile
SELECT * FROM public.profiles WHERE id = 'user-uuid';

-- Check JWT metadata
SELECT raw_app_meta_data FROM auth.users WHERE id = 'user-uuid';

-- Test role function
SELECT public.get_user_role();

-- Check RLS policies
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM public.ventures;
```

## Future Enhancements

1. **Portfolio Management**: Allow investors to follow specific ventures
2. **Notifications**: Alert investors when followed ventures update
3. **Analytics**: Investor-specific analytics and reporting
4. **Permissions**: Granular permissions within investor role
5. **API Keys**: Investor API access for portfolio tracking

## Maintenance

### Regular Tasks

1. **Monitor Role Assignment**: Check that new users get correct roles
2. **RLS Policy Updates**: Review policies when adding new tables
3. **JWT Metadata Sync**: Ensure roles stay in sync between JWT and profiles
4. **Performance Monitoring**: Monitor RLS policy performance

### Backup and Recovery

1. **Profile Data**: Regular backups of profiles table
2. **RLS Policies**: Version control for policy changes
3. **Role Assignments**: Audit trail for role changes

