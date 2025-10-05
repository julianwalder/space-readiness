import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }

    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Determine role based on redirect path or user metadata
      let intendedRole = user.user_metadata?.intended_role || 'founder'

      if (next.includes('/investors/')) {
        intendedRole = 'investor'
      } else if (next.includes('/admin/')) {
        intendedRole = 'admin'
      }

      // Use admin client to update user metadata and profile
      const supabaseAdmin = await createAdminClient()

      try {
        // Update JWT metadata with role
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          app_metadata: { role: intendedRole }
        })

        // Upsert profile with role
        await supabaseAdmin
          .from('profiles')
          .upsert({
            id: user.id,
            role: intendedRole,
            full_name: user.user_metadata?.full_name ||
                      user.user_metadata?.name ||
                      user.email?.split('@')[0] || '',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })

        console.log('User authenticated with role:', intendedRole)
      } catch (updateError) {
        console.error('Error updating user role:', updateError)
        // Continue with redirect even if role update fails
      }

      // Determine final redirect based on role
      let redirectPath = next
      if (!next || next === '/dashboard') {
        if (intendedRole === 'investor') {
          redirectPath = '/investors/dashboard'
        } else if (intendedRole === 'admin') {
          redirectPath = '/admin/dashboard'
        } else {
          redirectPath = '/dashboard'
        }
      }

      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  // Return to error page if authentication fails
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
