// DEPRECATED: Use @/lib/supabase/client instead for client-side code
// This file is kept for backwards compatibility only

import { createClient as createBrowserClient } from './supabase/client'

// For backwards compatibility, export a singleton
// In new code, always call createClient() to get a fresh instance
export const supabase = createBrowserClient()
