import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use admin client to delete the user account
    const supabaseAdmin = await createAdminClient();

    // Delete user account (this will cascade delete related data due to foreign key constraints)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error('Error deleting user account:', deleteError);
      return NextResponse.json({ 
        error: 'Failed to delete account. Please contact support.' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Account deletion request processed successfully'
    });

  } catch (error) {
    console.error('Unexpected error during account deletion:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
