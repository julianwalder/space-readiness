import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role key for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Get file information with venture details
    const { data: fileData, error: fileError } = await supabase
      .from('files')
      .select(`
        id,
        path,
        mime,
        size,
        submission_id,
        submissions!inner(
          id,
          venture_id,
          status,
          ventures!inner(
            id,
            name,
            org_id
          )
        )
      `)
      .eq('id', fileId)
      .single();

    if (fileError || !fileData) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this venture
    const venture = fileData.submissions.ventures[0];
    if (venture.org_id) {
      const { data: membership, error: membershipError } = await supabase
        .from('memberships')
        .select('user_id')
        .eq('org_id', venture.org_id)
        .eq('user_id', user.id)
        .single();

      if (membershipError || !membership) {
        return NextResponse.json(
          { error: 'Access denied to this file' },
          { status: 403 }
        );
      }
    }

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('readiness-uploads')
      .remove([fileData.path]);

    if (storageError) {
      console.error('Failed to delete file from storage:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete file record from database (this will cascade to chunks if any)
    const { error: deleteError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId);

    if (deleteError) {
      console.error('Failed to delete file record:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete file record' },
        { status: 500 }
      );
    }

    // Check if this was the last file in the submission
    const { data: remainingFiles, error: remainingError } = await supabase
      .from('files')
      .select('id')
      .eq('submission_id', fileData.submission_id);

    if (!remainingError && (!remainingFiles || remainingFiles.length === 0)) {
      // Delete the submission if no files remain
      await supabase
        .from('submissions')
        .delete()
        .eq('id', fileData.submission_id);
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to download a file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Get file information with venture details
    const { data: fileData, error: fileError } = await supabase
      .from('files')
      .select(`
        id,
        path,
        mime,
        size,
        submissions!inner(
          venture_id,
          ventures!inner(
            id,
            name,
            org_id
          )
        )
      `)
      .eq('id', fileId)
      .single();

    if (fileError || !fileData) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this venture
    const venture = fileData.submissions.ventures[0];
    if (venture.org_id) {
      const { data: membership, error: membershipError } = await supabase
        .from('memberships')
        .select('user_id')
        .eq('org_id', venture.org_id)
        .eq('user_id', user.id)
        .single();

      if (membershipError || !membership) {
        return NextResponse.json(
          { error: 'Access denied to this file' },
          { status: 403 }
        );
      }
    }

    // Get file from storage
    const { data: fileBuffer, error: downloadError } = await supabase.storage
      .from('readiness-uploads')
      .download(fileData.path);

    if (downloadError || !fileBuffer) {
      console.error('Failed to download file:', downloadError);
      return NextResponse.json(
        { error: 'Failed to download file' },
        { status: 500 }
      );
    }

    // Convert blob to buffer
    const arrayBuffer = await fileBuffer.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Return file with appropriate headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': fileData.mime || 'application/octet-stream',
        'Content-Length': fileData.size?.toString() || buffer.length.toString(),
        'Content-Disposition': `attachment; filename="${fileData.path.split('/').pop()}"`,
      },
    });

  } catch (error) {
    console.error('Download file API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
