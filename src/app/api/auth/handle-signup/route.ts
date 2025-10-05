import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userMetadata } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Get the intended role from user metadata
    const intendedRole = userMetadata?.intended_role || 'founder'
    const fullName = userMetadata?.full_name || ''

    // Validate role
    if (!['founder', 'investor', 'admin'].includes(intendedRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const supabaseAdmin = await createAdminClient()

    // Update user's app_metadata with the role
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      app_metadata: { role: intendedRole }
    })

    if (updateError) {
      console.error('Error updating user metadata:', updateError)
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 })
    }

    // Ensure profile exists with correct role
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        role: intendedRole,
        full_name: fullName,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })

    if (profileError) {
      console.error('Error updating profile:', profileError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'User role assigned successfully',
      role: intendedRole
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
