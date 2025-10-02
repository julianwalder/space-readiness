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
    console.log('DELETE /api/upload/[fileId] - Starting request');
    const { fileId } = await params;
    console.log('File ID for deletion:', fileId);

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
    console.log('Querying file data for deletion...');
    const { data: fileData, error: fileError } = await supabase
      .from('files')
      .select(`
        id,
        path,
        mime,
        size,
        submission_id,
        submissions(
          id,
          venture_id,
          status,
          ventures(
            id,
            name,
            org_id
          )
        )
      `)
      .eq('id', fileId)
      .single();

    if (fileError || !fileData) {
      console.log('File query error:', fileError);
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    console.log('File data found for deletion:', { id: fileData.id, path: fileData.path });

    // Verify user has access to this venture
    console.log('Checking venture access for deletion...');
    console.log('Submissions structure:', JSON.stringify(fileData.submissions, null, 2));
    
    let venture = null;
    
    // Handle the array structure from Supabase
    const submission = Array.isArray(fileData.submissions) ? fileData.submissions[0] : fileData.submissions;
    if (submission && submission.ventures) {
      // Handle ventures array structure
      venture = Array.isArray(submission.ventures) ? submission.ventures[0] : submission.ventures;
    }
    
    // If we still don't have venture data, try a fallback approach
    if (!venture && submission && submission.venture_id) {
      console.log('Falling back to direct venture query for venture_id:', submission.venture_id);
      const { data: ventureData, error: ventureError } = await supabase
        .from('ventures')
        .select('id, name, org_id')
        .eq('id', submission.venture_id)
        .single();
      
      if (ventureData && !ventureError) {
        venture = ventureData;
        console.log('Fallback venture query successful:', venture);
      }
    }
    
    if (!venture) {
      console.error('Could not retrieve venture information for deletion');
      return NextResponse.json(
        { error: 'Could not verify file access permissions' },
        { status: 500 }
      );
    }
    
    console.log('Venture data for deletion:', { id: venture.id, name: venture.name, org_id: venture.org_id });
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
    console.log('Deleting file from storage:', fileData.path);
    const { error: storageError } = await supabase.storage
      .from('readiness-uploads')
      .remove([fileData.path]);

    if (storageError) {
      console.error('Failed to delete file from storage:', storageError);
      // Continue with database deletion even if storage deletion fails
    } else {
      console.log('File deleted from storage successfully');
    }

    // Delete file record from database (this will cascade to chunks if any)
    console.log('Deleting file record from database...');
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
    console.log('File record deleted from database successfully');

    // Check if this was the last file in the submission
    console.log('Checking if submission should be deleted...');
    const { data: remainingFiles, error: remainingError } = await supabase
      .from('files')
      .select('id')
      .eq('submission_id', fileData.submission_id);

    if (!remainingError && (!remainingFiles || remainingFiles.length === 0)) {
      // Delete the submission if no files remain
      console.log('No remaining files, deleting submission:', fileData.submission_id);
      await supabase
        .from('submissions')
        .delete()
        .eq('id', fileData.submission_id);
      console.log('Submission deleted successfully');
    } else {
      console.log('Submission has remaining files, keeping submission');
    }

    console.log('File deletion completed successfully');
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
    console.log('GET /api/upload/[fileId] - Starting request');
    const { fileId } = await params;
    console.log('File ID:', fileId);

    if (!fileId) {
      console.log('Error: File ID is required');
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const authHeader = request.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('Error: Authentication required');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    console.log('Token length:', token.length);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.log('Auth error:', authError);
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    console.log('User authenticated:', user.id);

    // Get file information with venture details
    console.log('Querying file data for ID:', fileId);
    const { data: fileData, error: fileError } = await supabase
      .from('files')
      .select(`
        id,
        path,
        mime,
        size,
        submissions(
          venture_id,
          ventures(
            id,
            name,
            org_id
          )
        )
      `)
      .eq('id', fileId)
      .single();

    if (fileError || !fileData) {
      console.log('File query error:', fileError);
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    console.log('File data found:', { id: fileData.id, path: fileData.path });
    console.log('Submissions data:', fileData.submissions);

    // Verify user has access to this venture
    console.log('Checking venture access...');
    console.log('Submissions structure:', JSON.stringify(fileData.submissions, null, 2));
    
    let venture = null;
    
    // Handle the array structure from Supabase
    const submission = Array.isArray(fileData.submissions) ? fileData.submissions[0] : fileData.submissions;
    if (submission && submission.ventures) {
      // Handle ventures array structure
      venture = Array.isArray(submission.ventures) ? submission.ventures[0] : submission.ventures;
    }
    
    // If we still don't have venture data, try a fallback approach
    if (!venture && submission && submission.venture_id) {
      console.log('Falling back to direct venture query for venture_id:', submission.venture_id);
      const { data: ventureData, error: ventureError } = await supabase
        .from('ventures')
        .select('id, name, org_id')
        .eq('id', submission.venture_id)
        .single();
      
      if (ventureData && !ventureError) {
        venture = ventureData;
        console.log('Fallback venture query successful:', venture);
      }
    }
    
    if (!venture) {
      console.error('Could not retrieve venture information');
      return NextResponse.json(
        { error: 'Could not verify file access permissions' },
        { status: 500 }
      );
    }
    
    console.log('Venture data:', { id: venture.id, name: venture.name, org_id: venture.org_id });
    
    if (venture.org_id) {
      console.log('Checking membership for org_id:', venture.org_id);
      const { data: membership, error: membershipError } = await supabase
        .from('memberships')
        .select('user_id')
        .eq('org_id', venture.org_id)
        .eq('user_id', user.id)
        .single();

      if (membershipError || !membership) {
        console.log('Membership check failed:', membershipError);
        return NextResponse.json(
          { error: 'Access denied to this file' },
          { status: 403 }
        );
      }
      console.log('Membership verified');
    } else {
      console.log('No org_id, skipping membership check');
    }

    // Get file from storage
    console.log('Downloading file from storage:', fileData.path);
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
    console.log('File downloaded successfully, size:', fileBuffer.size);

    // Convert blob to buffer
    console.log('Converting blob to buffer...');
    const arrayBuffer = await fileBuffer.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('Buffer created, length:', buffer.length);

    // Return file with appropriate headers
    console.log('Returning file response...');
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
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      fileId: params ? (await params).fileId : 'unknown'
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
