import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, role } = body

    // Validate input
    if (!userId || !role) {
      return NextResponse.json({ error: 'userId and role are required' }, { status: 400 })
    }

    if (!['founder', 'investor', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be founder, investor, or admin' }, { status: 400 })
    }

    const supabaseAdmin = await createAdminClient()

    // Update user's app_metadata with the role
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      app_metadata: { role }
    })

    if (updateError) {
      console.error('Error updating user metadata:', updateError)
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 })
    }

    // Update the profile table as well
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Role updated successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
